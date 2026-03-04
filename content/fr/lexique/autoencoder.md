---
title: "Auto-encodeur"
type: glossary
aliases: ["Autoencoder", "VAE", "variational autoencoder"]
tags:
  - glossary
  - AI
  - deep-learning
  - generative
---

Réseau de neurones apprenant des représentations compressées par reconstruction. L'encodeur compresse l'entrée en un espace latent de dimension réduite ; le décodeur reconstruit l'entrée originale à partir de cette représentation. L'auto-encodeur variationnel (VAE) ajoute une structure probabiliste à l'espace latent, permettant la génération de nouvelles données. Architecture fondamentale pour la compression, le débruitage et la génération d'images avant l'avènement des modèles de diffusion.

**Voir aussi :** [[latent-space|Espace latent]], [[diffusion-model|Modèle de diffusion]]

**Références :**
- KINGMA, Diederik P. et Max WELLING. "Auto-Encoding Variational Bayes." *ICLR*, 2014.
