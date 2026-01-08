import { computePosition, flip, shift, offset } from "@floating-ui/dom"
import { normalizeRelativeURLs } from "../../util/path"
import { fetchCanonical } from "./util"

const p = new DOMParser()
let activePopup: HTMLElement | null = null
let activeLink: HTMLAnchorElement | null = null
let popupZIndex = 1000
let hideTimeout: ReturnType<typeof setTimeout> | null = null

// Icons
const pinIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`
const linkIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>`
const closeIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`

// Check if link is a glossary/lexicon link
function isGlossaryLink(link: HTMLAnchorElement): boolean {
  const href = link.getAttribute("href") || ""
  return href.includes("/lexicon/") || href.includes("/figures/") || href.includes("/lexique/")
}

// Make element draggable via its toolbar
function makeDraggable(el: HTMLElement) {
  const toolbar = el.querySelector(".glossary-popup-toolbar") as HTMLElement
  if (!toolbar) return

  let offsetX = 0, offsetY = 0, isDragging = false

  toolbar.style.cursor = "move"

  toolbar.addEventListener("mousedown", (e) => {
    if ((e.target as HTMLElement).closest(".glossary-popup-btn")) return
    isDragging = true
    offsetX = e.clientX - el.getBoundingClientRect().left
    offsetY = e.clientY - el.getBoundingClientRect().top
    el.style.zIndex = String(++popupZIndex)
  })

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return
    el.style.left = `${e.clientX - offsetX}px`
    el.style.top = `${e.clientY - offsetY}px`
  })

  document.addEventListener("mouseup", () => {
    isDragging = false
  })
}

// Create popup for glossary term
function createPopup(content: HTMLElement, title: string, url: string, link: HTMLAnchorElement): HTMLElement {
  const popup = document.createElement("div")
  popup.className = "glossary-popup"
  popup.innerHTML = `
    <div class="glossary-popup-toolbar">
      <span class="glossary-popup-title">${title}</span>
      <div class="glossary-popup-buttons">
        <button class="glossary-popup-btn pin-btn" title="Pin">${pinIcon}</button>
        <button class="glossary-popup-btn link-btn" title="Go to page">${linkIcon}</button>
        <button class="glossary-popup-btn close-btn" title="Close">${closeIcon}</button>
      </div>
    </div>
    <div class="glossary-popup-content"></div>
  `

  const contentDiv = popup.querySelector(".glossary-popup-content") as HTMLElement
  contentDiv.appendChild(content)

  document.body.appendChild(popup)

  // Position popup near the link using floating-ui
  computePosition(link, popup, {
    placement: "right-start",
    middleware: [offset(10), flip(), shift({ padding: 10 })]
  }).then(({ x, y }) => {
    popup.style.left = `${x}px`
    popup.style.top = `${y}px`
  })

  popup.style.zIndex = String(++popupZIndex)

  // Keep popup open when hovering over it
  popup.addEventListener("mouseenter", () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
  })

  popup.addEventListener("mouseleave", () => {
    if (!popup.classList.contains("pinned")) {
      hideTimeout = setTimeout(() => {
        popup.remove()
        if (activePopup === popup) {
          activePopup = null
          activeLink = null
        }
      }, 150)
    }
  })

  // Pin button
  const pinBtn = popup.querySelector(".pin-btn") as HTMLButtonElement
  pinBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    e.preventDefault()

    if (!popup.classList.contains("pinned")) {
      popup.classList.add("pinned")
      pinBtn.classList.add("active")
      makeDraggable(popup)
    } else {
      popup.classList.remove("pinned")
      pinBtn.classList.remove("active")
    }
  })

  // Link button - navigate to page
  const linkBtn = popup.querySelector(".link-btn") as HTMLButtonElement
  linkBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    e.preventDefault()
    window.location.href = url
  })

  // Close button
  const closeBtn = popup.querySelector(".close-btn") as HTMLButtonElement
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    e.preventDefault()
    popup.remove()
    if (activePopup === popup) {
      activePopup = null
      activeLink = null
    }
  })

  return popup
}

// Fetch content and show popup on hover
async function showGlossaryPopup(link: HTMLAnchorElement) {
  // Don't create duplicate for same link
  if (activeLink === link && activePopup) return

  const targetUrl = new URL(link.href)
  targetUrl.hash = ""
  targetUrl.search = ""

  try {
    const response = await fetchCanonical(targetUrl)
    if (!response) return

    // Check if we're still hovering this link
    if (activeLink !== link) return

    const contents = await response.text()
    const html = p.parseFromString(contents, "text/html")
    normalizeRelativeURLs(html, targetUrl)

    // Get title
    const titleEl = html.querySelector("h1.article-title, h1, .page-title")
    const title = titleEl?.textContent || link.textContent || "Definition"

    // Get content
    const article = html.querySelector("article.popover-hint") ||
                    html.querySelector("article") ||
                    html.querySelector(".page-content") ||
                    html.querySelector("main")

    if (!article) return

    // Clone content
    const contentClone = article.cloneNode(true) as HTMLElement
    contentClone.querySelectorAll("script").forEach(s => s.remove())
    contentClone.querySelectorAll("[id]").forEach((el) => {
      el.id = `glossary-popup-${el.id}`
    })

    // Close existing non-pinned popup
    if (activePopup && !activePopup.classList.contains("pinned")) {
      activePopup.remove()
    }

    // Create and show popup
    const popup = createPopup(contentClone, title, link.href, link)
    activePopup = popup

  } catch (err) {
    console.error("Error fetching glossary content:", err)
  }
}

// Mouse enter handler
function glossaryMouseEnterHandler(this: HTMLAnchorElement) {
  if (!isGlossaryLink(this)) return

  // Clear any pending hide
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  activeLink = this
  showGlossaryPopup(this)
}

// Mouse leave handler
function glossaryMouseLeaveHandler(this: HTMLAnchorElement) {
  if (!isGlossaryLink(this)) return

  // Delay hiding to allow moving to popup
  hideTimeout = setTimeout(() => {
    if (activePopup && !activePopup.classList.contains("pinned")) {
      activePopup.remove()
      activePopup = null
      activeLink = null
    }
  }, 150)
}

// Click handler - prevent navigation, let hover handle it
function glossaryClickHandler(this: HTMLAnchorElement, e: MouseEvent) {
  if (!isGlossaryLink(this)) return

  // Ctrl/Cmd+click = normal navigation
  if (e.ctrlKey || e.metaKey) return

  // Prevent default navigation - use the link button in popup instead
  e.preventDefault()
}

document.addEventListener("nav", () => {
  // Clear all popups on navigation
  document.querySelectorAll(".glossary-popup").forEach(el => el.remove())
  activePopup = null
  activeLink = null
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  const links = [...document.querySelectorAll("a.internal")] as HTMLAnchorElement[]
  for (const link of links) {
    if (isGlossaryLink(link)) {
      link.classList.add("glossary-link")
      link.addEventListener("mouseenter", glossaryMouseEnterHandler)
      link.addEventListener("mouseleave", glossaryMouseLeaveHandler)
      link.addEventListener("click", glossaryClickHandler)

      window.addCleanup(() => {
        link.removeEventListener("mouseenter", glossaryMouseEnterHandler)
        link.removeEventListener("mouseleave", glossaryMouseLeaveHandler)
        link.removeEventListener("click", glossaryClickHandler)
      })
    }
  }
})
