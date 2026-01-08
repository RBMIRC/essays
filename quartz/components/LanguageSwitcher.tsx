import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { simplifySlug } from "../util/path"
import { classNames } from "../util/lang"

// Section mapping FR ↔ EN
const frToEn: Record<string, string> = {
  "tactiques": "tactics",
  "communs": "commons",
  "lexique": "lexicon",
}

const enToFr: Record<string, string> = {
  "tactics": "tactiques",
  "commons": "communs",
  "lexicon": "lexique",
}

export default (() => {
  const LanguageSwitcher: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
    const slug = simplifySlug(fileData.slug!)
    const parts = slug.split("/").filter(Boolean)

    // Detect current language
    const currentLang = parts[0] === "fr" ? "fr" : "en"
    const isEn = currentLang === "en"

    // Check for explicit translation link in frontmatter
    const translation = fileData.frontmatter?.translation as string | undefined

    // Build base path from config
    const baseUrl = cfg.baseUrl ? `/${cfg.baseUrl}` : ""

    // Helper to normalize path (remove trailing slash)
    const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/"

    // Build target paths (without trailing slashes for GitHub Pages compatibility)
    let enPath = `${baseUrl}/en`
    let frPath = `${baseUrl}/fr`

    if (translation) {
      // Use explicit translation link for the OTHER language
      // The translation field contains path like "/fr/communs/manifeste-heredoc/"
      const currentPath = normalizePath(`${baseUrl}/${slug}`)
      const translationPath = normalizePath(`${baseUrl}${translation}`)
      if (isEn) {
        enPath = currentPath
        frPath = translationPath
      } else {
        frPath = currentPath
        enPath = translationPath
      }
    } else if (parts.length > 1) {
      // Fallback: automatic path mapping
      const pathParts = parts.slice(1)

      // For EN path: map FR sections to EN
      const enParts = pathParts.map((p, i) => i === 0 && frToEn[p] ? frToEn[p] : p)
      enPath = `${baseUrl}/en/${enParts.join("/")}`

      // For FR path: map EN sections to FR
      const frParts = pathParts.map((p, i) => i === 0 && enToFr[p] ? enToFr[p] : p)
      frPath = `${baseUrl}/fr/${frParts.join("/")}`
    }

    return (
      <div class={classNames(displayClass, "language-switcher")}>
        <a href={enPath} class={isEn ? "lang-link active" : "lang-link"}>EN</a>
        <span class="lang-separator">/</span>
        <a href={frPath} class={!isEn ? "lang-link active" : "lang-link"}>FR</a>
      </div>
    )
  }

  LanguageSwitcher.css = `
    .language-switcher { display: flex; align-items: center; gap: 0.25rem; }
    .lang-link { text-decoration: none; opacity: 0.6; padding: 0.25rem 0.5rem; }
    .lang-link:hover, .lang-link.active { opacity: 1; }
    .lang-separator { opacity: 0.4; }
  `

  return LanguageSwitcher
}) satisfies QuartzComponentConstructor
