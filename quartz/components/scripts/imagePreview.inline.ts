interface ImagePopup {
  id: string
  element: HTMLElement
  isPinned: boolean
  isDragging: boolean
  offsetX: number
  offsetY: number
}

const popups: Map<string, ImagePopup> = new Map()
let hoverTimer: number | null = null
let currentHoverPopup: string | null = null

function createPopup(img: HTMLImageElement, x: number, y: number): ImagePopup {
  const id = `popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const popup = document.createElement('div')
  popup.className = 'image-preview-popup'
  popup.id = id
  popup.style.left = `${x}px`
  popup.style.top = `${y}px`
  
  // Header with controls
  const header = document.createElement('div')
  header.className = 'image-preview-header'
  
  const pinBtn = document.createElement('button')
  pinBtn.className = 'image-preview-pin'
  pinBtn.innerHTML = '📌'
  pinBtn.title = 'Pin popup'
  pinBtn.setAttribute('aria-label', 'Pin popup')
  
  const closeBtn = document.createElement('button')
  closeBtn.className = 'image-preview-close'
  closeBtn.innerHTML = '✕'
  closeBtn.title = 'Close'
  closeBtn.setAttribute('aria-label', 'Close popup')
  
  header.appendChild(pinBtn)
  header.appendChild(closeBtn)
  
  // Image container
  const imgContainer = document.createElement('div')
  imgContainer.className = 'image-preview-content'
  
  const previewImg = document.createElement('img')
  previewImg.src = img.src
  previewImg.alt = img.alt || 'Image preview'
  previewImg.loading = 'eager'
  
  imgContainer.appendChild(previewImg)
  
  // Caption if alt text exists
  if (img.alt) {
    const caption = document.createElement('div')
    caption.className = 'image-preview-caption'
    caption.textContent = img.alt
    imgContainer.appendChild(caption)
  }
  
  popup.appendChild(header)
  popup.appendChild(imgContainer)
  document.body.appendChild(popup)
  
  const popupData: ImagePopup = {
    id,
    element: popup,
    isPinned: false,
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
  }
  
  popups.set(id, popupData)
  
  // Event listeners
  pinBtn.addEventListener('click', () => togglePin(id))
  closeBtn.addEventListener('click', () => closePopup(id))
  
  // Make draggable when pinned
  header.addEventListener('mousedown', (e) => startDrag(e, id))
  
  // Close on outside click (only if not pinned)
  popup.addEventListener('mouseleave', () => {
    const data = popups.get(id)
    if (data && !data.isPinned && id === currentHoverPopup) {
      setTimeout(() => {
        if (!data.isPinned) closePopup(id)
      }, 100)
    }
  })
  
  // Position popup near cursor but keep in viewport
  positionPopup(popup, x, y)
  
  // Fade in
  requestAnimationFrame(() => {
    popup.classList.add('visible')
  })
  
  return popupData
}

function positionPopup(popup: HTMLElement, x: number, y: number) {
  const rect = popup.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let finalX = x + 20
  let finalY = y + 20
  
  // Keep within viewport
  if (finalX + rect.width > viewportWidth) {
    finalX = x - rect.width - 20
  }
  if (finalY + rect.height > viewportHeight) {
    finalY = viewportHeight - rect.height - 20
  }
  
  finalX = Math.max(10, finalX)
  finalY = Math.max(10, finalY)
  
  popup.style.left = `${finalX}px`
  popup.style.top = `${finalY}px`
}

function togglePin(id: string) {
  const popup = popups.get(id)
  if (!popup) return
  
  popup.isPinned = !popup.isPinned
  popup.element.classList.toggle('pinned', popup.isPinned)
  
  const pinBtn = popup.element.querySelector('.image-preview-pin') as HTMLButtonElement
  if (pinBtn) {
    pinBtn.innerHTML = popup.isPinned ? '📍' : '📌'
    pinBtn.title = popup.isPinned ? 'Unpin popup' : 'Pin popup'
  }
}

function closePopup(id: string) {
  const popup = popups.get(id)
  if (!popup) return
  
  popup.element.classList.remove('visible')
  
  setTimeout(() => {
    popup.element.remove()
    popups.delete(id)
    
    if (currentHoverPopup === id) {
      currentHoverPopup = null
    }
  }, 200)
}

function startDrag(e: MouseEvent, id: string) {
  const popup = popups.get(id)
  if (!popup || !popup.isPinned) return
  
  e.preventDefault()
  popup.isDragging = true
  
  const rect = popup.element.getBoundingClientRect()
  popup.offsetX = e.clientX - rect.left
  popup.offsetY = e.clientY - rect.top
  
  popup.element.classList.add('dragging')
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!popup.isDragging) return
    
    const x = e.clientX - popup.offsetX
    const y = e.clientY - popup.offsetY
    
    popup.element.style.left = `${x}px`
    popup.element.style.top = `${y}px`
  }
  
  const handleMouseUp = () => {
    popup.isDragging = false
    popup.element.classList.remove('dragging')
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleImageHover(img: HTMLImageElement, e: MouseEvent) {
  // Don't create popup if image is too small (likely an icon)
  if (img.naturalWidth < 100 || img.naturalHeight < 100) return
  
  // Clear any existing timer
  if (hoverTimer) {
    clearTimeout(hoverTimer)
  }
  
  // Set new timer
  hoverTimer = window.setTimeout(() => {
    // Don't create if already exists
    if (currentHoverPopup && popups.has(currentHoverPopup)) return
    
    const popup = createPopup(img, e.clientX, e.clientY)
    currentHoverPopup = popup.id
  }, 300)
}

function handleImageLeave() {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
}

function handleImageClick(img: HTMLImageElement, e: MouseEvent) {
  // On mobile or if shift-clicked, open fullscreen
  const isMobile = window.innerWidth < 768
  const isShiftClick = e.shiftKey
  
  if (isMobile || isShiftClick) {
    e.preventDefault()
    openFullscreen(img)
  }
}

function openFullscreen(img: HTMLImageElement) {
  const overlay = document.createElement('div')
  overlay.className = 'image-fullscreen-overlay'
  
  const container = document.createElement('div')
  container.className = 'image-fullscreen-container'
  
  const fullImg = document.createElement('img')
  fullImg.src = img.src
  fullImg.alt = img.alt || 'Fullscreen image'
  
  const closeBtn = document.createElement('button')
  closeBtn.className = 'image-fullscreen-close'
  closeBtn.innerHTML = '✕'
  closeBtn.title = 'Close'
  closeBtn.setAttribute('aria-label', 'Close fullscreen')
  
  container.appendChild(fullImg)
  overlay.appendChild(container)
  overlay.appendChild(closeBtn)
  document.body.appendChild(overlay)
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden'
  
  // Fade in
  requestAnimationFrame(() => {
    overlay.classList.add('visible')
  })
  
  const closeFullscreen = () => {
    overlay.classList.remove('visible')
    setTimeout(() => {
      overlay.remove()
      document.body.style.overflow = ''
    }, 200)
  }
  
  closeBtn.addEventListener('click', closeFullscreen)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeFullscreen()
  })
  
  // Close on Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeFullscreen()
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)
}

// Initialize on DOM load
document.addEventListener('nav', () => {
  // Wait for content to be loaded
  setTimeout(initImagePreview, 100)
})

function initImagePreview() {
  // Find all images in article content
  const contentImages = document.querySelectorAll('article img, .popover-hint img')
  
  contentImages.forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return
    
    // Skip if already initialized
    if (img.dataset.previewInit) return
    img.dataset.previewInit = 'true'
    
    // Desktop: hover preview
    img.addEventListener('mouseenter', (e) => handleImageHover(img, e as MouseEvent))
    img.addEventListener('mouseleave', handleImageLeave)
    
    // Click handler (mobile or shift+click for fullscreen)
    img.addEventListener('click', (e) => handleImageClick(img, e as MouseEvent))
    
    // Add cursor style
    img.style.cursor = 'pointer'
  })
}

// Initialize on first load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImagePreview)
} else {
  initImagePreview()
}

// Clean up on navigation
window.addEventListener('beforeunload', () => {
  popups.forEach((_, id) => closePopup(id))
})

