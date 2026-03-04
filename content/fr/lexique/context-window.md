---
title: "Fenêtre de contexte"
type: glossary
aliases: ["Context Window", "longueur de contexte"]
tags:
  - glossary
  - AI
  - LLM
  - architecture
---

Quantité maximale de texte qu'un modèle de langage peut traiter en une fois. GPT-4 Turbo : 128K tokens ; Claude : 200K tokens. Détermine combien de conversation antérieure ou de contenu documentaire le modèle peut « mémoriser » au sein d'une seule interaction. Un contexte plus long permet de traiter des livres entiers mais augmente le coût computationnel de façon quadratique avec les mécanismes d'attention. En dehors de la fenêtre de contexte, l'information n'est pas accessible — le modèle n'a pas de mémoire persistante entre les sessions à moins d'être fine-tuné ou d'utiliser des systèmes de récupération.

**Voir aussi :** [[attention-mechanism|Mécanisme d'attention]], [[token-tokenization|Token]], [[llm-large-language-model|LLM]]

**Références :**
- Documentation technique des fournisseurs de modèles.
