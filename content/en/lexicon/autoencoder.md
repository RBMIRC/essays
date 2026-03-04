---
title: "Autoencoder"
type: glossary
aliases: ["VAE", "Variational Autoencoder"]
tags:
  - glossary
  - AI
  - deep-learning
  - compression
---

Neural network architecture that learns to compress input into lower-dimensional representation (encoding) then reconstruct it (decoding). The compressed representation (latent space) captures essential features. Variational Autoencoders (VAEs) add probabilistic structure, enabling generation of new samples. Used in image compression, anomaly detection, and as components of larger generative systems. Latent Diffusion Models use VAE encoders to work in compressed latent space rather than pixel space.

**See also:** [[latent-space|Latent Space]], [[embedding|Embedding]], [[diffusion-model|Diffusion Model]]

**References:**
- KINGMA, Diederik, and Max WELLING. "Auto-Encoding Variational Bayes." *ICLR*, 2014.
