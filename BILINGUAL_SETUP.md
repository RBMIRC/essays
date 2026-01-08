# Bilingual Architecture Setup

This document describes the bilingual structure and frontmatter conventions for the Retcon Black Mountain Research site.

## Folder Structure

```
content/
├── index.md (bilingual landing page)
├── en/
│   ├── index.md (English essays index)
│   ├── archives/
│   │   ├── index.md
│   │   ├── retcon-black-mountain.md
│   │   └── retcon-methodology.md
│   ├── images/
│   │   ├── index.md
│   │   ├── the-image-continuum.md
│   │   └── what-is-a-continuum.md
│   ├── tactics/
│   │   ├── index.md
│   │   ├── the-workshop-as-form.md
│   │   ├── nodal-thinking.md
│   │   └── de-universalizing-technics.md
│   └── commons/
│       ├── index.md
│       ├── heredoc-manifesto.md
│       ├── ethics-statistical-commons.md
│       └── computational-futurality.md
└── fr/
    ├── index.md (French essays index)
    ├── archives/
    │   ├── index.md
    │   ├── retcon-black-mountain.md
    │   └── methodologie-retcon.md
    ├── images/
    │   ├── index.md
    │   ├── le-continuum-de-limage.md
    │   └── quest-ce-quun-continuum.md
    ├── tactiques/
    │   ├── index.md
    │   ├── le-workshop-comme-forme.md
    │   ├── la-pensee-en-noeud.md
    │   └── de-universaliser-technique.md
    └── communs/
        ├── index.md
        ├── manifeste-heredoc.md
        ├── ethique-communs-statistiques.md
        └── futuralite-computationnelle.md
```

## Frontmatter Template

Each essay should have the following frontmatter structure:

### English Version Template

```yaml
---
title: "Article Title"
subtitle: "Optional Subtitle"
author: "Sylvain Couzinet-Jacques"
date: "2025"
lang: en
license: CC-BY-NC-SA-4.0
provenance: "ENSA-V / Centre Norbert Elias"
translation: "/fr/section/counterpart-article"
tags:
  - primary-tag
  - secondary-tag
  - _hidden-tag-prefixed-with-underscore
---
```

### French Version Template

```yaml
---
title: "Titre de l'article"
subtitle: "Sous-titre optionnel"
author: "Sylvain Couzinet-Jacques"
date: "2025"
lang: fr
license: CC-BY-NC-SA-4.0
provenance: "ENSA-V / Centre Norbert Elias"
translation: "/en/section/counterpart-article"
tags:
  - tag-principal
  - tag-secondaire
  - _tag-cache-avec-underscore
---
```

## Key Fields

- **`lang`**: Required. Must be `en` or `fr`
- **`translation`**: Optional. Path to the corresponding article in the other language (relative to site root, e.g., `/fr/archives/retcon-black-mountain`)
- **`tags`**: Tags prefixed with `_` are hidden from display but work in the graph view
- **`date`**: Can be a year string ("2025") or full date ("2025-01-15")

## Language Switcher

The language switcher component automatically detects the current path and switches between `/en/` and `/fr/` equivalents. It's included in the header of all pages.

## Thematic Sections

### Archives / Archives
Essays on archival practices, retroactive continuity, and working with historical documents.

### Images / Images
Essays on the ontological transformation of images, photography, and visual media.

### Tactics / Tactiques
Essays on pedagogical practices, diagrammatic thinking, and situated approaches.

### Commons / Communs
Essays on statistical commons, intellectual property, AI ethics, and collective knowledge production.

