import { Root as HTMLRoot, Element } from "hast"
import { toString } from "hast-util-to-string"
import { QuartzTransformerPlugin } from "../types"
import { escapeHTML } from "../../util/escape"
import { visit, SKIP } from "unist-util-visit"

export interface Options {
  descriptionLength: number
  maxDescriptionLength: number
  replaceExternalLinks: boolean
}

const defaultOptions: Options = {
  descriptionLength: 150,
  maxDescriptionLength: 300,
  replaceExternalLinks: true,
}

const urlRegex = new RegExp(
  /(https?:\/\/)?(?<domain>([\da-z\.-]+)\.([a-z\.]{2,6})(:\d+)?)(?<path>[\/\w\.-]*)(\?[\/\w\.=&;-]*)?/,
  "g",
)

// Classes to exclude from description extraction
const excludedClasses = ["heredoc", "sidenote", "footnotes"]

function hasExcludedClass(node: Element): boolean {
  const classes = node.properties?.className
  if (!classes) return false
  
  const classArray = Array.isArray(classes) ? classes : [classes]
  return classArray.some((cls) => 
    typeof cls === "string" && excludedClasses.some((exc) => cls.includes(exc))
  )
}

export const Description: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "Description",
    htmlPlugins() {
      return [
        () => {
          return async (tree: HTMLRoot, file) => {
            let frontMatterDescription = file.data.frontmatter?.description
            
            // Clone tree and remove excluded elements for description extraction
            const filteredTree = structuredClone(tree) as HTMLRoot
            
            // Remove heredoc and other excluded elements from the cloned tree
            visit(filteredTree, "element", (node, index, parent) => {
              if (hasExcludedClass(node)) {
                if (parent && typeof index === "number") {
                  parent.children.splice(index, 1)
                  return [SKIP, index]
                }
              }
            })
            
            let text = escapeHTML(toString(filteredTree))

            if (opts.replaceExternalLinks) {
              frontMatterDescription = frontMatterDescription?.replace(
                urlRegex,
                "$<domain>" + "$<path>",
              )
              text = text.replace(urlRegex, "$<domain>" + "$<path>")
            }

            if (frontMatterDescription) {
              file.data.description = frontMatterDescription
              file.data.text = escapeHTML(toString(tree)) // Full text for search
              return
            }

            // otherwise, use the text content
            const desc = text
            const sentences = desc.replace(/\s+/g, " ").split(/\.\s/)
            let finalDesc = ""
            let sentenceIdx = 0

            // Add full sentences until we exceed the guideline length
            while (sentenceIdx < sentences.length) {
              const sentence = sentences[sentenceIdx]
              if (!sentence) break

              const currentSentence = sentence.endsWith(".") ? sentence : sentence + "."
              const nextLength = finalDesc.length + currentSentence.length + (finalDesc ? 1 : 0)

              // Add the sentence if we're under the guideline length
              // or if this is the first sentence (always include at least one)
              if (nextLength <= opts.descriptionLength || sentenceIdx === 0) {
                finalDesc += (finalDesc ? " " : "") + currentSentence
                sentenceIdx++
              } else {
                break
              }
            }

            // truncate to max length if necessary
            file.data.description =
              finalDesc.length > opts.maxDescriptionLength
                ? finalDesc.slice(0, opts.maxDescriptionLength) + "..."
                : finalDesc
            file.data.text = escapeHTML(toString(tree)) // Full text for search
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    description: string
    text: string
  }
}
