import { QuartzTransformerPlugin } from "../types"
import { visit } from "unist-util-visit"
import { Element, Root } from "hast"

export interface Options {
  /**
   * Enable sidenotes on desktop, fallback to footnotes on mobile
   */
  enabled: boolean
}

const defaultOptions: Options = {
  enabled: true,
}

/**
 * Transforms standard markdown footnotes into sidenotes (margin notes)
 * Inspired by Tufte CSS and gwern.net
 * 
 * Input (from remark-gfm):
 * <sup><a href="#user-content-fn-1" id="user-content-fnref-1">1</a></sup>
 * ...
 * <section data-footnotes>
 *   <ol>
 *     <li id="user-content-fn-1">Content <a href="#user-content-fnref-1">↩</a></li>
 *   </ol>
 * </section>
 * 
 * Output:
 * <span class="sidenote-wrapper">
 *   <label class="sidenote-toggle sidenote-number" for="sn-1">1</label>
 *   <input type="checkbox" id="sn-1" class="sidenote-checkbox" />
 *   <span class="sidenote">Content</span>
 * </span>
 */
export const Sidenotes: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "Sidenotes",
    htmlPlugins() {
      if (!opts.enabled) return []

      return [
        () => {
          return (tree: Root) => {
            // First pass: collect all footnote definitions
            const footnotes: Map<string, Element[]> = new Map()
            let footnotesSection: Element | null = null

            visit(tree, "element", (node: Element) => {
              // Find the footnotes section
              if (
                node.tagName === "section" &&
                node.properties?.dataFootnotes !== undefined
              ) {
                footnotesSection = node

                // Extract footnote content from the ordered list
                visit(node, "element", (li: Element) => {
                  if (li.tagName === "li" && li.properties?.id) {
                    const id = String(li.properties.id)
                    // Extract the footnote number from id (e.g., "user-content-fn-1" -> "1")
                    const match = id.match(/fn-(\d+)$/) || id.match(/fn-(.+)$/)
                    if (match) {
                      const fnId = match[1]
                      // Clone children, removing the backref link
                      const content = (li.children as Element[]).filter(
                        (child) =>
                          !(
                            child.type === "element" &&
                            child.tagName === "a" &&
                            child.properties?.dataFootnoteBackref !== undefined
                          )
                      )
                      // Also filter out backref from nested paragraphs
                      const cleanedContent = content.map((child) => {
                        if (child.type === "element" && child.tagName === "p") {
                          return {
                            ...child,
                            children: (child.children as Element[]).filter(
                              (c) =>
                                !(
                                  c.type === "element" &&
                                  c.tagName === "a" &&
                                  c.properties?.dataFootnoteBackref !== undefined
                                )
                            ),
                          }
                        }
                        return child
                      })
                      footnotes.set(fnId, cleanedContent as Element[])
                    }
                  }
                })
              }
            })

            // Second pass: replace footnote references with sidenotes
            visit(tree, "element", (node: Element, index, parent) => {
              // Find footnote references: <sup><a href="#user-content-fn-X">X</a></sup>
              if (node.tagName === "sup" && parent && typeof index === "number") {
                const link = node.children?.find(
                  (child): child is Element =>
                    child.type === "element" && child.tagName === "a"
                )

                if (link?.properties?.href) {
                  const href = String(link.properties.href)
                  const match = href.match(/#user-content-fn-(\d+)$/) || href.match(/#user-content-fn-(.+)$/)

                  if (match) {
                    const fnId = match[1]
                    const content = footnotes.get(fnId)

                    if (content) {
                      // Get the footnote number from the link text
                      const fnNumber =
                        link.children?.[0]?.type === "text"
                          ? link.children[0].value
                          : fnId

                      // Create sidenote structure
                      const sidenoteWrapper: Element = {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["sidenote-wrapper"] },
                        children: [
                          // Label (clickable number for mobile toggle)
                          {
                            type: "element",
                            tagName: "label",
                            properties: {
                              className: ["sidenote-toggle", "sidenote-number"],
                              for: `sn-${fnId}`,
                            },
                            children: [{ type: "text", value: String(fnNumber) }],
                          },
                          // Hidden checkbox for mobile toggle
                          {
                            type: "element",
                            tagName: "input",
                            properties: {
                              type: "checkbox",
                              id: `sn-${fnId}`,
                              className: ["sidenote-checkbox"],
                            },
                            children: [],
                          },
                          // Sidenote content
                          {
                            type: "element",
                            tagName: "span",
                            properties: {
                              className: ["sidenote"],
                              id: `sidenote-${fnId}`,
                            },
                            children: [
                              {
                                type: "element",
                                tagName: "span",
                                properties: { className: ["sidenote-number-inline"] },
                                children: [{ type: "text", value: `${fnNumber}. ` }],
                              },
                              ...content,
                            ],
                          },
                        ],
                      }

                      // Replace the <sup> with the sidenote wrapper
                      ;(parent as Element).children[index] = sidenoteWrapper
                    }
                  }
                }
              }
            })

            // Third pass: remove the original footnotes section
            if (footnotesSection) {
              visit(tree, "element", (node: Element, index, parent) => {
                if (node === footnotesSection && parent && typeof index === "number") {
                  ;(parent as Element).children.splice(index, 1)
                  return "skip"
                }
              })
            }
          }
        },
      ]
    },
  }
}

