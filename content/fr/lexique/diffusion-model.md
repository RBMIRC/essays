---
title: "Modèle de diffusion"
type: glossary
aliases: ["Diffusion Model", "débruitage par diffusion", "DDPM"]
tags:
  - glossary
  - AI
  - image-generation
  - deep-learning
---

Classe de modèles génératifs qui apprennent à inverser un processus de bruitage progressif. L'entraînement ajoute du bruit aux images étape par étape jusqu'au bruit pur ; le modèle apprend à inverser ce processus, générant des images en débruitant progressivement un bruit aléatoire. DALL-E 2, Stable Diffusion, Midjourney utilisent des architectures de diffusion. Contrairement aux GANs (entraînement adversariel), les modèles de diffusion optimisent un objectif plus simple. Produit les « images moyennes » que critique Steyerl : moyennes statistiques qui effacent la singularité tout en maintenant une plausibilité de surface.

**Voir aussi :** [[gan-generative-adversarial-network|GAN]], [[mean-image|Image moyenne]], [[latent-space|Espace latent]]

**Références :**
- HO, Jonathan, Ajay JAIN et Pieter ABBEEL. "Denoising Diffusion Probabilistic Models." *NeurIPS*, 2020.
- ROMBACH, Robin, et al. "High-Resolution Image Synthesis with Latent Diffusion Models." *CVPR*, 2022.
