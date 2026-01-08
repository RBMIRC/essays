import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const ImagePreview: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return <></>
  }

  ImagePreview.afterDOMLoaded = `
// Image Preview System
(function() {
  const popups = new Map();
  let hoverTimer = null;
  let currentHoverPopup = null;

  function createPopup(img, x, y) {
    const id = 'popup-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const popup = document.createElement('div');
    popup.className = 'image-preview-popup';
    popup.id = id;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    const header = document.createElement('div');
    header.className = 'image-preview-header';
    
    const pinBtn = document.createElement('button');
    pinBtn.className = 'image-preview-pin';
    pinBtn.innerHTML = '📌';
    pinBtn.title = 'Pin popup';
    pinBtn.setAttribute('aria-label', 'Pin popup');
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'image-preview-close';
    closeBtn.innerHTML = '✕';
    closeBtn.title = 'Close';
    closeBtn.setAttribute('aria-label', 'Close popup');
    
    header.appendChild(pinBtn);
    header.appendChild(closeBtn);
    
    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-preview-content';
    
    const previewImg = document.createElement('img');
    previewImg.src = img.src;
    previewImg.alt = img.alt || 'Image preview';
    previewImg.loading = 'eager';
    
    imgContainer.appendChild(previewImg);
    
    if (img.alt) {
      const caption = document.createElement('div');
      caption.className = 'image-preview-caption';
      caption.textContent = img.alt;
      imgContainer.appendChild(caption);
    }
    
    popup.appendChild(header);
    popup.appendChild(imgContainer);
    document.body.appendChild(popup);
    
    const popupData = {
      id: id,
      element: popup,
      isPinned: false,
      isDragging: false,
      offsetX: 0,
      offsetY: 0,
    };
    
    popups.set(id, popupData);
    
    pinBtn.addEventListener('click', function() { togglePin(id); });
    closeBtn.addEventListener('click', function() { closePopup(id); });
    header.addEventListener('mousedown', function(e) { startDrag(e, id); });
    
    popup.addEventListener('mouseleave', function() {
      const data = popups.get(id);
      if (data && !data.isPinned && id === currentHoverPopup) {
        setTimeout(function() {
          if (!data.isPinned) closePopup(id);
        }, 100);
      }
    });
    
    positionPopup(popup, x, y);
    
    requestAnimationFrame(function() {
      popup.classList.add('visible');
    });
    
    return popupData;
  }

  function positionPopup(popup, x, y) {
    const rect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let finalX = x + 20;
    let finalY = y + 20;
    
    if (finalX + rect.width > viewportWidth) {
      finalX = x - rect.width - 20;
    }
    if (finalY + rect.height > viewportHeight) {
      finalY = viewportHeight - rect.height - 20;
    }
    
    finalX = Math.max(10, finalX);
    finalY = Math.max(10, finalY);
    
    popup.style.left = finalX + 'px';
    popup.style.top = finalY + 'px';
  }

  function togglePin(id) {
    const popup = popups.get(id);
    if (!popup) return;
    
    popup.isPinned = !popup.isPinned;
    popup.element.classList.toggle('pinned', popup.isPinned);
    
    const pinBtn = popup.element.querySelector('.image-preview-pin');
    if (pinBtn) {
      pinBtn.innerHTML = popup.isPinned ? '📍' : '📌';
      pinBtn.title = popup.isPinned ? 'Unpin popup' : 'Pin popup';
    }
  }

  function closePopup(id) {
    const popup = popups.get(id);
    if (!popup) return;
    
    popup.element.classList.remove('visible');
    
    setTimeout(function() {
      popup.element.remove();
      popups.delete(id);
      
      if (currentHoverPopup === id) {
        currentHoverPopup = null;
      }
    }, 200);
  }

  function startDrag(e, id) {
    const popup = popups.get(id);
    if (!popup || !popup.isPinned) return;
    
    e.preventDefault();
    popup.isDragging = true;
    
    const rect = popup.element.getBoundingClientRect();
    popup.offsetX = e.clientX - rect.left;
    popup.offsetY = e.clientY - rect.top;
    
    popup.element.classList.add('dragging');
    
    function handleMouseMove(e) {
      if (!popup.isDragging) return;
      
      const x = e.clientX - popup.offsetX;
      const y = e.clientY - popup.offsetY;
      
      popup.element.style.left = x + 'px';
      popup.element.style.top = y + 'px';
    }
    
    function handleMouseUp() {
      popup.isDragging = false;
      popup.element.classList.remove('dragging');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleImageHover(img, e) {
    if (img.naturalWidth < 100 || img.naturalHeight < 100) return;
    
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }
    
    hoverTimer = setTimeout(function() {
      if (currentHoverPopup && popups.has(currentHoverPopup)) return;
      
      const popup = createPopup(img, e.clientX, e.clientY);
      currentHoverPopup = popup.id;
    }, 300);
  }

  function handleImageLeave() {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  }

  function handleImageClick(img, e) {
    const isMobile = window.innerWidth < 768;
    const isShiftClick = e.shiftKey;
    
    if (isMobile || isShiftClick) {
      e.preventDefault();
      openFullscreen(img);
    }
  }

  function openFullscreen(img) {
    const overlay = document.createElement('div');
    overlay.className = 'image-fullscreen-overlay';
    
    const container = document.createElement('div');
    container.className = 'image-fullscreen-container';
    
    const fullImg = document.createElement('img');
    fullImg.src = img.src;
    fullImg.alt = img.alt || 'Fullscreen image';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'image-fullscreen-close';
    closeBtn.innerHTML = '✕';
    closeBtn.title = 'Close';
    closeBtn.setAttribute('aria-label', 'Close fullscreen');
    
    container.appendChild(fullImg);
    overlay.appendChild(container);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
    document.body.style.overflow = 'hidden';
    
    requestAnimationFrame(function() {
      overlay.classList.add('visible');
    });
    
    function closeFullscreen() {
      overlay.classList.remove('visible');
      setTimeout(function() {
        overlay.remove();
        document.body.style.overflow = '';
      }, 200);
    }
    
    closeBtn.addEventListener('click', closeFullscreen);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeFullscreen();
    });
    
    function handleEscape(e) {
      if (e.key === 'Escape') {
        closeFullscreen();
        document.removeEventListener('keydown', handleEscape);
      }
    }
    document.addEventListener('keydown', handleEscape);
  }

  function initImagePreview() {
    const contentImages = document.querySelectorAll('article img, .popover-hint img');
    
    contentImages.forEach(function(img) {
      if (img.dataset.previewInit) return;
      img.dataset.previewInit = 'true';
      
      img.addEventListener('mouseenter', function(e) { handleImageHover(img, e); });
      img.addEventListener('mouseleave', handleImageLeave);
      img.addEventListener('click', function(e) { handleImageClick(img, e); });
      
      img.style.cursor = 'pointer';
    });
  }

  document.addEventListener('nav', function() {
    setTimeout(initImagePreview, 100);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImagePreview);
  } else {
    initImagePreview();
  }

  window.addEventListener('beforeunload', function() {
    popups.forEach(function(_, id) { closePopup(id); });
  });
})();
`

  return ImagePreview
}) satisfies QuartzComponentConstructor
