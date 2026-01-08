import { QuartzTransformerPlugin } from "../types"
import { Root, Element, Text } from "hast"
import { visit } from "unist-util-visit"
import path from "path"
import fs from "fs"
import matter from "gray-matter"

interface Options {
  /** Path to glossary terms relative to content folder */
  glossaryPath: string
  /** Link first occurrence only or all */
  linkMode: "first" | "all"
  /** Case sensitive matching */
  caseSensitive: boolean
  /** Tags to exclude from processing */
  excludeTags: string[]
  /** Tooltip mode */
  tooltipMode: "hover" | "click"
  /** Store definition in data attribute */
  dataAttribute: boolean
}

interface GlossaryTerm {
  title: string
  slug: string
  definition: string
  author?: string
}

const defaultOptions: Options = {
  glossaryPath: "en/lexicon/terms",
  linkMode: "first",
  caseSensitive: false,
  excludeTags: ["code", "pre", "h1", "h2", "h3", "a", "script", "style"],
  tooltipMode: "hover",
  dataAttribute: true,
}

// Cache for glossary terms
let glossaryCache: Map<string, GlossaryTerm> | null = null

function loadGlossaryTerms(contentPath: string, glossaryPath: string): Map<string, GlossaryTerm> {
  if (glossaryCache) return glossaryCache

  const termsDir = path.join(contentPath, glossaryPath)
  const terms = new Map<string, GlossaryTerm>()

  if (!fs.existsSync(termsDir)) {
    console.warn(`GlossaryAutoLink: Terms directory not found: ${termsDir}`)
    return terms
  }

  const files = fs.readdirSync(termsDir).filter(f => f.endsWith(".md"))

  for (const file of files) {
    const filePath = path.join(termsDir, file)
    const content = fs.readFileSync(filePath, "utf-8")
    const { data, content: body } = matter(content)

    const title = data.title || file.replace(".md", "")
    const slug = `/${glossaryPath}/${file.replace(".md", "")}`

    // Get first sentence as definition
    const cleanBody = body.trim()
    const firstSentenceMatch = cleanBody.match(/^[^.!?]+[.!?]/)
    const definition = data.description || (firstSentenceMatch ? firstSentenceMatch[0].trim() : cleanBody.slice(0, 150) + "...")

    terms.set(title.toLowerCase(), {
      title,
      slug,
      definition,
      author: data.author,
    })

    // Also add aliases if present
    if (data.aliases && Array.isArray(data.aliases)) {
      for (const alias of data.aliases) {
        terms.set(alias.toLowerCase(), {
          title,
          slug,
          definition,
          author: data.author,
        })
      }
    }
  }

  glossaryCache = terms
  return terms
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function isExcludedAncestor(ancestors: Element[], excludeTags: string[]): boolean {
  return ancestors.some(ancestor => excludeTags.includes(ancestor.tagName.toLowerCase()))
}

export const GlossaryAutoLink: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "GlossaryAutoLink",
    htmlPlugins(ctx) {
      // Load glossary terms
      // ctx.argv.directory is the content directory (e.g., "content")
      const terms = loadGlossaryTerms(ctx.argv.directory, opts.glossaryPath)

      if (terms.size === 0) {
        return []
      }

      // Sort terms by length (longest first) to match longer terms before shorter ones
      const sortedTerms = Array.from(terms.entries()).sort((a, b) => b[0].length - a[0].length)

      // Build regex pattern for all terms
      const termPatterns = sortedTerms.map(([term]) => escapeRegex(term))
      const regexFlags = opts.caseSensitive ? "g" : "gi"
      const termRegex = new RegExp(`\\b(${termPatterns.join("|")})\\b`, regexFlags)

      return [
        () => {
          return (tree: Root, file) => {
            // Skip glossary pages themselves
            const currentSlug = file.data.slug || ""
            if (currentSlug.includes(opts.glossaryPath)) {
              return
            }

            // Track which terms have been linked (for "first" mode)
            const linkedTerms = new Set<string>()

            visit(tree, "text", (node: Text, index, parent) => {
              if (!parent || typeof index !== "number") return

              // Check if we're inside an excluded tag
              const ancestors: Element[] = []
              let current = parent
              while (current) {
                if (current.type === "element") {
                  ancestors.push(current as Element)
                }
                // @ts-ignore - parent may exist on nodes
                current = current.parent
              }

              // Build ancestor chain by walking up
              // Note: unist-util-visit doesn't provide full ancestor chain,
              // so we check the immediate parent
              if (parent.type === "element") {
                const parentEl = parent as Element
                if (opts.excludeTags.includes(parentEl.tagName.toLowerCase())) {
                  return
                }
                // Check for ancestor exclusions via class
                const classes = (parentEl.properties?.className as string[]) || []
                if (classes.includes("glossary-term")) {
                  return
                }
              }

              const text = node.value
              if (!termRegex.test(text)) return

              // Reset regex lastIndex
              termRegex.lastIndex = 0

              const newChildren: (Text | Element)[] = []
              let lastIndex = 0
              let match: RegExpExecArray | null

              while ((match = termRegex.exec(text)) !== null) {
                const matchedTerm = match[1]
                const termKey = matchedTerm.toLowerCase()
                const termData = terms.get(termKey)

                if (!termData) continue

                // Check if already linked in "first" mode
                if (opts.linkMode === "first" && linkedTerms.has(termKey)) {
                  continue
                }

                // Add text before match
                if (match.index > lastIndex) {
                  newChildren.push({
                    type: "text",
                    value: text.slice(lastIndex, match.index),
                  })
                }

                // Create the glossary term span
                const termSpan: Element = {
                  type: "element",
                  tagName: "span",
                  properties: {
                    className: ["glossary-term"],
                    "data-term": termData.title,
                    "data-slug": termData.slug,
                  },
                  children: [{ type: "text", value: matchedTerm }],
                }

                if (opts.dataAttribute) {
                  termSpan.properties!["data-definition"] = termData.definition
                  if (termData.author) {
                    termSpan.properties!["data-author"] = termData.author
                  }
                }

                newChildren.push(termSpan)
                lastIndex = match.index + matchedTerm.length

                if (opts.linkMode === "first") {
                  linkedTerms.add(termKey)
                }
              }

              // Add remaining text
              if (lastIndex < text.length) {
                newChildren.push({
                  type: "text",
                  value: text.slice(lastIndex),
                })
              }

              // Replace the text node with new children if we made changes
              if (newChildren.length > 0 && lastIndex > 0) {
                const parentEl = parent as Element
                parentEl.children.splice(index, 1, ...newChildren)
              }
            })
          }
        },
      ]
    },
  }
}
