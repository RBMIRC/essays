// Glossary Auto-Link Script - Client-side term detection and tooltip
// Runs after page load to avoid conflicts with graph/TOC scripts

interface GlossaryTerm {
  title: string
  slug: string
  description: string
  aliases: string[]
}

interface ContentIndexEntry {
  slug: string
  title: string
  content: string
  tags?: string[]
}

let glossaryTerms: GlossaryTerm[] = []
let glossaryLoaded = false
let tooltip: HTMLElement | null = null
let hideTimeout: ReturnType<typeof setTimeout> | null = null

const linkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>`

// Configuration
const CONFIG = {
  glossaryPath: "en/lexicon/terms",
  linkMode: "first" as "first" | "all",
  caseSensitive: false,
  excludeTags: ["code", "pre", "h1", "h2", "h3", "a", "script", "style", "noscript"],
  minTermLength: 3,
}

// Extract first sentence as description from content
function extractDescription(content: string): string {
  // Remove markdown formatting
  const cleaned = content
    .replace(/^---[\s\S]*?---\n*/m, "") // Remove frontmatter
    .replace(/\*\*References:\*\*[\s\S]*/m, "") // Remove references section
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
    .replace(/[*_`#]/g, "") // Remove formatting
    .trim()

  // Get first sentence (up to 200 chars)
  const firstSentence = cleaned.split(/[.!?]\s/)[0]
  if (firstSentence.length > 200) {
    return firstSentence.substring(0, 197) + "..."
  }
  return firstSentence + (firstSentence.endsWith(".") ? "" : ".")
}

// Load glossary terms from content index
async function loadGlossaryTerms(): Promise<void> {
  if (glossaryLoaded) return

  try {
    // Get base URL from current page
    const pathParts = window.location.pathname.split("/").filter(Boolean)
    const baseUrl = pathParts.length > 0 && !["en", "fr"].includes(pathParts[0])
      ? `/${pathParts[0]}`
      : ""

    const response = await fetch(`${baseUrl}/static/contentIndex.json`)
    if (!response.ok) return

    const index: Record<string, ContentIndexEntry> = await response.json()

    // Filter for glossary terms
    glossaryTerms = Object.entries(index)
      .filter(([slug]) => slug.includes(CONFIG.glossaryPath))
      .map(([slug, entry]) => ({
        title: entry.title,
        slug: `/${slug}`,
        description: extractDescription(entry.content),
        aliases: [], // Could be extracted from frontmatter if needed
      }))
      .filter(term => term.title && term.title.length >= CONFIG.minTermLength)

    // Sort by title length (longest first) for better matching
    glossaryTerms.sort((a, b) => b.title.length - a.title.length)

    glossaryLoaded = true
  } catch (err) {
    console.error("Failed to load glossary terms:", err)
  }
}

// Create tooltip element
function createTooltip(): HTMLElement {
  const el = document.createElement("div")
  el.className = "glossary-tooltip"
  el.innerHTML = `
    <div class="tooltip-title">
      <span class="tooltip-term"></span>
    </div>
    <div class="tooltip-definition"></div>
    <a class="tooltip-link" href="#">
      See full definition ${linkIcon}
    </a>
  `
  document.body.appendChild(el)

  el.addEventListener("mouseenter", () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
  })

  el.addEventListener("mouseleave", () => {
    scheduleHide()
  })

  return el
}

// Position tooltip relative to term
function positionTooltip(term: HTMLElement) {
  if (!tooltip) return

  const rect = term.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  let top = rect.bottom + 8
  let left = rect.left

  if (top + tooltipRect.height > viewportHeight - 20) {
    top = rect.top - tooltipRect.height - 8
    tooltip.classList.remove("tooltip-below")
    tooltip.classList.add("tooltip-above")
  } else {
    tooltip.classList.remove("tooltip-above")
    tooltip.classList.add("tooltip-below")
  }

  if (left + tooltipRect.width > viewportWidth - 20) {
    left = viewportWidth - tooltipRect.width - 20
  }

  if (left < 20) {
    left = 20
  }

  tooltip.style.top = `${top}px`
  tooltip.style.left = `${left}px`
}

// Show tooltip for a term
function showTooltip(term: HTMLElement) {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  if (!tooltip) {
    tooltip = createTooltip()
  }

  const termTitle = term.dataset.term || ""
  const definition = term.dataset.definition || ""
  const slug = term.dataset.slug || ""

  const titleEl = tooltip.querySelector(".tooltip-term") as HTMLElement
  const defEl = tooltip.querySelector(".tooltip-definition") as HTMLElement
  const linkEl = tooltip.querySelector(".tooltip-link") as HTMLAnchorElement

  titleEl.textContent = termTitle
  defEl.textContent = definition

  if (slug) {
    const pathParts = window.location.pathname.split("/")
    const baseUrl = pathParts.length > 1 && !["en", "fr"].includes(pathParts[1])
      ? `/${pathParts[1]}`
      : ""
    linkEl.href = `${baseUrl}${slug}`
    linkEl.style.display = "inline-flex"
  } else {
    linkEl.style.display = "none"
  }

  tooltip.classList.add("visible")

  requestAnimationFrame(() => {
    positionTooltip(term)
  })
}

// Schedule tooltip hide
function scheduleHide() {
  hideTimeout = setTimeout(() => {
    if (tooltip) {
      tooltip.classList.remove("visible")
    }
  }, 150)
}

// Check if node should be excluded
function shouldExcludeNode(node: Node): boolean {
  let current: Node | null = node
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as Element
      const tagName = el.tagName.toLowerCase()
      if (CONFIG.excludeTags.includes(tagName)) return true
      if (el.classList.contains("glossary-term")) return true
      if (el.classList.contains("glossary-link")) return true
      if (el.closest(".glossary-popup")) return true
      if (el.closest(".glossary-tooltip")) return true
    }
    current = current.parentNode
  }
  return false
}

// Create regex for term matching
function createTermRegex(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const flags = CONFIG.caseSensitive ? "g" : "gi"
  // Match whole words only
  return new RegExp(`\\b(${escaped})\\b`, flags)
}

// Wrap matching terms in a text node
function processTextNode(textNode: Text, processedTerms: Set<string>): void {
  if (shouldExcludeNode(textNode)) return

  const text = textNode.textContent || ""
  if (text.trim().length < CONFIG.minTermLength) return

  let foundMatch = false
  let matchTerm: GlossaryTerm | null = null
  let matchIndex = -1
  let matchLength = 0

  // Find the first matching term (terms are sorted by length, longest first)
  for (const term of glossaryTerms) {
    // Skip if already processed (for "first" mode)
    if (CONFIG.linkMode === "first" && processedTerms.has(term.title.toLowerCase())) {
      continue
    }

    const regex = createTermRegex(term.title)
    const match = regex.exec(text)

    if (match) {
      foundMatch = true
      matchTerm = term
      matchIndex = match.index
      matchLength = match[0].length
      break
    }
  }

  if (!foundMatch || !matchTerm || matchIndex === -1) return

  // Split the text node and wrap the match
  const before = text.substring(0, matchIndex)
  const matched = text.substring(matchIndex, matchIndex + matchLength)
  const after = text.substring(matchIndex + matchLength)

  const span = document.createElement("span")
  span.className = "glossary-term"
  span.textContent = matched
  span.dataset.term = matchTerm.title
  span.dataset.definition = matchTerm.description
  span.dataset.slug = matchTerm.slug

  // Add event listeners
  span.addEventListener("mouseenter", () => showTooltip(span))
  span.addEventListener("mouseleave", () => scheduleHide())

  const parent = textNode.parentNode
  if (!parent) return

  // Replace the text node with before + span + after
  if (before) {
    parent.insertBefore(document.createTextNode(before), textNode)
  }
  parent.insertBefore(span, textNode)

  // Update the original text node to contain only the "after" text
  textNode.textContent = after

  // Mark as processed
  processedTerms.add(matchTerm.title.toLowerCase())

  // Continue processing the remaining text
  if (after.trim().length >= CONFIG.minTermLength) {
    processTextNode(textNode, processedTerms)
  }
}

// Process all text nodes in the content area
function processContent(): void {
  // Only process the main content area
  const contentArea = document.querySelector("article.popover-hint") ||
                      document.querySelector("article") ||
                      document.querySelector(".page-content")

  if (!contentArea) return

  const processedTerms = new Set<string>()

  // Get all text nodes using TreeWalker
  const walker = document.createTreeWalker(
    contentArea,
    NodeFilter.SHOW_TEXT,
    null
  )

  const textNodes: Text[] = []
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent && node.textContent.trim().length >= CONFIG.minTermLength) {
      textNodes.push(node)
    }
  }

  // Process each text node
  for (const textNode of textNodes) {
    processTextNode(textNode, processedTerms)
  }
}

// Main initialization
async function initGlossaryAutoLink(): Promise<void> {
  await loadGlossaryTerms()

  if (glossaryTerms.length === 0) return

  // Small delay to ensure other scripts (graph, TOC) have initialized
  setTimeout(() => {
    processContent()
  }, 100)
}

// Cleanup on navigation
function cleanupGlossaryAutoLink(): void {
  if (tooltip) {
    tooltip.remove()
    tooltip = null
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

// Run on Quartz navigation
document.addEventListener("nav", () => {
  cleanupGlossaryAutoLink()
  initGlossaryAutoLink()
})

// Initial page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlossaryAutoLink)
} else {
  initGlossaryAutoLink()
}
