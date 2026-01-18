import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import script from "../scripts/custom/virtualLinker.inline"
import styles from "../styles/custom/virtualLinker.scss"

const VirtualLinker: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return null
}

VirtualLinker.afterDOMLoaded = script
VirtualLinker.css = styles

export default (() => VirtualLinker) satisfies QuartzComponentConstructor
