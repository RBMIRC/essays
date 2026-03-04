---
title: "Diffusion Model"
type: glossary
aliases: ["denoising diffusion", "DDPM"]
tags:
  - glossary
  - AI
  - image-generation
  - deep-learning
---

Class of generative models that learn to reverse a gradual noising process. Training adds noise to images step by step until pure noise; the model learns to reverse this, generating images by progressively denoising random noise. DALL-E 2, Stable Diffusion, Midjourney use diffusion architectures. Unlike GANs (adversarial training), diffusion models optimize a simpler objective. Produces the "mean images" Steyerl critiques: statistical averages that erase singularity while maintaining surface plausibility.

**See also:** [[gan-generative-adversarial-network|GAN]], [[mean-image|Mean Image]], [[latent-space|Latent Space]]

**References:**
- HO, Jonathan, Ajay JAIN, and Pieter ABBEEL. "Denoising Diffusion Probabilistic Models." *NeurIPS*, 2020.
- ROMBACH, Robin, et al. "High-Resolution Image Synthesis with Latent Diffusion Models." *CVPR*, 2022.
