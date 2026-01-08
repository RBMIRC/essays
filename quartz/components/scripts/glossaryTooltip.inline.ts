// Glossary Tooltip Script - Shows tooltip on hover for auto-linked terms

let tooltip: HTMLElement | null = null
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let currentTerm: HTMLElement | null = null

const linkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>`

function createTooltip(): HTMLElement {
  const el = document.createElement("div")
  el.className = "glossary-tooltip"
  el.innerHTML = `
    <div class="tooltip-title">
      <span class="tooltip-term"></span>
      <span class="tooltip-author"></span>
    </div>
    <div class="tooltip-definition"></div>
    <a class="tooltip-link" href="#">
      Voir la définition complète ${linkIcon}
    </a>
  `
  document.body.appendChild(el)

  // Keep tooltip open when hovering over it
  el.addEventListener("mouseenter", () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
  })

  el.addEventListener("mouseleave", () => {
    hideTooltip()
  })

  return el
}

function positionTooltip(term: HTMLElement) {
  if (!tooltip) return

  const rect = term.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  // Default: show below the term
  let top = rect.bottom + 8
  let left = rect.left

  // Check if tooltip would go off the bottom of the screen
  if (top + tooltipRect.height > viewportHeight - 20) {
    // Show above instead
    top = rect.top - tooltipRect.height - 8
    tooltip.classList.remove("tooltip-below")
    tooltip.classList.add("tooltip-above")
  } else {
    tooltip.classList.remove("tooltip-above")
    tooltip.classList.add("tooltip-below")
  }

  // Check if tooltip would go off the right of the screen
  if (left + tooltipRect.width > viewportWidth - 20) {
    left = viewportWidth - tooltipRect.width - 20
  }

  // Check if tooltip would go off the left of the screen
  if (left < 20) {
    left = 20
  }

  tooltip.style.top = `${top}px`
  tooltip.style.left = `${left}px`
}

function showTooltip(term: HTMLElement) {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  if (!tooltip) {
    tooltip = createTooltip()
  }

  currentTerm = term

  // Get data from the term element
  const termTitle = term.dataset.term || term.textContent || ""
  const definition = term.dataset.definition || ""
  const author = term.dataset.author || ""
  const slug = term.dataset.slug || ""

  // Update tooltip content
  const titleEl = tooltip.querySelector(".tooltip-term") as HTMLElement
  const authorEl = tooltip.querySelector(".tooltip-author") as HTMLElement
  const defEl = tooltip.querySelector(".tooltip-definition") as HTMLElement
  const linkEl = tooltip.querySelector(".tooltip-link") as HTMLAnchorElement

  titleEl.textContent = termTitle
  authorEl.textContent = author ? `(${author})` : ""
  defEl.textContent = definition

  if (slug) {
    // Get baseUrl from the page URL structure
    // The slug is like "/en/lexicon/terms/term-name"
    // We need to prepend the base path if it exists
    const pathParts = window.location.pathname.split("/")
    // Find the base (e.g., "essays") - it's typically the first non-empty segment
    const baseUrl = pathParts.length > 1 && pathParts[1] !== "en" && pathParts[1] !== "fr"
      ? `/${pathParts[1]}`
      : ""
    linkEl.href = `${baseUrl}${slug}`
    linkEl.style.display = "inline-flex"
  } else {
    linkEl.style.display = "none"
  }

  // Position and show
  tooltip.classList.add("visible")

  // Position after making visible to get accurate dimensions
  requestAnimationFrame(() => {
    positionTooltip(term)
  })
}

function hideTooltip() {
  hideTimeout = setTimeout(() => {
    if (tooltip) {
      tooltip.classList.remove("visible")
    }
    currentTerm = null
  }, 150)
}

function handleMouseEnter(e: Event) {
  const term = e.target as HTMLElement
  if (!term.classList.contains("glossary-term")) return
  showTooltip(term)
}

function handleMouseLeave(e: Event) {
  const term = e.target as HTMLElement
  if (!term.classList.contains("glossary-term")) return
  hideTooltip()
}

function initGlossaryTooltips() {
  // Use event delegation on the document for better performance
  document.addEventListener("mouseenter", handleMouseEnter, true)
  document.addEventListener("mouseleave", handleMouseLeave, true)
}

function cleanupGlossaryTooltips() {
  if (tooltip) {
    tooltip.remove()
    tooltip = null
  }
  currentTerm = null
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

// Initialize on page load and navigation
document.addEventListener("nav", () => {
  cleanupGlossaryTooltips()
  initGlossaryTooltips()
})

// Initial page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlossaryTooltips)
} else {
  initGlossaryTooltips()
}
