document.addEventListener("nav", () => {
  document.querySelectorAll(".image-popup, .lightbox-overlay").forEach(el => el.remove())

  const images = Array.from(document.querySelectorAll("article img")) as HTMLImageElement[]
  if (images.length === 0) return

  let currentLightboxIndex = 0
  let hoverPopup: HTMLElement | null = null
  let hoverImage: HTMLImageElement | null = null
  let hideTimeout: ReturnType<typeof setTimeout> | null = null
  let popupZIndex = 2000
  const pinnedPopups: Set<HTMLElement> = new Set()

  // Icons
  const pinIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`
  const loupeIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>`
  const closeIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`

  // Create fullscreen lightbox
  const lightbox = document.createElement("div")
  lightbox.className = "lightbox-overlay"
  lightbox.innerHTML = `
    <button class="lightbox-close">✕</button>
    <button class="lightbox-nav prev">‹</button>
    <div class="lightbox-content">
      <img class="lightbox-image" src="" alt="">
    </div>
    <button class="lightbox-nav next">›</button>
    <div class="lightbox-counter"></div>
  `
  document.body.appendChild(lightbox)

  const lightboxImg = lightbox.querySelector(".lightbox-image") as HTMLImageElement
  const lightboxCounter = lightbox.querySelector(".lightbox-counter") as HTMLElement
  const prevBtn = lightbox.querySelector(".prev") as HTMLButtonElement
  const nextBtn = lightbox.querySelector(".next") as HTMLButtonElement
  const closeLightboxBtn = lightbox.querySelector(".lightbox-close") as HTMLButtonElement

  function openLightbox(index: number) {
    currentLightboxIndex = index
    updateLightbox()
    lightbox.classList.add("active")
  }

  function updateLightbox() {
    lightboxImg.src = images[currentLightboxIndex].src
    lightboxImg.alt = images[currentLightboxIndex].alt
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${images.length}`
  }

  function closeLightbox() {
    lightbox.classList.remove("active")
  }

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    currentLightboxIndex = (currentLightboxIndex - 1 + images.length) % images.length
    updateLightbox()
  })

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    currentLightboxIndex = (currentLightboxIndex + 1) % images.length
    updateLightbox()
  })

  closeLightboxBtn.addEventListener("click", closeLightbox)
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox()
  })

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return
    if (e.key === "Escape") closeLightbox()
    if (e.key === "ArrowLeft") {
      currentLightboxIndex = (currentLightboxIndex - 1 + images.length) % images.length
      updateLightbox()
    }
    if (e.key === "ArrowRight") {
      currentLightboxIndex = (currentLightboxIndex + 1) % images.length
      updateLightbox()
    }
  })

  // Make popup draggable
  function makeDraggable(el: HTMLElement) {
    const toolbar = el.querySelector(".image-popup-toolbar") as HTMLElement
    if (!toolbar) return

    let offsetX = 0, offsetY = 0, isDragging = false

    toolbar.style.cursor = "move"

    toolbar.addEventListener("mousedown", (e) => {
      if ((e.target as HTMLElement).closest(".image-popup-btn")) return
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

  // Create popup for image
  function createPopup(img: HTMLImageElement, index: number): HTMLElement {
    const popup = document.createElement("div")
    popup.className = "image-popup"
    popup.innerHTML = `
      <div class="image-popup-toolbar">
        <span class="image-popup-title">${img.alt || `Image ${index + 1}`}</span>
        <div class="image-popup-buttons">
          <button class="image-popup-btn pin-btn" title="Pin">${pinIcon}</button>
          <button class="image-popup-btn loupe-btn" title="Fullscreen">${loupeIcon}</button>
          <button class="image-popup-btn close-btn" title="Close">${closeIcon}</button>
        </div>
      </div>
      <div class="image-popup-content">
        <img class="popup-image" src="${img.src}" alt="${img.alt}">
      </div>
    `

    document.body.appendChild(popup)

    // Position popup near the image
    const rect = img.getBoundingClientRect()
    popup.style.position = "fixed"
    popup.style.left = `${Math.min(rect.right + 10, window.innerWidth - 420)}px`
    popup.style.top = `${Math.min(rect.top, window.innerHeight - 350)}px`
    popup.style.zIndex = String(++popupZIndex)

    // Adjust position if needed
    const popupRect = popup.getBoundingClientRect()
    if (popupRect.right > window.innerWidth - 10) {
      popup.style.left = `${rect.left - popupRect.width - 10}px`
    }
    if (popupRect.bottom > window.innerHeight - 10) {
      popup.style.top = `${window.innerHeight - popupRect.height - 10}px`
    }
    if (parseFloat(popup.style.left) < 10) {
      popup.style.left = "10px"
    }
    if (parseFloat(popup.style.top) < 10) {
      popup.style.top = "10px"
    }

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
          if (hoverPopup === popup) {
            hoverPopup = null
            hoverImage = null
          }
        }, 150)
      }
    })

    // Pin button (max 8)
    const pinBtn = popup.querySelector(".pin-btn") as HTMLButtonElement
    pinBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      e.preventDefault()

      if (!popup.classList.contains("pinned")) {
        // Check if we've reached the max (8 pinned popups)
        if (pinnedPopups.size >= 8) {
          const oldest = pinnedPopups.values().next().value
          if (oldest) {
            oldest.remove()
            pinnedPopups.delete(oldest)
          }
        }

        popup.classList.add("pinned")
        pinBtn.classList.add("active")
        pinnedPopups.add(popup)
        makeDraggable(popup)

        if (hoverPopup === popup) {
          hoverPopup = null
          hoverImage = null
        }
      } else {
        popup.classList.remove("pinned")
        pinBtn.classList.remove("active")
        pinnedPopups.delete(popup)
      }
    })

    // Loupe button - open fullscreen lightbox
    const loupeBtn = popup.querySelector(".loupe-btn") as HTMLButtonElement
    loupeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      e.preventDefault()
      openLightbox(index)
    })

    // Close button
    const closeBtn = popup.querySelector(".close-btn") as HTMLButtonElement
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      e.preventDefault()
      popup.remove()
      pinnedPopups.delete(popup)
      if (hoverPopup === popup) {
        hoverPopup = null
        hoverImage = null
      }
    })

    return popup
  }

  // Mouse enter handler
  function imageMouseEnterHandler(this: HTMLImageElement, index: number) {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }

    if (hoverImage === this && hoverPopup) return

    // Close existing hover popup
    if (hoverPopup) {
      hoverPopup.remove()
      hoverPopup = null
    }

    hoverImage = this
    const popup = createPopup(this, index)
    hoverPopup = popup
  }

  // Mouse leave handler
  function imageMouseLeaveHandler() {
    hideTimeout = setTimeout(() => {
      if (hoverPopup && !hoverPopup.classList.contains("pinned")) {
        hoverPopup.remove()
        hoverPopup = null
        hoverImage = null
      }
    }, 150)
  }

  // Attach handlers to images
  images.forEach((img, index) => {
    img.style.cursor = "pointer"

    img.addEventListener("mouseenter", function() {
      imageMouseEnterHandler.call(this, index)
    })

    img.addEventListener("mouseleave", imageMouseLeaveHandler)

    // Prevent default click, use loupe button for fullscreen
    img.addEventListener("click", (e) => {
      e.preventDefault()
    })
  })
})
