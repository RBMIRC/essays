import { computePosition, flip, inline, shift } from "@floating-ui/dom"
import { normalizeRelativeURLs } from "../../util/path"
import { fetchCanonical } from "./util"

const p = new DOMParser()
let activeGlossaryAnchor: HTMLAnchorElement | null = null
const pinnedPanels: Map<string, HTMLElement> = new Map()
let panelZIndex = 1000

// Check if link is a glossary/lexicon link
function isGlossaryLink(link: HTMLAnchorElement): boolean {
  const href = link.getAttribute("href") || ""
  return href.includes("/lexicon/") || href.includes("/figures/") || href.includes("/lexique/")
}

// Make panel draggable
function makeDraggable(panel: HTMLElement, header: HTMLElement) {
  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0

  header.style.cursor = "move"

  header.addEventListener("mousedown", (e) => {
    if ((e.target as HTMLElement).classList.contains("glossary-panel-close")) return
    isDragging = true
    startX = e.clientX
    startY = e.clientY
    const rect = panel.getBoundingClientRect()
    initialX = rect.left
    initialY = rect.top
    panel.style.zIndex = String(++panelZIndex)
    e.preventDefault()
  })

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    panel.style.left = `${initialX + deltaX}px`
    panel.style.top = `${initialY + deltaY}px`
    panel.style.transform = "none"
  })

  document.addEventListener("mouseup", () => {
    isDragging = false
  })
}

// Create pinned panel
function createPinnedPanel(content: HTMLElement, title: string, url: string): HTMLElement {
  const panel = document.createElement("div")
  panel.className = "glossary-panel pinned"
  panel.id = `glossary-panel-${url.replace(/[^a-zA-Z0-9]/g, "-")}`

  const header = document.createElement("div")
  header.className = "glossary-panel-header"

  const titleEl = document.createElement("span")
  titleEl.className = "glossary-panel-title"
  titleEl.textContent = title

  const closeBtn = document.createElement("button")
  closeBtn.className = "glossary-panel-close"
  closeBtn.innerHTML = "×"
  closeBtn.title = "Close"
  closeBtn.addEventListener("click", () => {
    panel.remove()
    pinnedPanels.delete(url)
  })

  header.appendChild(titleEl)
  header.appendChild(closeBtn)

  const body = document.createElement("div")
  body.className = "glossary-panel-body"
  body.appendChild(content)

  panel.appendChild(header)
  panel.appendChild(body)

  // Position in cascade
  const existingPanels = pinnedPanels.size
  panel.style.left = `${100 + existingPanels * 30}px`
  panel.style.top = `${100 + existingPanels * 30}px`
  panel.style.zIndex = String(++panelZIndex)

  makeDraggable(panel, header)

  return panel
}

async function glossaryMouseEnterHandler(
  this: HTMLAnchorElement,
  { clientX, clientY }: { clientX: number; clientY: number },
) {
  if (!isGlossaryLink(this)) return

  const link = (activeGlossaryAnchor = this)
  if (link.dataset.noPopover === "true") return

  async function setPosition(popoverElement: HTMLElement) {
    const { x, y } = await computePosition(link, popoverElement, {
      strategy: "fixed",
      middleware: [inline({ x: clientX, y: clientY }), shift(), flip()],
    })
    Object.assign(popoverElement.style, {
      transform: `translate(${x.toFixed()}px, ${y.toFixed()}px)`,
    })
  }

  function showPopover(popoverElement: HTMLElement) {
    clearGlossaryPopover()
    popoverElement.classList.add("active-popover")
    setPosition(popoverElement as HTMLElement)
  }

  const targetUrl = new URL(link.href)
  const hash = decodeURIComponent(targetUrl.hash)
  targetUrl.hash = ""
  targetUrl.search = ""
  const popoverId = `glossary-popover-${link.pathname}`
  const prevPopoverElement = document.getElementById(popoverId)

  if (prevPopoverElement) {
    showPopover(prevPopoverElement as HTMLElement)
    return
  }

  const response = await fetchCanonical(targetUrl).catch((err) => {
    console.error(err)
  })

  if (!response) return

  const contents = await response.text()
  const html = p.parseFromString(contents, "text/html")
  normalizeRelativeURLs(html, targetUrl)

  // Get title
  const titleEl = html.querySelector("h1.article-title, h1, .page-title")
  const title = titleEl?.textContent || link.textContent || "Definition"

  // Get content - look for article content or main content
  const article = html.querySelector("article.popover-hint") ||
                  html.querySelector("article") ||
                  html.querySelector(".page-content") ||
                  html.querySelector("main")

  if (!article) return

  // Create popover element
  const popoverElement = document.createElement("div")
  popoverElement.id = popoverId
  popoverElement.classList.add("popover", "glossary-popover")

  const popoverInner = document.createElement("div")
  popoverInner.classList.add("popover-inner", "glossary-popover-inner")

  // Add pin button
  const pinBtn = document.createElement("button")
  pinBtn.className = "glossary-pin-btn"
  pinBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`
  pinBtn.title = "Pin this definition"
  pinBtn.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()

    const panelUrl = targetUrl.pathname
    if (pinnedPanels.has(panelUrl)) return

    const panelContent = article.cloneNode(true) as HTMLElement
    const panel = createPinnedPanel(panelContent, title, panelUrl)
    document.body.appendChild(panel)
    pinnedPanels.set(panelUrl, panel)

    clearGlossaryPopover()
  })

  const headerDiv = document.createElement("div")
  headerDiv.className = "glossary-popover-header"
  headerDiv.appendChild(pinBtn)

  popoverInner.appendChild(headerDiv)

  // Clone and add content
  const contentClone = article.cloneNode(true) as HTMLElement
  // Remove any scripts
  contentClone.querySelectorAll("script").forEach(s => s.remove())
  // Prepend IDs to prevent duplicates
  contentClone.querySelectorAll("[id]").forEach((el) => {
    el.id = `glossary-popover-internal-${el.id}`
  })

  popoverInner.appendChild(contentClone)
  popoverElement.appendChild(popoverInner)

  if (document.getElementById(popoverId)) return

  document.body.appendChild(popoverElement)
  if (activeGlossaryAnchor !== this) return

  showPopover(popoverElement)
}

function clearGlossaryPopover() {
  activeGlossaryAnchor = null
  const allPopoverElements = document.querySelectorAll(".glossary-popover")
  allPopoverElements.forEach((el) => el.classList.remove("active-popover"))
}

// Click handler to pin on click
function glossaryClickHandler(this: HTMLAnchorElement, e: MouseEvent) {
  if (!isGlossaryLink(this)) return

  // If ctrl/cmd is pressed, allow normal navigation
  if (e.ctrlKey || e.metaKey) return

  e.preventDefault()

  const targetUrl = new URL(this.href)
  const panelUrl = targetUrl.pathname

  // If already pinned, bring to front
  if (pinnedPanels.has(panelUrl)) {
    const panel = pinnedPanels.get(panelUrl)!
    panel.style.zIndex = String(++panelZIndex)
    return
  }

  // Fetch and create pinned panel
  fetchCanonical(targetUrl).then(async (response) => {
    if (!response) return

    const contents = await response.text()
    const html = p.parseFromString(contents, "text/html")
    normalizeRelativeURLs(html, targetUrl)

    const titleEl = html.querySelector("h1.article-title, h1, .page-title")
    const title = titleEl?.textContent || this.textContent || "Definition"

    const article = html.querySelector("article.popover-hint") ||
                    html.querySelector("article") ||
                    html.querySelector(".page-content") ||
                    html.querySelector("main")

    if (!article) return

    const panelContent = article.cloneNode(true) as HTMLElement
    panelContent.querySelectorAll("script").forEach(s => s.remove())

    const panel = createPinnedPanel(panelContent, title, panelUrl)
    document.body.appendChild(panel)
    pinnedPanels.set(panelUrl, panel)

    clearGlossaryPopover()
  }).catch(console.error)
}

document.addEventListener("nav", () => {
  // Clear pinned panels on navigation
  pinnedPanels.forEach(panel => panel.remove())
  pinnedPanels.clear()

  const links = [...document.querySelectorAll("a.internal")] as HTMLAnchorElement[]
  for (const link of links) {
    if (isGlossaryLink(link)) {
      link.classList.add("glossary-link")
      link.addEventListener("mouseenter", glossaryMouseEnterHandler)
      link.addEventListener("mouseleave", clearGlossaryPopover)
      link.addEventListener("click", glossaryClickHandler)

      window.addCleanup(() => {
        link.removeEventListener("mouseenter", glossaryMouseEnterHandler)
        link.removeEventListener("mouseleave", clearGlossaryPopover)
        link.removeEventListener("click", glossaryClickHandler)
      })
    }
  }
})
