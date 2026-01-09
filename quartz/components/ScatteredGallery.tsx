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
  transition: transform 0.3s ease, box-shadow 0.3s ease, z-index 0s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: var(--light);
  padding: 6px;
  border-radius: 2px;
}

.gallery-item:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 100 !important;
}

.gallery-item img {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 1px;
}

.gallery-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--gray);
  font-size: 0.9rem;
}

/* Dark mode adjustments */
[saved-theme="dark"] .gallery-item {
  background: #2a2a2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

[saved-theme="dark"] .gallery-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

/* Fullscreen overlay */
.gallery-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.gallery-fullscreen-overlay.visible {
  opacity: 1;
}

.gallery-fullscreen-overlay img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  cursor: default;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.5);
}

.gallery-fullscreen-close {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.gallery-fullscreen-close:hover {
  background: rgba(255, 255, 255, 0.2);
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
    transform: rotate(0deg) !important;
    margin-bottom: 1rem;
    width: calc(50% - 0.5rem) !important;
    height: auto !important;
    display: inline-block;
    vertical-align: top;
  }

  .gallery-item img {
    width: 100% !important;
    height: auto !important;
  }

  .gallery-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    min-height: auto;
    height: auto !important;
  }

  .gallery-item:hover {
    transform: scale(1.02) !important;
  }
}
`

  ScatteredGallery.afterDOMLoaded = `
(function() {
  const gallery = document.querySelector('.scattered-gallery');
  if (!gallery) return;

  const container = gallery.querySelector('.gallery-container');
  const folder = gallery.dataset.galleryFolder || 'gallery';
  const baseDir = gallery.dataset.baseDir || '.';

  // Load images from JSON
  fetch(baseDir + '/static/' + folder + '/images.json')
    .then(response => response.json())
    .then(galleryImages => {
      if (!galleryImages || galleryImages.length === 0) {
        container.innerHTML = '<div class="gallery-loading">No images found. Add images to /quartz/static/gallery/ and list them in images.json</div>';
        return;
      }
      createScatteredLayout(galleryImages);
    })
    .catch(err => {
      console.error('Gallery error:', err);
      container.innerHTML = '<div class="gallery-loading">Could not load gallery. Check console for details.</div>';
    });

  // Random number generator
  let seed = Date.now();
  function random() {
    seed++;
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Size variations
  const sizes = [
    { width: 160, height: 160 },
    { width: 200, height: 130 },
    { width: 130, height: 200 },
    { width: 220, height: 165 },
    { width: 180, height: 220 },
    { width: 240, height: 180 },
    { width: 150, height: 150 },
    { width: 190, height: 140 },
  ];

  function createScatteredLayout(galleryImages) {
    const containerWidth = container.offsetWidth;
    const rows = Math.ceil(galleryImages.length / 3);
    const containerHeight = Math.max(window.innerHeight * 0.9, rows * 280);

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
      img.style.width = size.width + 'px';
      img.style.height = size.height + 'px';
      img.style.objectFit = 'cover';

      // Position calculation - create a loose grid then randomize
      const cols = 3;
      const col = index % cols;
      const row = Math.floor(index / cols);

      const cellWidth = containerWidth / cols;
      const cellHeight = 300;

      const baseX = col * cellWidth;
      const baseY = row * cellHeight;

      // Add randomness to position
      const offsetX = (random() - 0.3) * (cellWidth - size.width);
      const offsetY = (random() - 0.3) * (cellHeight - size.height);

      const x = Math.max(10, Math.min(containerWidth - size.width - 10, baseX + offsetX));
      const y = Math.max(10, baseY + offsetY);

      // Random rotation (-6 to +6 degrees)
      const rotation = (random() - 0.5) * 12;

      // Z-index for overlapping effect
      const zIndex = Math.floor(random() * 30) + index;

      item.style.left = x + 'px';
      item.style.top = y + 'px';
      item.style.transform = 'rotate(' + rotation + 'deg)';
      item.style.zIndex = zIndex;

      item.appendChild(img);
      container.appendChild(item);

      // Click handler
      item.addEventListener('click', function() {
        openFullscreen(img.src, img.alt);
      });
    });
  }

  function openFullscreen(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'gallery-fullscreen-overlay';

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'gallery-fullscreen-close';
    closeBtn.innerHTML = '✕';
    closeBtn.setAttribute('aria-label', 'Close');

    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
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
    }

    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      close();
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', function handleEsc(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', handleEsc);
      }
    });
  }

  // Recalculate on resize (debounced, desktop only)
  let resizeTimeout;
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) return;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      seed = Date.now();
      fetch(baseDir + '/static/' + folder + '/images.json')
        .then(r => r.json())
        .then(createScatteredLayout)
        .catch(() => {});
    }, 300);
  });
})();
`

  return ScatteredGallery
}) satisfies QuartzComponentConstructor
