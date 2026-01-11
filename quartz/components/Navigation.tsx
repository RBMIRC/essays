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
  { id: "gallery", en: "Gallery", fr: "Galerie", path: "_gallery", absolute: true },
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
          <button class="nav-close" aria-label="Close menu" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {menuItems.map((item) => {
            const itemPath = typeof item.path === "string" ? item.path : item.path[currentLang]

            // Build URL - handle absolute paths (like gallery) differently
            let fullUrl: string
            if ((item as any).absolute) {
              // Absolute path - just use baseUrl + path (without language prefix)
              fullUrl = `${baseUrl}/gallery`
            } else {
              // Normal path with language prefix
              fullUrl = `${baseUrl}/${currentLang}/${itemPath}`
            }

            const isActive = currentPath === itemPath || currentPath.startsWith(itemPath + "/") ||
              ((item as any).absolute && slugStr === "gallery")
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
document.addEventListener("nav", () => {
  const hamburger = document.querySelector(".nav-hamburger")
  const menu = document.querySelector(".nav-menu")
  const closeBtn = document.querySelector(".nav-close")

  if (!hamburger || !menu) return

  function closeMenu() {
    menu.classList.remove("open")
    hamburger.setAttribute("aria-expanded", "false")
    document.body.style.overflow = ""
  }

  function openMenu() {
    menu.classList.add("open")
    hamburger.setAttribute("aria-expanded", "true")
    document.body.style.overflow = "hidden"
  }

  const handleHamburgerClick = () => {
    if (menu.classList.contains("open")) {
      closeMenu()
    } else {
      openMenu()
    }
  }

  const handleCloseClick = () => closeMenu()

  const handleLinkClick = () => closeMenu()

  const handleKeydown = (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      closeMenu()
    }
  }

  hamburger.addEventListener("click", handleHamburgerClick)
  if (closeBtn) closeBtn.addEventListener("click", handleCloseClick)
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", handleLinkClick)
  })
  document.addEventListener("keydown", handleKeydown)

  window.addCleanup(() => {
    hamburger.removeEventListener("click", handleHamburgerClick)
    if (closeBtn) closeBtn.removeEventListener("click", handleCloseClick)
    document.removeEventListener("keydown", handleKeydown)
  })
})
`

  return Navigation
}) satisfies QuartzComponentConstructor
