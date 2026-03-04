---
title: "Temperature (Generation)"
type: glossary
aliases: ["sampling temperature"]
tags:
  - glossary
  - AI
  - generation
  - parameter
---

Parameter controlling randomness in text/image generation. Low temperature (0.1-0.3): model chooses most probable tokens, producing predictable, repetitive output. High temperature (0.8-1.2): flattens probability distribution, increasing variety and creativity but risking incoherence. Temperature 0 = deterministic (always highest probability). Metaphor from thermodynamics: higher temperature = more molecular motion/randomness. User-adjustable parameter that shapes the "personality" of generated output.

**See also:** [[inference|Inference]], [[stochastic-process|Stochastic Process]]

**References:**
- Standard parameter in language model APIs (OpenAI, Anthropic, etc.).
