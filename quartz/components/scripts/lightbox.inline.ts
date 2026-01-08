document.addEventListener("nav", () => {
  document.querySelectorAll(".image-popup, .lightbox-overlay").forEach(el => el.remove())
  
  const images = Array.from(document.querySelectorAll("article img")) as HTMLImageElement[]
  if (images.length === 0) return
  
  let currentLightboxIndex = 0
  
  const pinIcon = `<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7"/><path d="M5 11h14l-1.5 6h-11z"/></svg>`
  const loupeIcon = `<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>`
  const closeIcon = `<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`
  
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
  const closeBtn = lightbox.querySelector(".lightbox-close") as HTMLButtonElement
  
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
  
  closeBtn.addEventListener("click", closeLightbox)
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
  
  let activePopup: HTMLElement | null = null
  
  function createPopup(img: HTMLImageElement, index: number): HTMLElement {
    const popup = document.createElement("div")
    popup.className = "image-popup"
    popup.innerHTML = `
      <div class="popup-toolbar">
        <button class="popup-btn pin-btn" title="Pin">${pinIcon}</button>
        <button class="popup-btn loupe-btn" title="Fullscreen">${loupeIcon}</button>
        <button class="popup-btn close-btn" title="Close">${closeIcon}</button>
      </div>
      <img class="popup-image" src="${img.src}" alt="${img.alt}">
      ${img.alt ? `<div class="popup-caption">${img.alt}</div>` : ''}
    `
    
    const rect = img.getBoundingClientRect()
    popup.style.position = "absolute"
    popup.style.left = `${rect.right + window.scrollX + 10}px`
    popup.style.top = `${rect.top + window.scrollY}px`
    
    document.body.appendChild(popup)
    const popupRect = popup.getBoundingClientRect()
    if (popupRect.right > window.innerWidth) {
      popup.style.left = `${rect.left + window.scrollX - popupRect.width - 10}px`
    }
    if (popupRect.bottom > window.innerHeight) {
      popup.style.top = `${window.innerHeight - popupRect.height - 20 + window.scrollY}px`
    }
    
    const pinBtn = popup.querySelector(".pin-btn") as HTMLButtonElement
    pinBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      
      if (!popup.classList.contains("pinned")) {
        // Capturer la position AVANT de changer le positionnement
        const currentRect = popup.getBoundingClientRect()
        // Appliquer position fixed avec les coordonnées viewport
        popup.style.position = "fixed"
        popup.style.left = `${currentRect.left}px`
        popup.style.top = `${currentRect.top}px`
        // Puis ajouter la classe
        popup.classList.add("pinned")
        pinBtn.classList.add("active")
        activePopup = null
        makeDraggable(popup)
      } else {
        // Unpinner - revenir en absolute
        const currentRect = popup.getBoundingClientRect()
        popup.style.position = "absolute"
        popup.style.left = `${currentRect.left + window.scrollX}px`
        popup.style.top = `${currentRect.top + window.scrollY}px`
        popup.classList.remove("pinned")
        pinBtn.classList.remove("active")
      }
    })
    
    const loupeBtn = popup.querySelector(".loupe-btn") as HTMLButtonElement
    loupeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      openLightbox(index)
    })
    
    const closePopupBtn = popup.querySelector(".close-btn") as HTMLButtonElement
    closePopupBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      popup.remove()
      if (activePopup === popup) activePopup = null
    })
    
    return popup
  }
  
  function makeDraggable(el: HTMLElement) {
    const toolbar = el.querySelector(".popup-toolbar") as HTMLElement
    let offsetX = 0, offsetY = 0, isDragging = false
    
    toolbar.style.cursor = "move"
    
    toolbar.addEventListener("mousedown", (e) => {
      if ((e.target as HTMLElement).closest(".popup-btn")) return
      isDragging = true
      offsetX = e.clientX - el.getBoundingClientRect().left
      offsetY = e.clientY - el.getBoundingClientRect().top
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
  
  images.forEach((img, index) => {
    img.addEventListener("click", (e) => {
      e.preventDefault()
      if (activePopup && !activePopup.classList.contains("pinned")) {
        activePopup.remove()
      }
      const popup = createPopup(img, index)
      activePopup = popup
    })
  })
  
  document.addEventListener("click", (e) => {
    if (activePopup && 
        !activePopup.classList.contains("pinned") && 
        !activePopup.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("article img")) {
      activePopup.remove()
      activePopup = null
    }
  })
})
