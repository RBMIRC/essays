---
title: "RLHF (Apprentissage par renforcement à partir de feedback humain)"
type: glossary
aliases: ["Reinforcement Learning from Human Feedback"]
tags:
  - glossary
  - AI
  - alignment
  - training
---

Technique d'entraînement alignant les modèles de langage sur les préférences humaines. Après le pré-entraînement initial, des évaluateurs humains comparent les sorties du modèle ; un modèle de récompense apprend ces préférences ; le modèle de langage est ensuite fine-tuné par apprentissage par renforcement pour maximiser le signal de récompense. Utilisé par ChatGPT, Claude et d'autres assistants. Façonne le comportement du modèle vers l'utilité, l'innocuité et l'honnêteté — mais encode aussi les biais des évaluateurs et leurs présupposés culturels. L'« humain » dans RLHF est souvent des travailleurs contractuels sous-payés.

**Voir aussi :** [[fine-tuning|Fine-tuning]], [[training|Entraînement]], [[ghost-work|Travail fantôme]]

**Références :**
- OUYANG, Long, et al. "Training language models to follow instructions with human feedback." *NeurIPS*, 2022.
- CHRISTIANO, Paul, et al. "Deep reinforcement learning from human preferences." *NeurIPS*, 2017.
