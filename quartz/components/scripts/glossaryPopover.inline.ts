import { normalizeRelativeURLs } from "../../util/path"
import { fetchCanonical } from "./util"

const p = new DOMParser()
let hoverPopup: HTMLElement | null = null
let hoverLink: HTMLAnchorElement | null = null
let popupZIndex = 9000
let hideTimeout: ReturnType<typeof setTimeout> | null = null
const pinnedPopups: Set<HTMLElement> = new Set()

// Icons
const pinIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`
const linkIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>`
const closeIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`

function isGlossaryLink(link: HTMLAnchorElement): boolean {
  const href = link.getAttribute("href") || ""
  return href.includes("/lexicon/") || href.includes("/figures/") || href.includes("/lexique/") || href.includes("/terms/")
}

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
  document.addEventListener("mouseup", () => { isDragging = false })
}

function createPopup(content: HTMLElement, title: string, url: string, rect: DOMRect): HTMLElement {
  const popup = document.createElement("div")
  popup.className = "glossary-popup"
  popup.style.cssText = `
    position: fixed;
    left: ${Math.min(rect.right + 10, window.innerWidth - 420)}px;
    top: ${Math.min(rect.top, window.innerHeight - 400)}px;
    z-index: ${++popupZIndex};
    width: 400px;
    max-height: 450px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `

  popup.innerHTML = `
    <div class="glossary-popup-toolbar" style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;background:#f5f5f5;border-bottom:1px solid #ddd;">
      <span class="glossary-popup-title" style="font-weight:600;font-size:0.9rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title}</span>
      <div class="glossary-popup-buttons" style="display:flex;gap:0.25rem;">
        <button class="glossary-popup-btn pin-btn" title="Pin" style="background:none;border:none;cursor:pointer;padding:4px;">${pinIcon}</button>
        <button class="glossary-popup-btn link-btn" title="Go to page" style="background:none;border:none;cursor:pointer;padding:4px;">${linkIcon}</button>
        <button class="glossary-popup-btn close-btn" title="Close" style="background:none;border:none;cursor:pointer;padding:4px;">${closeIcon}</button>
      </div>
    </div>
    <div class="glossary-popup-content" style="overflow-y:auto;padding:0.75rem;flex:1;max-height:380px;"></div>
  `

  const contentDiv = popup.querySelector(".glossary-popup-content") as HTMLElement
  contentDiv.appendChild(content)

  // Keep popup open when hovering
  popup.addEventListener("mouseenter", () => {
    if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
  })
  popup.addEventListener("mouseleave", () => {
    if (!popup.classList.contains("pinned")) {
      hideTimeout = setTimeout(() => {
        popup.remove()
        if (hoverPopup === popup) { hoverPopup = null; hoverLink = null }
      }, 200)
    }
  })

  // Pin button
  const pinBtn = popup.querySelector(".pin-btn") as HTMLButtonElement
  pinBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!popup.classList.contains("pinned")) {
      if (pinnedPopups.size >= 8) {
        const oldest = pinnedPopups.values().next().value
        if (oldest) { oldest.remove(); pinnedPopups.delete(oldest) }
      }
      popup.classList.add("pinned")
      popup.style.borderColor = "#284b63"
      pinBtn.style.background = "#284b63"
      pinBtn.style.color = "white"
      pinnedPopups.add(popup)
      makeDraggable(popup)
      if (hoverPopup === popup) { hoverPopup = null; hoverLink = null }
    } else {
      popup.classList.remove("pinned")
      popup.style.borderColor = "#ccc"
      pinBtn.style.background = "none"
      pinBtn.style.color = "inherit"
      pinnedPopups.delete(popup)
    }
  })

  // Link button
  popup.querySelector(".link-btn")?.addEventListener("click", (e) => {
    e.stopPropagation()
    e.preventDefault()
    window.location.href = url
  })

  // Close button
  popup.querySelector(".close-btn")?.addEventListener("click", (e) => {
    e.stopPropagation()
    e.preventDefault()
    popup.remove()
    pinnedPopups.delete(popup)
    if (hoverPopup === popup) { hoverPopup = null; hoverLink = null }
  })

  document.body.appendChild(popup)
  return popup
}

async function showGlossaryPopup(link: HTMLAnchorElement) {
  if (hoverLink === link && hoverPopup) return

  const targetUrl = new URL(link.href)
  targetUrl.hash = ""
  targetUrl.search = ""

  try {
    const response = await fetchCanonical(targetUrl)
    if (!response) return
    if (hoverLink !== link) return

    const contents = await response.text()
    const html = p.parseFromString(contents, "text/html")
    normalizeRelativeURLs(html, targetUrl)

    const articleTitle = html.querySelector("article h1.article-title") ||
                         html.querySelector("article h1") ||
                         html.querySelector(".article-title") ||
                         html.querySelector("h1.article-title")
    const metaTitle = html.querySelector('meta[property="og:title"]')?.getAttribute("content")
    const title = articleTitle?.textContent?.trim() || metaTitle || link.textContent?.trim() || "Definition"

    const article = html.querySelector("article.popover-hint") ||
                    html.querySelector("article") ||
                    html.querySelector(".page-content") ||
                    html.querySelector("main")
    if (!article) return

    const contentClone = article.cloneNode(true) as HTMLElement
    contentClone.querySelectorAll("script").forEach(s => s.remove())

    if (hoverPopup) { hoverPopup.remove(); hoverPopup = null }

    const rect = link.getBoundingClientRect()
    const popup = createPopup(contentClone, title, link.href, rect)
    hoverPopup = popup

  } catch (err) {
    console.error("Glossary popup error:", err)
  }
}

function glossaryMouseEnterHandler(this: HTMLAnchorElement) {
  if (!isGlossaryLink(this)) return
  if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }

  // If hovering a different link, close the current popup immediately
  if (hoverLink !== this && hoverPopup && !hoverPopup.classList.contains("pinned")) {
    hoverPopup.remove()
    hoverPopup = null
  }

  hoverLink = this
  showGlossaryPopup(this)
}

function glossaryMouseLeaveHandler(this: HTMLAnchorElement) {
  if (!isGlossaryLink(this)) return
  hideTimeout = setTimeout(() => {
    if (hoverPopup && !hoverPopup.classList.contains("pinned")) {
      hoverPopup.remove()
      hoverPopup = null
      hoverLink = null
    }
  }, 200)
}

function glossaryClickHandler(this: HTMLAnchorElement, e: MouseEvent) {
  if (!isGlossaryLink(this)) return
  if (e.ctrlKey || e.metaKey) return
  e.preventDefault()
}

function initGlossaryLinks() {
  const allLinks = [...document.querySelectorAll("a[href]")] as HTMLAnchorElement[]
  for (const link of allLinks) {
    if (isGlossaryLink(link) && !link.classList.contains("glossary-link")) {
      link.classList.add("glossary-link")
      link.dataset.noPopover = "true"
      link.addEventListener("mouseenter", glossaryMouseEnterHandler)
      link.addEventListener("mouseleave", glossaryMouseLeaveHandler)
      link.addEventListener("click", glossaryClickHandler)
    }
  }
}

function cleanupGlossary() {
  document.querySelectorAll(".glossary-popup").forEach(el => el.remove())
  hoverPopup = null
  hoverLink = null
  pinnedPopups.clear()
  if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
}

// Run on Quartz navigation
document.addEventListener("nav", () => {
  cleanupGlossary()
  initGlossaryLinks()
})

// Also run on initial page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlossaryLinks)
} else {
  initGlossaryLinks()
}
