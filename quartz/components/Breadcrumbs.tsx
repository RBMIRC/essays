import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import breadcrumbsStyle from "./styles/breadcrumbs.scss"
import { FullSlug, SimpleSlug, resolveRelative, simplifySlug } from "../util/path"
import { classNames } from "../util/lang"
import { trieFromAllFiles } from "../util/ctx"

type CrumbData = {
  displayName: string
  path: string
}

interface BreadcrumbOptions {
  spacerSymbol: string
  rootName: string
  rootNameFr?: string  // French root name
  resolveFrontmatterTitle: boolean
  showCurrentPage: boolean
}

const defaultOptions: BreadcrumbOptions = {
  spacerSymbol: "›",
  rootName: "Essays",
  rootNameFr: "Essais",
  resolveFrontmatterTitle: true,
  showCurrentPage: false,
}

// Section name translations
const sectionNames: Record<string, Record<string, string>> = {
  en: {
    introduction: "Introduction",
    "black-mountain-college": "Black Mountain College",
    archives: "Archives",
    images: "Images",
    tactics: "Tactics",
    commons: "Commons",
    lexicon: "Lexicon",
  },
  fr: {
    introduction: "Introduction",
    "black-mountain-college": "Black Mountain College",
    archives: "Archives",
    images: "Images",
    tactiques: "Tactiques",
    communs: "Communs",
    lexique: "Lexique",
  },
}

function formatCrumb(displayName: string, baseSlug: FullSlug, currentSlug: SimpleSlug): CrumbData {
  return {
    displayName: displayName.replaceAll("-", " "),
    path: resolveRelative(baseSlug, currentSlug),
  }
}

export default ((opts?: Partial<BreadcrumbOptions>) => {
  const options: BreadcrumbOptions = { ...defaultOptions, ...opts }

  const Breadcrumbs: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
    ctx,
    cfg,
  }: QuartzComponentProps) => {
    const trie = (ctx.trie ??= trieFromAllFiles(allFiles))
    const slugParts = fileData.slug!.split("/")
    const pathNodes = trie.ancestryChain(slugParts)

    if (!pathNodes) {
      return null
    }

    // Build absolute base path from config
    const baseUrl = cfg.baseUrl ? `/${cfg.baseUrl}` : ""

    // Detect language from slug
    const currentLang = slugParts[0] === "fr" ? "fr" : "en"
    const rootName = currentLang === "fr" ? (options.rootNameFr ?? options.rootName) : options.rootName

    // Build crumbs, skipping the language folder (en/fr)
    const crumbs: CrumbData[] = []

    pathNodes.forEach((node, idx) => {
      const nodeName = node.displayName.toLowerCase()

      // Skip root (will add custom root) and language folders
      if (idx === 0) {
        return
      }

      // Skip "en" and "fr" folders
      if (nodeName === "en" || nodeName === "fr") {
        return
      }

      // Get display name - use section translation if available
      let displayName = node.displayName
      if (sectionNames[currentLang]?.[nodeName]) {
        displayName = sectionNames[currentLang][nodeName]
      } else {
        displayName = displayName.replaceAll("-", " ")
        // Capitalize first letter of each word
        displayName = displayName.replace(/\b\w/g, (c) => c.toUpperCase())
      }

      const crumb = {
        displayName,
        path: `${baseUrl}/${simplifySlug(node.slug)}`,
      }

      // For last node (current page), set empty path
      if (idx === pathNodes.length - 1) {
        crumb.path = ""
      }

      crumbs.push(crumb)
    })

    // Remove current page if option is false
    if (!options.showCurrentPage && crumbs.length > 0) {
      crumbs.pop()
    }

    // Add root at the beginning
    crumbs.unshift({
      displayName: rootName,
      path: `${baseUrl}/${currentLang}`,
    })

    // Don't show breadcrumb if only root
    if (crumbs.length <= 1) {
      return null
    }

    return (
      <nav class={classNames(displayClass, "breadcrumb-container")} aria-label="breadcrumbs">
        {crumbs.map((crumb, index) => (
          <div class="breadcrumb-element">
            {crumb.path ? (
              <a href={crumb.path}>{crumb.displayName}</a>
            ) : (
              <span>{crumb.displayName}</span>
            )}
            {index !== crumbs.length - 1 && <span class="breadcrumb-spacer">{options.spacerSymbol}</span>}
          </div>
        ))}
      </nav>
    )
  }
  
  Breadcrumbs.css = breadcrumbsStyle

  return Breadcrumbs
}) satisfies QuartzComponentConstructor
