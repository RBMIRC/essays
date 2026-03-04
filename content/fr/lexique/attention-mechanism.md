---
title: "Mécanisme d'attention"
type: glossary
aliases: ["Attention Mechanism", "self-attention", "auto-attention"]
tags:
  - glossary
  - AI
  - deep-learning
  - transformer
---

Innovation centrale de l'architecture Transformer (2017). Permet au modèle de pondérer dynamiquement l'importance de différentes parties de l'entrée lors du traitement de chaque élément. L'« attention multi-têtes » exécute plusieurs opérations d'attention en parallèle, capturant différents types de relations. Rend possible le traitement de longues séquences en permettant des connexions directes entre positions éloignées, contournant la limitation des réseaux récurrents. Fondement technique de tous les grands modèles de langage actuels.

**Voir aussi :** [[transformer|Transformer]], [[context-window|Fenêtre de contexte]]

**Références :**
- VASWANI, Ashish et al. "Attention Is All You Need." *NeurIPS*, 2017.
