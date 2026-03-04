---
title: "Rétropropagation"
type: glossary
aliases: ["Backpropagation", "backprop"]
tags:
  - glossary
  - AI
  - deep-learning
  - training
---

Algorithme propageant l'erreur en arrière à travers les couches du réseau de neurones pour ajuster les poids. Calcule le gradient de la fonction de perte par rapport à chaque poids en appliquant la règle de la chaîne. Combiné avec la descente de gradient, constitue le mécanisme fondamental par lequel les réseaux de neurones « apprennent ». Inventé indépendamment plusieurs fois ; popularisé par Rumelhart, Hinton et Williams (1986). Sans rétropropagation, l'entraînement des réseaux profonds serait computationnellement impraticable.

**Voir aussi :** [[gradient-descent|Descente de gradient]], [[training|Entraînement]], [[parameter-weight|Paramètre/Poids]]

**Références :**
- RUMELHART, David E., Geoffrey E. HINTON et Ronald J. WILLIAMS. "Learning representations by back-propagating errors." *Nature*, 1986, vol. 323, pp. 533-536.
