import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"

interface Options {
  folder?: string
}

const defaultOptions: Options = {
  folder: "gallery",
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const ScatteredGallery: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    // Only render on gallery page
    const slug = fileData.slug || ""
    if (!slug.endsWith("gallery") && slug !== "gallery") {
      return null
    }

    const baseDir = pathToRoot(fileData.slug!)

    return (
      <div class="scattered-gallery" data-gallery-folder={opts.folder} data-base-dir={baseDir}>
        <div class="gallery-container">
          <div class="gallery-loading">Loading images...</div>
        </div>
      </div>
    )
  }

  ScatteredGallery.css = `
.scattered-gallery {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
}

.gallery-container {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 4rem);
}

.gallery-item {
  position: absolute;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  overflow: hidden;
}

.gallery-item:hover {
  transform: scale(1.08) !important;
  z-index: 100 !important;
  opacity: 1 !important;
}

.gallery-item img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--gray);
  font-size: 0.9rem;
}

/* Fullscreen overlay - frosted glass effect */
.gallery-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

[saved-theme="dark"] .gallery-fullscreen-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.gallery-fullscreen-overlay.visible {
  opacity: 1;
}

.gallery-fullscreen-overlay img {
  max-width: 85vw;
  max-height: 85vh;
  object-fit: contain;
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.2);
}

[saved-theme="dark"] .gallery-fullscreen-overlay img {
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
}

.gallery-fullscreen-close {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--light);
  border: 1px solid var(--lightgray);
  color: var(--dark);
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.gallery-fullscreen-close:hover {
  background: var(--lightgray);
}

.gallery-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: var(--light);
  border: 1px solid var(--lightgray);
  color: var(--dark);
  font-size: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, opacity 0.2s ease;
  opacity: 0.8;
}

.gallery-nav:hover {
  background: var(--lightgray);
  opacity: 1;
}

.gallery-nav.prev {
  left: 20px;
}

.gallery-nav.next {
  right: 20px;
}

/* Gallery page specific - hide sidebars */
.page:has(.scattered-gallery) .left.sidebar,
.page:has(.scattered-gallery) .right.sidebar {
  display: none;
}

.page:has(.scattered-gallery) .center {
  margin: 0 auto;
  max-width: none;
  width: 100%;
}

.page:has(.scattered-gallery) article {
  max-width: none;
  padding: 0;
}

.page:has(.scattered-gallery) .page-header {
  display: none;
}

.page:has(.scattered-gallery) footer {
  display: none;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .scattered-gallery {
    padding: 1rem;
  }

  .gallery-item {
    position: relative !important;
    margin-bottom: 0.5rem;
    width: calc(50% - 0.25rem) !important;
    height: auto !important;
    display: inline-block;
    vertical-align: top;
  }

  .gallery-item img {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 1;
  }

  .gallery-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: auto;
    height: auto !important;
  }

  .gallery-nav {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .gallery-nav.prev {
    left: 10px;
  }

  .gallery-nav.next {
    right: 10px;
  }
}
`

  ScatteredGallery.afterDOMLoaded = `
document.addEventListener("nav", () => {
  const gallery = document.querySelector('.scattered-gallery');
  if (!gallery) return;

  const container = gallery.querySelector('.gallery-container');
  const folder = gallery.dataset.galleryFolder || 'gallery';
  const baseDir = gallery.dataset.baseDir || '.';

  let allImages = [];
  let currentIndex = 0;

  // Random number generator
  let seed = Date.now();
  function random() {
    seed++;
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Size variations (no rotation)
  const sizes = [
    { width: 140, height: 140 },
    { width: 180, height: 120 },
    { width: 120, height: 180 },
    { width: 200, height: 150 },
    { width: 150, height: 200 },
    { width: 220, height: 160 },
    { width: 160, height: 160 },
    { width: 170, height: 130 },
  ];

  function createScatteredLayout(galleryImages) {
    const containerWidth = container.offsetWidth;
    const rows = Math.ceil(galleryImages.length / 4);
    const containerHeight = Math.max(window.innerHeight * 0.9, rows * 240);

    container.style.height = containerHeight + 'px';
    container.innerHTML = '';

    galleryImages.forEach((imgData, index) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      const img = document.createElement('img');
      img.src = baseDir + '/static/' + folder + '/' + imgData.src;
      img.alt = imgData.alt || '';
      img.loading = 'lazy';

      // Random size
      const sizeIndex = Math.floor(random() * sizes.length);
      const size = sizes[sizeIndex];
      item.style.width = size.width + 'px';
      item.style.height = size.height + 'px';

      // Position calculation - loose grid with randomness
      const cols = 4;
      const col = index % cols;
      const row = Math.floor(index / cols);

      const cellWidth = containerWidth / cols;
      const cellHeight = 260;

      const baseX = col * cellWidth;
      const baseY = row * cellHeight;

      // Add randomness to position
      const offsetX = (random() - 0.3) * (cellWidth - size.width - 20);
      const offsetY = (random() - 0.3) * (cellHeight - size.height - 20);

      const x = Math.max(5, Math.min(containerWidth - size.width - 5, baseX + offsetX + 10));
      const y = Math.max(5, baseY + offsetY + 10);

      // Random z-index for subtle overlapping
      const zIndex = Math.floor(random() * 20) + 1;

      item.style.left = x + 'px';
      item.style.top = y + 'px';
      item.style.zIndex = zIndex;

      item.appendChild(img);
      container.appendChild(item);

      // Click handler
      item.addEventListener('click', function() {
        currentIndex = index;
        openFullscreen(index);
      });
    });
  }

  function openFullscreen(index) {
    const imgData = allImages[index];
    if (!imgData) return;

    // Remove existing overlay if any
    const existing = document.querySelector('.gallery-fullscreen-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'gallery-fullscreen-overlay';

    const img = document.createElement('img');
    img.src = baseDir + '/static/' + folder + '/' + imgData.src;
    img.alt = imgData.alt || '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'gallery-fullscreen-close';
    closeBtn.innerHTML = '✕';
    closeBtn.setAttribute('aria-label', 'Close');

    const prevBtn = document.createElement('button');
    prevBtn.className = 'gallery-nav prev';
    prevBtn.innerHTML = '‹';
    prevBtn.setAttribute('aria-label', 'Previous');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'gallery-nav next';
    nextBtn.innerHTML = '›';
    nextBtn.setAttribute('aria-label', 'Next');

    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function() {
      overlay.classList.add('visible');
    });

    function close() {
      overlay.classList.remove('visible');
      setTimeout(function() {
        overlay.remove();
        document.body.style.overflow = '';
      }, 200);
      document.removeEventListener('keydown', handleKeydown);
    }

    function showImage(newIndex) {
      if (newIndex < 0) newIndex = allImages.length - 1;
      if (newIndex >= allImages.length) newIndex = 0;
      currentIndex = newIndex;
      const newImgData = allImages[currentIndex];
      img.src = baseDir + '/static/' + folder + '/' + newImgData.src;
      img.alt = newImgData.alt || '';
    }

    function handleKeydown(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    }

    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      close();
    });

    prevBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showImage(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showImage(currentIndex + 1);
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', handleKeydown);
  }

  // Load images from JSON
  fetch(baseDir + '/static/' + folder + '/images.json')
    .then(response => response.json())
    .then(galleryImages => {
      if (!galleryImages || galleryImages.length === 0) {
        container.innerHTML = '<div class="gallery-loading">No images found.</div>';
        return;
      }
      allImages = galleryImages;
      createScatteredLayout(galleryImages);
    })
    .catch(err => {
      console.error('Gallery error:', err);
      container.innerHTML = '<div class="gallery-loading">Could not load gallery.</div>';
    });

  // Recalculate on resize (debounced, desktop only)
  let resizeTimeout;
  const handleResize = function() {
    if (window.innerWidth <= 768) return;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      seed = Date.now();
      if (allImages.length > 0) {
        createScatteredLayout(allImages);
      }
    }, 300);
  };
  window.addEventListener('resize', handleResize);
  window.addCleanup(() => window.removeEventListener('resize', handleResize));
});
`

  return ScatteredGallery
}) satisfies QuartzComponentConstructor
