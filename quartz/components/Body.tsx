// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
// @ts-ignore
import lightboxScript from "./scripts/lightbox.inline"
// @ts-ignore
import glossaryPopoverScript from "./scripts/glossaryPopover.inline"
import clipboardStyle from "./styles/clipboard.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

Body.afterDOMLoaded = clipboardScript + lightboxScript + glossaryPopoverScript
Body.css = clipboardStyle

export default (() => Body) satisfies QuartzComponentConstructor
