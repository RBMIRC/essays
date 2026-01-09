import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import Darkmode from "./Darkmode"
import ExternalLinks from "./ExternalLinks"

const DarkmodeComponent = Darkmode()
const ExternalLinksComponent = ExternalLinks()

const SidebarControls: QuartzComponent = (props: QuartzComponentProps) => {
  return (
    <div class="sidebar-controls">
      <DarkmodeComponent {...props} />
      <ExternalLinksComponent {...props} />
    </div>
  )
}

// Combine CSS and scripts from both components
SidebarControls.css = (DarkmodeComponent.css ?? "") + (ExternalLinksComponent.css ?? "")
SidebarControls.beforeDOMLoaded = DarkmodeComponent.beforeDOMLoaded
SidebarControls.afterDOMLoaded = DarkmodeComponent.afterDOMLoaded

export default (() => SidebarControls) satisfies QuartzComponentConstructor
