---
title: "Fine-tuning"
type: glossary
aliases: ["fine-tune", "finetuning"]
tags:
  - glossary
  - AI
  - deep-learning
  - training
---

Process of adapting a pre-trained model to specific tasks or domains by continuing training on specialized data. A foundation model trained on general corpus is fine-tuned on legal documents, medical texts, or code. Requires less data and compute than training from scratch. LoRA (Low-Rank Adaptation) and other techniques reduce fine-tuning costs further. Enables customization while preserving general capabilities. Also raises questions of who can afford to fine-tune and on what data.

**See also:** [[training|Training]], [[llm-large-language-model|LLM]], [[dataset-training-corpus|Dataset]]

**References:**
- HOWARD, Jeremy, and Sebastian RUDER. "Universal Language Model Fine-tuning for Text Classification." *ACL*, 2018.
- HU, Edward, et al. "LoRA: Low-Rank Adaptation of Large Language Models." *ICLR*, 2022.
