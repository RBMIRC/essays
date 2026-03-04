---
title: "Attention Mechanism"
type: glossary
aliases: ["self-attention", "multi-head attention"]
tags:
  - glossary
  - AI
  - deep-learning
  - transformer
---

Core innovation of the Transformer architecture (2017): mechanism allowing each element of a sequence to attend to all other elements, weighted by learned relevance. "Attention is all you need" (Vaswani et al.) eliminated recurrence in favor of parallel attention computation. Self-attention enables models to capture long-range dependencies and contextual relationships. The mechanism that makes LLMs possible: each token's meaning emerges from its weighted relation to all other tokens. Computationally expensive but parallelizable.

**See also:** [[transformer|Transformer]], [[llm-large-language-model|LLM]]

**References:**
- VASWANI, Ashish, et al. "Attention Is All You Need." *NeurIPS*, 2017.
