---
title: "Context Window"
type: glossary
aliases: ["context length"]
tags:
  - glossary
  - AI
  - LLM
  - architecture
---

Maximum amount of text a language model can process at once. GPT-4 Turbo: 128K tokens; Claude: 200K tokens. Determines how much prior conversation or document content the model can "remember" within a single interaction. Longer context enables processing entire books but increases computational cost quadratically with attention mechanisms. Outside the context window, information is not accessible—the model has no persistent memory across sessions unless fine-tuned or using retrieval systems.

**See also:** [[attention-mechanism|Attention Mechanism]], [[token-tokenization|Token]], [[llm-large-language-model|LLM]]

**References:**
- Technical documentation from model providers.
