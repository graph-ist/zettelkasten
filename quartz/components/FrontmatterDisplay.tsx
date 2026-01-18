import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { resolveRelative, simplifySlug } from "../util/path"
import { buildSlugToFileMap } from "../util/graph"
import style from "./styles/frontmatterDisplay.scss"

interface FrontmatterDisplayOptions {
  fields?: string[]
}

const defaultOptions: FrontmatterDisplayOptions = {
  fields: ["authors", "movements", "subclasses", "cssclasses"],
}

export default ((userOpts?: FrontmatterDisplayOptions) => {
  const opts = { ...defaultOptions, ...userOpts }

  const FrontmatterDisplay: QuartzComponent = ({ fileData, displayClass, allFiles }: QuartzComponentProps) => {
    const frontmatter = fileData.frontmatter
    
    // Use shared utility for slug lookup (includes aliases)
    const slugToFile = buildSlugToFileMap(allFiles)

    if (!frontmatter) return null

    const fieldsToShow = opts.fields?.filter((field) => {
      const value = frontmatter[field]
      return value && (Array.isArray(value) ? value.length > 0 : true)
    })

    if (!fieldsToShow || fieldsToShow.length === 0) return null

    const formatFieldName = (field: string): string => {
      const names: Record<string, string> = {
        authors: "📚 Authors",
        movements: "🏛️ Movements",
        subclasses: "📂 Subclasses",
        cssclasses: "🏷️ Classes",
        aliases: "🔗 Aliases",
      }
      return names[field] || field.charAt(0).toUpperCase() + field.slice(1)
    }

    const parseValue = (value: string): { text: string; slug: string | null } => {
      // Check if it's a wikilink [[Something]]
      const wikiMatch = value.match(/\[\[([^\]]+)\]\]/)
      if (wikiMatch) {
        const text = wikiMatch[1]
        // Convert to slug: replace spaces with dashes, lowercase
        const slug = text.toLowerCase().replace(/\s+/g, "-")
        return { text, slug }
      }
      // Plain text - also make it linkable
      const slug = value.toLowerCase().replace(/\s+/g, "-")
      return { text: value, slug }
    }

    return (
      <div class={classNames(displayClass, "frontmatter-display")}>
        {fieldsToShow.map((field) => {
          const value = frontmatter[field]
          const values = Array.isArray(value) ? value : [value]

          return (
            <div class="frontmatter-field" key={field}>
              <span class="frontmatter-label">{formatFieldName(field)}</span>
              <div class="frontmatter-values">
                {values.map((v, i) => {
                  const { text, slug } = parseValue(String(v))
                  // Check if the target page exists using shared utility
                  const targetFile = slug ? slugToFile.get(slug) : null
                  const linkExists = targetFile !== null && targetFile !== undefined
                  const linkClass = linkExists 
                    ? "frontmatter-value internal" 
                    : "frontmatter-value internal broken"
                  // Use resolveRelative for proper path handling with baseUrl
                  const href = linkExists 
                    ? resolveRelative(fileData.slug!, simplifySlug(targetFile!.slug!))
                    : `./${slug}`
                  return (
                    <a href={href} class={linkClass} key={i}>
                      {text}
                    </a>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  FrontmatterDisplay.css = style
  return FrontmatterDisplay
}) satisfies QuartzComponentConstructor
