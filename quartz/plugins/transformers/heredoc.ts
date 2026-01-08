import { QuartzTransformerPlugin } from "../types"

export const HeredocTransformer: QuartzTransformerPlugin = () => {
  return {
    name: "HeredocTransformer",
    textTransform(_ctx, src) {
      const heredocRegex = /<<(HEREDOC[\w-]*)\s*([\s\S]*?)>>\1/g
      
      return src.replace(heredocRegex, (_match, name, content) => {
        const trimmed = content.trim()
        return `\`\`\`heredoc
◈ ${name}
${trimmed}
\`\`\``
      })
    },
  }
}
