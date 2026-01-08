import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

// Compact menu items
const menuItems = [
  { id: "intro", en: "Intro", fr: "Intro", path: "introduction" },
  { id: "bmc", en: "BMC", fr: "BMC", path: "black-mountain-college" },
  { id: "archives", en: "Archives", fr: "Archives", path: "archives" },
  { id: "images", en: "Images", fr: "Images", path: "images" },
  { id: "tactics", en: "Tactics", fr: "Tactiques", path: { en: "tactics", fr: "tactiques" } },
  { id: "commons", en: "Commons", fr: "Communs", path: { en: "commons", fr: "communs" } },
  { id: "lexicon", en: "Lexicon", fr: "Lexique", path: { en: "lexicon", fr: "lexique" } },
]

export default (() => {
  const Navigation: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
    const slugStr = fileData.slug?.toString() ?? ""
    const currentLang: "en" | "fr" = slugStr.startsWith("fr/") ? "fr" : "en"
    const currentPath = slugStr.replace(/^(en|fr)\//, "").replace(/\/$/, "").replace(/\/index$/, "")

    // Build absolute base path from config
    const baseUrl = cfg.baseUrl ? `/${cfg.baseUrl}` : ""

    return (
      <nav class={classNames(displayClass, "main-navigation")}>
        <button
          class="nav-hamburger"
          aria-label="Menu"
          aria-expanded="false"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <ul class="nav-menu">
          {menuItems.map((item) => {
            const itemPath = typeof item.path === "string" ? item.path : item.path[currentLang]

            // Build absolute URL with baseUrl
            // e.g., /essays/en/archives
            const fullUrl = `${baseUrl}/${currentLang}/${itemPath}`

            const isActive = currentPath === itemPath || currentPath.startsWith(itemPath + "/")
            const label = item[currentLang]

            return (
              <li key={item.id} class={isActive ? "nav-item active" : "nav-item"}>
                <a href={fullUrl}>{label}</a>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  Navigation.css = ``

  Navigation.afterDOMLoaded = `
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".nav-hamburger")
  const menu = document.querySelector(".nav-menu")
  
  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open")
      hamburger.setAttribute("aria-expanded", String(isOpen))
    })
    
    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("open")
        hamburger.setAttribute("aria-expanded", "false")
      })
    })
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open")
        hamburger.setAttribute("aria-expanded", "false")
      }
    })
  }
})
`

  return Navigation
}) satisfies QuartzComponentConstructor
