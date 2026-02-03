import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { resolveRelative, simplifySlug } from "../../util/path"
import { buildSlugToFilesMap } from "../../util/graph"
import style from "../styles/custom/frontmatterDisplay.scss"

interface FrontmatterDisplayOptions {
  fields?: string[]
}

const defaultOptions: FrontmatterDisplayOptions = {
  fields: ["cssclasses", "subclasses", "related", "aliases", "reference"],
}

export default ((userOpts?: FrontmatterDisplayOptions) => {
  const opts = { ...defaultOptions, ...userOpts }

  const FrontmatterDisplay: QuartzComponent = ({ fileData, displayClass, allFiles }: QuartzComponentProps) => {
    const frontmatter = fileData.frontmatter
    
    // Use shared utility for slug lookup (includes aliases) - returns ALL matches
    const slugToFiles = buildSlugToFilesMap(allFiles)

    if (!frontmatter) return null

    const fieldsToShow = opts.fields?.filter((field) => {
      const value = frontmatter[field]
      return value && (Array.isArray(value) ? value.length > 0 : true)
    })

    if (!fieldsToShow || fieldsToShow.length === 0) return null

    const formatFieldName = (field: string): string => {
      const names: Record<string, string> = {
        cssclasses: "Classes",
        subclasses: "Subclasses",
        related: "Related",
        aliases: "Aliases",
        reference: "Reference",
      }
      return names[field] || field.charAt(0).toUpperCase() + field.slice(1)
    }

    const parseValue = (value: string): { text: string; slug: string | null; isUrl: boolean; externalUrl?: string } => {
      // Check if it's a URL
      if (value.match(/^https?:\/\//)) {
        return { text: value, slug: null, isUrl: true }
      }
      
      // Check if it's a Markdown link [text](url)
      const markdownLinkMatch = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (markdownLinkMatch) {
        const text = markdownLinkMatch[1]
        const url = markdownLinkMatch[2]
        return { text, slug: null, isUrl: true, externalUrl: url }
      }
      
      // Helper to convert text to Quartz-compatible slug
      // Must match Quartz's sluggify() in util/path.ts
      const toSlug = (text: string): string => {
        return text
          .toLowerCase()
          .replace(/\s/g, "-")             // Spaces → dashes
          .replace(/&/g, "-and-")          // & → -and- (Quartz convention)
          .replace(/%/g, "-percent")       // % → -percent
          .replace(/\?/g, "")              // Remove ?
          .replace(/#/g, "")               // Remove #
      }
      
      // Check if it's a wikilink [[Something]]
      const wikiMatch = value.match(/\[\[([^\]]+)\]\]/)
      if (wikiMatch) {
        const text = wikiMatch[1]
        const slug = toSlug(text)
        return { text, slug, isUrl: false }
      }
      // Plain text - also make it linkable
      const slug = toSlug(value)
      return { text: value, slug, isUrl: false }
    }

    return (
      <details class={classNames(displayClass, "frontmatter-display")}>
        <summary class="frontmatter-toggle">
          <h3>Properties</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="fold"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </summary>
        <div class="frontmatter-content">
          {fieldsToShow.map((field) => {
            const value = frontmatter[field]
            const values = Array.isArray(value) ? value : [value]

            return (
              <div class="frontmatter-field" key={field}>
                <span class="frontmatter-label">{formatFieldName(field)}</span>
                <div class="frontmatter-values">
                  {values.map((v, i) => {
                    const { text, slug, isUrl, externalUrl } = parseValue(String(v))
                    const isLast = i === values.length - 1
                    const separator = isLast ? "" : " · "
                    
                    // It's a URL - render as external link
                    if (isUrl) {
                      const href = externalUrl || text
                      return (
                        <>
                          <a href={href} class="frontmatter-value external" target="_blank" rel="noopener noreferrer" key={i}>
                            {text}
                          </a>
                          {separator}
                        </>
                      )
                    }
                    
                    // Get ALL matching pages for this slug
                    const matchingFiles = slug ? (slugToFiles.get(slug) || []) : []
                    // Filter out self-references
                    const externalFiles = matchingFiles.filter(f => f.slug !== fileData.slug)
                    
                    // All matches are self-references
                    if (matchingFiles.length > 0 && externalFiles.length === 0) {
                      return (
                        <>
                          <span class="frontmatter-value self" key={i}>
                            {text}
                          </span>
                          {separator}
                        </>
                      )
                    }
                    
                    // No matches at all - broken link
                    if (externalFiles.length === 0) {
                      return (
                        <>
                          <span class="frontmatter-value broken" key={i}>
                            {text}
                          </span>
                          {separator}
                        </>
                      )
                    }
                    
                    // Single match - simple link
                    if (externalFiles.length === 1) {
                      const targetFile = externalFiles[0]
                      const href = resolveRelative(fileData.slug!, simplifySlug(targetFile.slug!))
                      return (
                        <>
                          <a href={href} class="frontmatter-value internal" key={i}>
                            {text}
                          </a>
                          {separator}
                        </>
                      )
                    }
                    
                    // Multiple matches - first match is the main link, rest in parentheses
                    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
                    const firstFile = externalFiles[0]
                    const restFiles = externalFiles.slice(1)
                    const firstHref = resolveRelative(fileData.slug!, simplifySlug(firstFile.slug!))
                    const firstTitle = firstFile.frontmatter?.title || firstFile.slug
                    
                    return (
                      <>
                        <span class="frontmatter-value-multi" key={i}>
                          <a href={firstHref} class="frontmatter-value internal" title={firstTitle}>
                            {text}
                          </a>
                          {restFiles.length > 0 && (
                            <>
                              {" "}
                              <span class="frontmatter-multi-links">
                                (
                                {restFiles.map((targetFile, j) => {
                                  const href = resolveRelative(fileData.slug!, simplifySlug(targetFile.slug!))
                                  const label = alphabet[j] || String(j + 1)
                                  const title = targetFile.frontmatter?.title || targetFile.slug
                                  return (
                                    <>
                                      {j > 0 && ", "}
                                      <a href={href} class="frontmatter-value internal" title={title}>
                                        {label}
                                      </a>
                                    </>
                                  )
                                })}
                                )
                              </span>
                            </>
                          )}
                        </span>
                        {separator}
                      </>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </details>
    )
  }

  FrontmatterDisplay.css = style
  return FrontmatterDisplay
}) satisfies QuartzComponentConstructor
