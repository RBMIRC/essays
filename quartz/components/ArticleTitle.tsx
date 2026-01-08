import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const ArticleTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  const slug = fileData.slug

  // Only show PDF button for actual articles (not index pages)
  const isArticle = slug && !slug.endsWith("/index") && !slug.endsWith("index")

  if (title) {
    return (
      <div class={classNames(displayClass, "article-title-wrapper")}>
        <h1 class="article-title">{title}</h1>
        {isArticle && (
          <button
            class="pdf-download-btn"
            title="Download PDF"
            aria-label="Download as PDF"
            data-title={title}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <span>PDF</span>
          </button>
        )}
      </div>
    )
  } else {
    return null
  }
}

ArticleTitle.css = `
.article-title-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin: 2rem 0 0 0;
}

.article-title {
  margin: 0;
  flex: 1;
}

.pdf-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 4px;
  color: var(--darkgray);
  font-size: 0.85rem;
  font-family: var(--bodyFont);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 0.5rem;
}

.pdf-download-btn:hover {
  background: var(--lightgray);
  color: var(--dark);
  border-color: var(--gray);
}

.pdf-download-btn svg {
  flex-shrink: 0;
}
`

ArticleTitle.afterDOMLoaded = `
// Load html2pdf library dynamically
function loadHtml2Pdf() {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) {
      resolve(window.html2pdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve(window.html2pdf);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

document.addEventListener("nav", () => {
  const pdfBtn = document.querySelector('.pdf-download-btn');
  if (!pdfBtn) return;

  const handleClick = async () => {
    const title = pdfBtn.getAttribute('data-title') || 'document';
    const article = document.querySelector('article.popover-hint');

    if (!article) {
      alert('Could not find article content');
      return;
    }

    // Show loading state
    pdfBtn.style.opacity = '0.5';
    pdfBtn.style.pointerEvents = 'none';

    try {
      const html2pdf = await loadHtml2Pdf();

      // Clone the article to avoid modifying the original
      const clone = article.cloneNode(true);

      // Remove elements that shouldn't be in PDF
      clone.querySelectorAll('.pdf-download-btn, script, style').forEach(el => el.remove());

      const opt = {
        margin: [15, 15, 15, 15],
        filename: title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      };

      await html2pdf().set(opt).from(clone).save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      pdfBtn.style.opacity = '1';
      pdfBtn.style.pointerEvents = 'auto';
    }
  };

  pdfBtn.addEventListener('click', handleClick);
  window.addCleanup(() => pdfBtn.removeEventListener('click', handleClick));
});
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor
