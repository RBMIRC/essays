---
title: "RLHF (Reinforcement Learning from Human Feedback)"
type: glossary
aliases: ["Reinforcement Learning from Human Feedback"]
tags:
  - glossary
  - AI
  - alignment
  - training
---

Training technique aligning language models with human preferences. After initial pre-training, human raters compare model outputs; a reward model learns these preferences; the language model is then fine-tuned using reinforcement learning to maximize the reward signal. Used by ChatGPT, Claude, and other assistants. Shapes model behavior toward helpfulness, harmlessness, and honesty—but also encodes raters' biases and cultural assumptions. The "human" in RLHF is often underpaid contract workers.

**See also:** [[fine-tuning|Fine-tuning]], [[training|Training]], [[ghost-work|Ghost Work]]

**References:**
- OUYANG, Long, et al. "Training language models to follow instructions with human feedback." *NeurIPS*, 2022.
- CHRISTIANO, Paul, et al. "Deep reinforcement learning from human preferences." *NeurIPS*, 2017.
