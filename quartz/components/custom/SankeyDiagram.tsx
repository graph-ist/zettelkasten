import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import sankeyStyle from "../styles/custom/sankey.scss"
import sankeyScript from "../scripts/custom/sankey.inline"

interface SankeyOptions {
  /** Height of the diagram in pixels */
  height?: number
  /** Show on index page only, or all pages */
  indexOnly?: boolean
}

const defaultOptions: SankeyOptions = {
  height: 400,
  indexOnly: false,
}

export default ((userOpts?: Partial<SankeyOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const SankeyDiagram: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
    // If indexOnly, only render on index page
    if (opts.indexOnly && fileData.slug !== "index") {
      return null
    }

    const currentSlug = fileData.slug || ""

    return (
      <div class={classNames(displayClass, "sankey-container")}>
        <div
          id="sankey-diagram"
          data-slug={currentSlug}
          data-height={opts.height}
        />
      </div>
    )
  }

  SankeyDiagram.css = sankeyStyle
  SankeyDiagram.afterDOMLoaded = sankeyScript

  return SankeyDiagram
}) satisfies QuartzComponentConstructor
