// Glossary Auto-Link Script - Lightweight client-side term detection
// Uses requestIdleCallback and careful DOM manipulation to avoid breaking other scripts

interface GlossaryTerm {
  title: string
  slug: string
  description: string
}

let glossaryTerms: GlossaryTerm[] = []
let glossaryLoaded = false
let tooltip: HTMLElement | null = null
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let isProcessing = false

const linkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>`

const CONFIG = {
  glossaryPath: "en/lexicon/terms",
  excludeSelectors: "code, pre, h1, h2, h3, h4, a, script, style, .glossary-term, .glossary-link, .glossary-popup, .glossary-tooltip, .graph, .toc, .backlinks, .explorer",
  minTermLength: 4,
  maxTermsPerPage: 50,
  initDelay: 800, // Wait for other scripts to finish
}

function extractDescription(content: string): string {
  const cleaned = content
    .replace(/^---[\s\S]*?---\n*/m, "")
    .replace(/\*\*References:\*\*[\s\S]*/m, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .trim()
  const firstSentence = cleaned.split(/[.!?]\s/)[0]
  return firstSentence.length > 180
    ? firstSentence.substring(0, 177) + "..."
    : firstSentence + "."
}

async function loadGlossaryTerms(): Promise<boolean> {
  if (glossaryLoaded) return true

  try {
    const pathParts = window.location.pathname.split("/").filter(Boolean)
    const baseUrl = pathParts.length > 0 && !["en", "fr"].includes(pathParts[0])
      ? `/${pathParts[0]}`
      : ""

    const response = await fetch(`${baseUrl}/static/contentIndex.json`)
    if (!response.ok) return false

    const index = await response.json()

    glossaryTerms = Object.entries(index)
      .filter(([slug]) => slug.includes(CONFIG.glossaryPath))
      .map(([slug, entry]: [string, any]) => ({
        title: entry.title,
        slug: `/${slug}`,
        description: extractDescription(entry.content || ""),
      }))
      .filter(term => term.title && term.title.length >= CONFIG.minTermLength)
      .sort((a, b) => b.title.length - a.title.length)

    glossaryLoaded = true
    return true
  } catch (err) {
    console.warn("Glossary auto-link: failed to load terms")
    return false
  }
}

function getTooltip(): HTMLElement {
  if (!tooltip) {
    tooltip = document.createElement("div")
    tooltip.className = "glossary-tooltip"
    tooltip.innerHTML = `
      <div class="tooltip-title"><span class="tooltip-term"></span></div>
      <div class="tooltip-definition"></div>
      <a class="tooltip-link" href="#">See full definition ${linkIcon}</a>
    `
    document.body.appendChild(tooltip)

    tooltip.onmouseenter = () => {
      if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
    }
    tooltip.onmouseleave = () => hideTooltipDelayed()
  }
  return tooltip
}

function showTooltip(span: HTMLElement) {
  if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }

  const tip = getTooltip()
  const term = span.dataset.term || ""
  const def = span.dataset.definition || ""
  const slug = span.dataset.slug || ""

  ;(tip.querySelector(".tooltip-term") as HTMLElement).textContent = term
  ;(tip.querySelector(".tooltip-definition") as HTMLElement).textContent = def

  const link = tip.querySelector(".tooltip-link") as HTMLAnchorElement
  if (slug) {
    const pathParts = window.location.pathname.split("/")
    const baseUrl = pathParts.length > 1 && !["en", "fr"].includes(pathParts[1]) ? `/${pathParts[1]}` : ""
    link.href = `${baseUrl}${slug}`
    link.style.display = "inline-flex"
  } else {
    link.style.display = "none"
  }

  tip.classList.add("visible")

  // Position
  const rect = span.getBoundingClientRect()
  const tipRect = tip.getBoundingClientRect()
  let top = rect.bottom + 8
  let left = Math.max(20, Math.min(rect.left, window.innerWidth - tipRect.width - 20))

  if (top + tipRect.height > window.innerHeight - 20) {
    top = rect.top - tipRect.height - 8
    tip.classList.remove("tooltip-below")
    tip.classList.add("tooltip-above")
  } else {
    tip.classList.remove("tooltip-above")
    tip.classList.add("tooltip-below")
  }

  tip.style.top = `${top}px`
  tip.style.left = `${left}px`
}

function hideTooltipDelayed() {
  hideTimeout = setTimeout(() => {
    if (tooltip) tooltip.classList.remove("visible")
  }, 150)
}

function isInExcludedArea(node: Node): boolean {
  let el: Element | null = node.nodeType === Node.ELEMENT_NODE
    ? node as Element
    : node.parentElement

  while (el) {
    if (el.matches(CONFIG.excludeSelectors)) return true
    el = el.parentElement
  }
  return false
}

function processArticle(): void {
  if (isProcessing) return
  isProcessing = true

  try {
    const article = document.querySelector("article.popover-hint") || document.querySelector("article")
    if (!article) { isProcessing = false; return }

    // Only process paragraph elements to be safe
    const paragraphs = article.querySelectorAll("p")
    const processedTerms = new Set<string>()
    let termCount = 0

    for (const p of paragraphs) {
      if (termCount >= CONFIG.maxTermsPerPage) break
      if (isInExcludedArea(p)) continue

      // Get HTML and replace terms
      let html = p.innerHTML
      let modified = false

      for (const term of glossaryTerms) {
        if (termCount >= CONFIG.maxTermsPerPage) break
        if (processedTerms.has(term.title.toLowerCase())) continue

        const escaped = term.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const regex = new RegExp(`\\b(${escaped})\\b`, "i")
        const match = html.match(regex)

        if (match && match.index !== undefined) {
          // Check if already inside a tag
          const before = html.substring(0, match.index)
          const openTags = (before.match(/<[^>]*$/g) || []).length
          if (openTags > 0) continue

          const replacement = `<span class="glossary-term" data-term="${term.title}" data-definition="${term.description.replace(/"/g, '&quot;')}" data-slug="${term.slug}">${match[0]}</span>`
          html = html.substring(0, match.index) + replacement + html.substring(match.index + match[0].length)

          processedTerms.add(term.title.toLowerCase())
          modified = true
          termCount++
        }
      }

      if (modified) {
        p.innerHTML = html
      }
    }

    // Add event delegation for tooltips
    if (termCount > 0) {
      article.addEventListener("mouseenter", (e) => {
        const target = e.target as HTMLElement
        if (target.classList.contains("glossary-term")) {
          showTooltip(target)
        }
      }, true)

      article.addEventListener("mouseleave", (e) => {
        const target = e.target as HTMLElement
        if (target.classList.contains("glossary-term")) {
          hideTooltipDelayed()
        }
      }, true)
    }
  } catch (err) {
    console.warn("Glossary auto-link: error during processing", err)
  }

  isProcessing = false
}

async function init(): Promise<void> {
  const loaded = await loadGlossaryTerms()
  if (!loaded || glossaryTerms.length === 0) return

  // Use requestIdleCallback if available, otherwise setTimeout
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(() => processArticle(), { timeout: 2000 })
  } else {
    setTimeout(processArticle, 100)
  }
}

function cleanup(): void {
  if (tooltip) { tooltip.remove(); tooltip = null }
  if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null }
  isProcessing = false
}

// Initialize after a delay to let other scripts finish
document.addEventListener("nav", () => {
  cleanup()
  setTimeout(init, CONFIG.initDelay)
})

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(init, CONFIG.initDelay))
} else {
  setTimeout(init, CONFIG.initDelay)
}
