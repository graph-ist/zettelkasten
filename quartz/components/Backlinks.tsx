import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/backlinks.scss"
import { resolveRelative, simplifySlug } from "../util/path"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import script from "./scripts/backlinks.inline"

interface BacklinksOptions {
  hideWhenEmpty: boolean
}

const defaultOptions: BacklinksOptions = {
  hideWhenEmpty: true,
}

export default ((opts?: Partial<BacklinksOptions>) => {
  const options: BacklinksOptions = { ...defaultOptions, ...opts }

  const Backlinks: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const slug = simplifySlug(fileData.slug!)
    const slugLower = slug.toLowerCase()
    // Also check aliases for matching
    const aliases = (fileData.frontmatter?.aliases as string[] | undefined) || []
    const aliasesLower = aliases.map(a => a.toLowerCase().replace(/\s+/g, '-'))
    
    const backlinkFiles = allFiles.filter((file) => {
      if (!file.links) return false
      return file.links.some(link => {
        const linkLower = link.toLowerCase()
        return linkLower === slugLower || aliasesLower.includes(linkLower)
      })
    })
    if (options.hideWhenEmpty && backlinkFiles.length == 0) {
      return null
    }
    return (
      <div class={classNames(displayClass, "backlinks")}>
        <button
          type="button"
          id="backlinks-toggle"
          class="backlinks-header"
          aria-expanded="false"
          aria-controls="backlinks-content"
        >
          <h3>{i18n(cfg.locale).components.backlinks.title}</h3>
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
        </button>
        <div id="backlinks-content" class="backlinks-content collapsed">
          <p class="backlinks-description">
            {i18n(cfg.locale).components.backlinks.description}
          </p>
          <ul class="backlinks-list">
            {backlinkFiles.length > 0 ? (
              backlinkFiles.map((f) => (
                <li class="backlink-item">
                  <a href={resolveRelative(fileData.slug!, f.slug!)} class="internal">
                    {f.frontmatter?.title}
                  </a>
                </li>
              ))
            ) : (
              <li>{i18n(cfg.locale).components.backlinks.noBacklinksFound}</li>
            )}
          </ul>
        </div>
      </div>
    )
  }

  Backlinks.css = style
  Backlinks.afterDOMLoaded = script

  return Backlinks
}) satisfies QuartzComponentConstructor
