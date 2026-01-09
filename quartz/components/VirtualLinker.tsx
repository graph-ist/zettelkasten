import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// @ts-ignore
import script from "./scripts/virtualLinker.inline"
import styles from "./styles/virtualLinker.scss"

const VirtualLinker: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return null
}

VirtualLinker.afterDOMLoaded = script
VirtualLinker.css = styles

export default (() => VirtualLinker) satisfies QuartzComponentConstructor
