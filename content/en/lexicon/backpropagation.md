---
title: "Backpropagation"
type: glossary
aliases: ["backprop", "backward propagation"]
tags:
  - glossary
  - AI
  - deep-learning
  - training
---

Algorithm for training neural networks by propagating error gradients backward through layers. Computes how much each weight contributed to the output error, then adjusts weights to reduce error. Enabled deep learning's success: before efficient backpropagation (1986, Rumelhart/Hinton/Williams), training deep networks was impractical. Combined with gradient descent optimization. The mechanism by which "learning" occurs: iterative weight adjustment guided by error signals. Computationally intensive but highly parallelizable on GPUs.

**See also:** [[training|Training]], [[parameter-weight|Parameter/Weight]], [[deep-learning|Deep Learning]]

**References:**
- RUMELHART, David, Geoffrey HINTON, and Ronald WILLIAMS. "Learning representations by back-propagating errors." *Nature* 323 (1986): 533-536.
