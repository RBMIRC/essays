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
          <div class="export-buttons">
            <button
              class="pdf-download-btn"
              title="Download PDF"
              aria-label="Download as PDF"
              data-title={title}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <span>PDF</span>
            </button>
            <button
              class="epub-download-btn"
              title="Download EPUB"
              aria-label="Download as EPUB"
              data-title={title}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>EPUB</span>
            </button>
          </div>
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

.export-buttons {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-top: 0.5rem;
}

.pdf-download-btn,
.epub-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.6rem;
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 4px;
  color: var(--darkgray);
  font-size: 0.8rem;
  font-family: var(--bodyFont);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pdf-download-btn:hover,
.epub-download-btn:hover {
  background: var(--lightgray);
  color: var(--dark);
  border-color: var(--gray);
}

.pdf-download-btn svg,
.epub-download-btn svg {
  flex-shrink: 0;
}

.epub-download-btn.loading {
  opacity: 0.6;
  pointer-events: none;
}
`

ArticleTitle.afterDOMLoaded = `
document.addEventListener("nav", () => {
  const pdfBtn = document.querySelector('.pdf-download-btn');
  const epubBtn = document.querySelector('.epub-download-btn');

  // Helper to get article content and metadata
  function getArticleData() {
    const title = pdfBtn?.getAttribute('data-title') || epubBtn?.getAttribute('data-title') || 'document';
    const article = document.querySelector('article.popover-hint');
    const subtitle = document.querySelector('.content-subtitle')?.textContent || '';
    const author = document.querySelector('.content-author')?.textContent || '';
    const date = document.querySelector('.content-meta time')?.textContent || '';
    return { title, article, subtitle, author, date };
  }

  // Helper to clean article content
  function cleanArticleContent(article, forEpub = false) {
    const clone = article.cloneNode(true);
    clone.querySelectorAll('.pdf-download-btn, .epub-download-btn, .export-buttons, script, .callout-title svg, details summary').forEach(el => {
      if (el.tagName === 'SUMMARY') {
        el.style.listStyle = 'none';
      } else {
        el.remove();
      }
    });
    clone.querySelectorAll('details').forEach(d => d.setAttribute('open', 'true'));

    if (forEpub) {
      // Clean HTML for XHTML compatibility
      clone.querySelectorAll('*').forEach(el => {
        // Remove data attributes and event handlers
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('data-') || attr.name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
        });
      });
      // Remove SVGs (often cause issues)
      clone.querySelectorAll('svg').forEach(el => el.remove());
      // Remove iframes
      clone.querySelectorAll('iframe').forEach(el => el.remove());
    }
    return clone;
  }

  // PDF handler
  if (pdfBtn) {
    const handlePdfClick = () => {
      const { title, article, subtitle, author, date } = getArticleData();
      if (!article) {
        alert('Could not find article content');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download PDF');
        return;
      }

      const clone = cleanArticleContent(article);

      const printContent = \`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>\${title}</title>
          <style>
            @page { size: A4; margin: 25mm 20mm; }
            * { box-sizing: border-box; }
            body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; max-width: 100%; margin: 0; padding: 0; }
            .pdf-header { margin-bottom: 2em; padding-bottom: 1em; border-bottom: 1px solid #ccc; }
            .pdf-title { font-size: 20pt; font-weight: bold; margin: 0 0 0.3em 0; line-height: 1.2; }
            .pdf-subtitle { font-size: 12pt; font-style: italic; color: #555; margin: 0 0 0.5em 0; }
            .pdf-meta { font-size: 10pt; color: #666; }
            h1, h2, h3, h4, h5, h6 { page-break-after: avoid; margin-top: 1.5em; margin-bottom: 0.5em; }
            h1 { font-size: 18pt; } h2 { font-size: 14pt; } h3 { font-size: 12pt; }
            p { margin: 0 0 1em 0; text-align: justify; orphans: 3; widows: 3; }
            blockquote { margin: 1em 0; padding: 0.5em 1em; border-left: 3px solid #ccc; font-style: italic; background: #f9f9f9; }
            ul, ol { margin: 1em 0; padding-left: 2em; }
            li { margin-bottom: 0.3em; }
            a { color: #1a1a1a; text-decoration: underline; }
            code { font-family: 'Courier New', monospace; font-size: 9pt; background: #f4f4f4; padding: 0.1em 0.3em; }
            pre { background: #f4f4f4; padding: 1em; overflow-x: auto; font-size: 9pt; page-break-inside: avoid; }
            hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
            img { max-width: 100%; height: auto; }
            .footnotes { font-size: 9pt; margin-top: 2em; padding-top: 1em; border-top: 1px solid #ccc; }
            details { margin: 1em 0; }
            summary { font-weight: bold; cursor: default; list-style: none; }
            .callout { padding: 1em; margin: 1em 0; background: #f9f9f9; border-left: 3px solid #666; }
            .sidenote, .marginnote { font-size: 9pt; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 10pt; }
            th, td { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
            th { background: #f4f4f4; }
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
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        }, 250);
      };
    };

    pdfBtn.addEventListener('click', handlePdfClick);
    window.addCleanup(() => pdfBtn.removeEventListener('click', handlePdfClick));
  }

  // EPUB handler
  if (epubBtn) {
    const handleEpubClick = async () => {
      const { title, article, subtitle, author, date } = getArticleData();
      if (!article) {
        alert('Could not find article content');
        return;
      }

      epubBtn.classList.add('loading');
      epubBtn.querySelector('span').textContent = '...';

      try {
        // Load JSZip from CDN if not already loaded
        if (typeof JSZip === 'undefined') {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const clone = cleanArticleContent(article, true);
        const safeTitle = title.replace(/[^a-zA-Z0-9\\s-]/g, '').trim() || 'document';
        const uuid = 'urn:uuid:' + crypto.randomUUID();
        const lang = window.location.pathname.includes('/fr/') ? 'fr' : 'en';

        // Convert HTML to clean XHTML
        function htmlToXhtml(html) {
          return html
            .replace(/<br>/g, '<br/>')
            .replace(/<hr>/g, '<hr/>')
            .replace(/<img([^>]*)(?<!\\/)>/g, '<img$1/>')
            .replace(/&nbsp;/g, '&#160;')
            .replace(/&mdash;/g, '&#8212;')
            .replace(/&ndash;/g, '&#8211;')
            .replace(/&lsquo;/g, '&#8216;')
            .replace(/&rsquo;/g, '&#8217;')
            .replace(/&ldquo;/g, '&#8220;')
            .replace(/&rdquo;/g, '&#8221;')
            .replace(/&hellip;/g, '&#8230;')
            .replace(/&([a-zA-Z]+);/g, function(match, entity) {
              const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: \"'\" };
              return entities[entity] || match;
            });
        }
        const cleanContent = htmlToXhtml(clone.innerHTML);

        // EPUB content
        const xhtmlContent = \`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="\${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>\${title}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <header>
    <h1>\${title}</h1>
    \${subtitle ? '<p class="subtitle">' + subtitle + '</p>' : ''}
    <p class="meta">\${author}\${author && date ? ' — ' : ''}\${date}</p>
  </header>
  <main>
    \${cleanContent}
  </main>
</body>
</html>\`;

        const cssContent = \`
body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; margin: 1em; }
header { margin-bottom: 2em; padding-bottom: 1em; border-bottom: 1px solid #ccc; }
h1 { font-size: 1.8em; margin: 0 0 0.3em 0; }
.subtitle { font-style: italic; color: #555; margin: 0 0 0.5em 0; }
.meta { font-size: 0.9em; color: #666; }
h2 { font-size: 1.4em; margin-top: 1.5em; }
h3 { font-size: 1.2em; }
p { margin: 0 0 1em 0; text-align: justify; }
blockquote { margin: 1em 0; padding: 0.5em 1em; border-left: 3px solid #ccc; font-style: italic; }
ul, ol { margin: 1em 0; padding-left: 2em; }
a { color: #333; }
code { font-family: monospace; background: #f4f4f4; padding: 0.1em 0.3em; }
pre { background: #f4f4f4; padding: 1em; overflow-x: auto; }
hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
img { max-width: 100%; height: auto; }
table { width: 100%; border-collapse: collapse; margin: 1em 0; }
th, td { border: 1px solid #ccc; padding: 0.5em; }
details { margin: 1em 0; }
summary { font-weight: bold; }
\`;

        const containerXml = \`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>\`;

        const contentOpf = \`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">\${uuid}</dc:identifier>
    <dc:title>\${title}</dc:title>
    <dc:creator>\${author || 'Unknown'}</dc:creator>
    <dc:language>\${lang}</dc:language>
    <meta property="dcterms:modified">\${new Date().toISOString().replace(/\\.\\d{3}Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  </manifest>
  <spine>
    <itemref idref="content"/>
  </spine>
</package>\`;

        const navXhtml = \`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>Navigation</title>
</head>
<body>
  <nav epub:type="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="content.xhtml">\${title}</a></li>
    </ol>
  </nav>
</body>
</html>\`;

        // Create EPUB (ZIP) file
        // mimetype must be first and uncompressed
        const zip = new JSZip();
        zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
        zip.folder('META-INF').file('container.xml', containerXml);
        const oebps = zip.folder('OEBPS');
        oebps.file('content.xhtml', xhtmlContent);
        oebps.file('style.css', cssContent);
        oebps.file('content.opf', contentOpf);
        oebps.file('nav.xhtml', navXhtml);

        const blob = await zip.generateAsync({
          type: 'blob',
          mimeType: 'application/epub+zip'
        });

        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = safeTitle + '.epub';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

      } catch (err) {
        console.error('EPUB generation error:', err);
        alert('Error generating EPUB: ' + err.message);
      } finally {
        epubBtn.classList.remove('loading');
        epubBtn.querySelector('span').textContent = 'EPUB';
      }
    };

    epubBtn.addEventListener('click', handleEpubClick);
    window.addCleanup(() => epubBtn.removeEventListener('click', handleEpubClick));
  }
});
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor
