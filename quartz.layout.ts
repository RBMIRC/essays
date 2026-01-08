import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.Navigation(),
    Component.LanguageSwitcher(),
  ],
  afterBody: [
    Component.TagCloud({
      title: "Keywords",
      titleFr: "Mots-clés",
      limit: 20,
      showCount: false,
    }),
    Component.ImagePreview(),
    Component.Hypothesis({
      // groupId: "your-group-id",  // Décommenter pour groupe privé
      openSidebar: false,
      theme: 'clean',
      disableOnPaths: ['/lexicon', '/lexique', '/figures', '/en/lexicon', '/fr/lexique'],
    }),
  ],
  footer: Component.Footer({
    links: {}, // Vide - plus de liens dans le footer
  }),
}

// components for pages that display a single page
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({
      spacerSymbol: "›",
      rootName: "Essays",
      showCurrentPage: false,
    }),
    Component.ArticleTitle(),
    Component.ContentMeta({ showReadingTime: true }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.ExternalLinks(), // Nouveau composant
  ],
  right: [
    Component.Graph({
      localGraph: {
        drag: true,
        zoom: true,
        depth: 1,
        scale: 1.1,
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: [],
        showTags: true,
      },
      globalGraph: {
        drag: true,
        zoom: true,
        depth: -1,
        scale: 0.9,
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: [],
        showTags: true,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({
      spacerSymbol: "›",
      rootName: "Essays",
      showCurrentPage: false,
    }),
    Component.ArticleTitle(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.ExternalLinks(), // Aussi ici
  ],
  right: [],
}
