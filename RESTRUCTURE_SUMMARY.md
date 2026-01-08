# Restructuring Summary

This document summarizes the restructuring changes made to implement the bilingual architecture with thematic sections.

## Completed Changes

### 1. Language Switcher Component ✅
- Created `quartz/components/LanguageSwitcher.tsx`
- Added to component exports in `quartz/components/index.ts`
- Integrated into header via `quartz.layout.ts`

### 2. Thematic Section Folders ✅
Created section folders in both languages:
- **EN**: `archives/`, `images/`, `tactics/`, `commons/`
- **FR**: `archives/`, `images/`, `tactiques/`, `communs/`

Each section has an `index.md` file listing the articles in that section.

### 3. Article Organization ✅
Articles have been moved to appropriate sections:

#### Archives
- EN: `retcon-black-mountain.md`, `retcon-methodology.md`
- FR: `retcon-black-mountain.md`, `methodologie-retcon.md`

#### Images
- EN: `the-image-continuum.md`, `what-is-a-continuum.md`
- FR: `le-continuum-de-limage.md`, `quest-ce-quun-continuum.md`

#### Tactics
- EN: `the-workshop-as-form.md`, `nodal-thinking.md`, `de-universalizing-technics.md`
- FR: `le-workshop-comme-forme.md`, `la-pensee-en-noeud.md`, `de-universaliser-technique.md`

#### Commons
- EN: `heredoc-manifesto.md`, `ethics-statistical-commons.md`, `computational-futurality.md`
- FR: `manifeste-heredoc.md`, `ethique-communs-statistiques.md`, `futuralite-computationnelle.md`

### 4. Landing Page Updates ✅
- Updated root `content/index.md` with project ecosystem navigation
- Updated `content/en/index.md` to show sections instead of full article list
- Updated `content/fr/index.md` to show sections instead of full article list

### 5. Documentation ✅
- Created `BILINGUAL_SETUP.md` with frontmatter templates and structure documentation

## Next Steps

1. **Test the build**: Run `npm run build` to ensure all paths resolve correctly
2. **Update article links**: Some internal wiki links may need updating to reflect new paths
3. **Add translation field**: Add `translation:` field to frontmatter of paired articles pointing to their counterparts
4. **Test language switcher**: Verify it works correctly on all pages
5. **Update any hardcoded paths**: Check for any hardcoded `/en/` or `/fr/` paths in articles

## File Structure

The new structure follows this pattern:
```
content/
├── index.md (bilingual landing)
├── en/
│   ├── index.md
│   ├── archives/
│   ├── images/
│   ├── tactics/
│   └── commons/
└── fr/
    ├── index.md
    ├── archives/
    ├── images/
    ├── tactiques/
    └── communs/
```

## Language Switcher Behavior

The language switcher:
- Detects current path (whether in `/en/` or `/fr/`)
- Swaps the language prefix
- Preserves the rest of the path structure
- Works on all pages including section indexes

