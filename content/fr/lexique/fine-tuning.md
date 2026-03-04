---
title: "Fine-tuning"
type: glossary
aliases: ["ajustement fin", "réglage fin"]
tags:
  - glossary
  - AI
  - deep-learning
  - training
---

Processus d'adaptation d'un modèle pré-entraîné à des tâches ou domaines spécifiques en poursuivant l'entraînement sur des données spécialisées. Un modèle de fondation entraîné sur un corpus général est fine-tuné sur des documents juridiques, des textes médicaux ou du code. Nécessite moins de données et de calcul que l'entraînement à partir de zéro. LoRA (Low-Rank Adaptation) et d'autres techniques réduisent encore les coûts de fine-tuning. Permet la personnalisation tout en préservant les capacités générales. Soulève aussi des questions sur qui peut se permettre le fine-tuning et sur quelles données.

**Voir aussi :** [[training|Entraînement]], [[llm-large-language-model|LLM]], [[dataset-training-corpus|Jeu de données]]

**Références :**
- HOWARD, Jeremy et Sebastian RUDER. "Universal Language Model Fine-tuning for Text Classification." *ACL*, 2018.
- HU, Edward, et al. "LoRA: Low-Rank Adaptation of Large Language Models." *ICLR*, 2022.
