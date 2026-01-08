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
document.addEventListener("nav", () => {
  const pdfBtn = document.querySelector('.pdf-download-btn');
  if (!pdfBtn) return;

  const handleClick = () => {
    const title = pdfBtn.getAttribute('data-title') || 'document';
    const article = document.querySelector('article.popover-hint');
    const meta = document.querySelector('.content-meta-wrapper');

    if (!article) {
      alert('Could not find article content');
      return;
    }

    // Create a clean HTML document for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }

    // Get metadata
    const subtitle = document.querySelector('.content-subtitle')?.textContent || '';
    const author = document.querySelector('.content-author')?.textContent || '';
    const date = document.querySelector('.content-meta time')?.textContent || '';

    // Clone and clean the article content
    const clone = article.cloneNode(true);
    clone.querySelectorAll('.pdf-download-btn, script, .callout-title svg, details summary').forEach(el => {
      if (el.tagName === 'SUMMARY') {
        el.style.listStyle = 'none';
      } else {
        el.remove();
      }
    });

    // Open all details elements
    clone.querySelectorAll('details').forEach(d => d.setAttribute('open', 'true'));

    const printContent = \`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>\${title}</title>
        <style>
          @page {
            size: A4;
            margin: 25mm 20mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          .pdf-header {
            margin-bottom: 2em;
            padding-bottom: 1em;
            border-bottom: 1px solid #ccc;
          }
          .pdf-title {
            font-size: 20pt;
            font-weight: bold;
            margin: 0 0 0.3em 0;
            line-height: 1.2;
          }
          .pdf-subtitle {
            font-size: 12pt;
            font-style: italic;
            color: #555;
            margin: 0 0 0.5em 0;
          }
          .pdf-meta {
            font-size: 10pt;
            color: #666;
          }
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          h1 { font-size: 18pt; }
          h2 { font-size: 14pt; }
          h3 { font-size: 12pt; }
          p {
            margin: 0 0 1em 0;
            text-align: justify;
            orphans: 3;
            widows: 3;
          }
          blockquote {
            margin: 1em 0;
            padding: 0.5em 1em;
            border-left: 3px solid #ccc;
            font-style: italic;
            background: #f9f9f9;
          }
          ul, ol {
            margin: 1em 0;
            padding-left: 2em;
          }
          li {
            margin-bottom: 0.3em;
          }
          a {
            color: #1a1a1a;
            text-decoration: underline;
          }
          code {
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            background: #f4f4f4;
            padding: 0.1em 0.3em;
          }
          pre {
            background: #f4f4f4;
            padding: 1em;
            overflow-x: auto;
            font-size: 9pt;
            page-break-inside: avoid;
          }
          hr {
            border: none;
            border-top: 1px solid #ccc;
            margin: 2em 0;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          .footnotes {
            font-size: 9pt;
            margin-top: 2em;
            padding-top: 1em;
            border-top: 1px solid #ccc;
          }
          details {
            margin: 1em 0;
          }
          summary {
            font-weight: bold;
            cursor: default;
            list-style: none;
          }
          .callout {
            padding: 1em;
            margin: 1em 0;
            background: #f9f9f9;
            border-left: 3px solid #666;
          }
          .sidenote, .marginnote {
            font-size: 9pt;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            font-size: 10pt;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 0.5em;
            text-align: left;
          }
          th {
            background: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <h1 class="pdf-title">\${title}</h1>
          \${subtitle ? '<p class="pdf-subtitle">' + subtitle + '</p>' : ''}
          <p class="pdf-meta">\${author}\${author && date ? ' — ' : ''}\${date}</p>
        </div>
        \${clone.innerHTML}
      </body>
      </html>
    \`;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      }, 250);
    };
  };

  pdfBtn.addEventListener('click', handleClick);
  window.addCleanup(() => pdfBtn.removeEventListener('click', handleClick));
});
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor
