import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface HypothesisOptions {
  // Groupe privé (optionnel) - laisser vide pour public
  groupId?: string
  // Ouvrir le sidebar par défaut
  openSidebar?: boolean
  // Thème: 'clean' ou 'classic'
  theme?: 'clean' | 'classic'
  // Désactiver sur certaines pages
  disableOnPaths?: string[]
}

const defaultOptions: HypothesisOptions = {
  groupId: undefined,
  openSidebar: false,
  theme: 'clean',
  disableOnPaths: ['/lexicon', '/lexique', '/figures']
}

export default ((userOpts?: Partial<HypothesisOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Hypothesis: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    // Ne pas charger sur certaines pages
    if (opts.disableOnPaths?.some(path => fileData.slug?.startsWith(path.replace(/^\//, '')))) {
      return null
    }
    return null
  }

  Hypothesis.afterDOMLoaded = `
    (function() {
      // Configuration Hypothes.is
      window.hypothesisConfig = function() {
        return {
          ${opts.groupId ? `"group": "${opts.groupId}",` : ''}
          "openSidebar": ${opts.openSidebar},
          "theme": "${opts.theme}",
          "showHighlights": "whenSidebarOpen",
          "ignoreSelector": "[data-hypothesis-ignore], .no-annotation, pre, code, .glossary-popup, .glossary-tooltip, .graph, .explorer, .toc, .backlinks"
        };
      };

      // Charger le script
      var script = document.createElement('script');
      script.src = 'https://hypothes.is/embed.js';
      script.async = true;
      document.head.appendChild(script);
    })();
  `

  Hypothesis.css = `
    /* Ajuster le sidebar pour ne pas chevaucher le contenu Quartz */
    .annotator-frame {
      z-index: 1000 !important;
    }

    /* Style des highlights - grayscale theme */
    hypothesis-highlight {
      background-color: rgba(128, 128, 128, 0.25) !important;
      cursor: pointer;
    }

    hypothesis-highlight:hover {
      background-color: rgba(128, 128, 128, 0.4) !important;
    }

    /* Mode sombre */
    [saved-theme="dark"] hypothesis-highlight {
      background-color: rgba(180, 180, 180, 0.2) !important;
    }

    [saved-theme="dark"] hypothesis-highlight:hover {
      background-color: rgba(180, 180, 180, 0.35) !important;
    }

    /* Cacher sur mobile si trop intrusif */
    @media (max-width: 768px) {
      .annotator-frame.annotator-collapsed {
        display: none;
      }
    }
  `

  return Hypothesis
}) satisfies QuartzComponentConstructor
