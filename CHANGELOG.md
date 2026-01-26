# Changelog - Modifications to Vanilla Quartz

This file documents all changes made to Quartz core files.
Use this as a reference when merging upstream updates.

## Core Files Status

| File | Status | Notes |
|------|--------|-------|
| `quartz/build.ts` | **MODIFIED** | Race condition fix |
| `quartz/components/scripts/graph.inline.ts` | **MODIFIED** | Memory leak fix + constants |
| `quartz/components/renderPage.tsx` | **MODIFIED** | Removed hr separator |
| `quartz/components/Graph.tsx` | **MODIFIED** | Commented out title |
| `quartz/components/styles/graph.scss` | **MODIFIED** | Removed border, moved icon position |
| `quartz/components/styles/callouts.scss` | **MODIFIED** | Icon alignment fix |
| `quartz/components/Footer.tsx` | **MODIFIED** | Changed GitHub link |
| `quartz/components/custom/FrontmatterDisplay.tsx` | **MODIFIED** | Enhanced with multi-match, URLs, separators |
| `quartz/components/styles/custom/frontmatterDisplay.scss` | **MODIFIED** | Styling improvements |
| `quartz/util/graph.ts` | **MODIFIED** | Added buildSlugToFilesMap function |
| `quartz/plugins/transformers/frontmatterLinks.ts` | **NEW** | Extracts wikilinks from frontmatter fields |
| `quartz/plugins/transformers/index.ts` | **MODIFIED** | Added FrontmatterLinks export |

## Modified Files

### `quartz/build.ts`
**Change**: Fixed race condition in `rebuild()` function
**Reason**: `buildId` was generated before acquiring mutex, allowing concurrent builds to skip necessary rebuilds
**Fix**: Generate `buildId` INSIDE mutex after `await mut.acquire()`
**Lines**: ~6 lines changed (moved buildId generation after mutex acquisition)
**Risk**: Low - bug fix, improves reliability

### `quartz/components/scripts/graph.inline.ts`
**Changes**:
1. Added `GRAPH_CONSTANTS` object to replace magic numbers
2. Added preventive cleanup before rendering new graphs
3. Added try/catch around graph rendering for error resilience
**Reason**: Memory leak on rapid navigation, magic numbers made code less maintainable
**Lines**: ~20 lines added/modified
**Risk**: Low - improves reliability and maintainability

### `quartz/util/escape.ts`
**Change**: Added `escapeCDATA()` function
**Reason**: XSS prevention in RSS feed content
**Lines**: ~15 new lines at end of file
**Risk**: Low - additive change, no conflicts expected

### `quartz/util/lang.ts`
**Change**: Added `mergeOptions()` helper function
**Reason**: Utility for merging component options
**Lines**: ~10 new lines at end of file
**Risk**: Low - additive change

### `quartz/util/graph.ts`
**Change**: Shared graph algorithms file
**Reason**: DRY code for Community, TopCommunities, CoCitations, etc.
**Exports**: 
- `buildAdjacencyMap()`
- `buildSlugToFileMap()` - returns single match
- `buildSlugToFilesMap()` - **NEW** returns ALL matches (for multi-match support)
- `deterministicHash()`
- `labelPropagation()`
- `clusteringCoefficient()`
**Risk**: Low - additive change

### `quartz/components/custom/FrontmatterDisplay.tsx`
**Changes** (2025-01-25):
1. Added multi-match support like Virtual Linker: shows `term (a, b, c)` format when multiple pages match
2. Added self-reference detection (aliases pointing to current page shown as black, non-clickable)
3. Added URL detection - external links (http/https) are now clickable and open in new tab
4. Changed separator from space to " · " (middle dot)
5. Arrow rotation fixed: closed → right (→), open → down (↓)
**Features**:
- Fields displayed: cssclasses, subclasses, related, aliases, reference
- Collapsible toggle with chevron icon
- Color scheme: black (non-links) + blue (clickable links)
**Risk**: Low - isolated component

### `quartz/components/styles/custom/frontmatterDisplay.scss`
**Changes** (2025-01-25):
1. Added `line-height: 1.6` for consistent vertical spacing
2. Added `margin-top: 17px` to Properties toggle
3. Arrow rotation: `-90deg` (closed) → `0deg` (open)
4. Added `.external` class for URL styling with `word-break: break-all`
5. Fixed alignment with `align-items: baseline`
6. Added bold (`font-weight: 600`) for links
**Risk**: Low - isolated styling

### `quartz/plugins/emitters/sankeyData.ts`
**Change**: New emitter for Sankey diagram data
**Reason**: Generates JSON from frontmatter (cssclasses → subclasses → notes)
**Output**: `/public/sankeyData.json`
**Risk**: Low - new file

### `quartz/components/custom/SankeyDiagram.tsx`
**Change**: New component for interactive Sankey visualization
**Features**:
- D3.js loaded from CDN (avoids bundling issues)
- Drill-down: click subclass → see notes → click note → navigate
- Purple uniform color scheme
- Responsive full-width SVG
**Dependencies**: d3@7, d3-sankey@0.12 (CDN)
**Risk**: Low - isolated in /custom

### `quartz/components/renderPage.tsx`
**Change**: Removed `<hr />` separator before page footer
**Reason**: Cleaner visual design
**Lines**: 1 line removed
**Risk**: Low - purely cosmetic

### `quartz/components/Graph.tsx`
**Change**: Commented out "Graph View" title
**Reason**: Cleaner visual design
**Lines**: 1 line commented
**Risk**: Low - easily reversible

### `quartz/components/styles/graph.scss`
**Changes**:
1. Removed border from graph-outer
2. Moved global-graph-icon from top-right to bottom-left
**Reason**: Cleaner visual design, better icon placement
**Lines**: Changed `border: 1px solid var(--lightgray)` to `border: 0`, changed `top: 0; right: 0;` to `bottom: 0; left: 0;`
**Risk**: Low - purely cosmetic

### `quartz/components/styles/callouts.scss`
**Change**: Changed `align-items: flex-start` to `align-items: center` in `.callout-title`
**Reason**: Proper vertical alignment of callout icon with text
**Lines**: 1 line changed
**Risk**: Low - purely cosmetic

### `quartz/components/Footer.tsx`
**Change**: Updated GitHub repository link
**From**: `https://github.com/jackyzha0/quartz`
**To**: `https://github.com/graph-ist/personal-zettelkasten`
**Risk**: Low - branding change


### `quartz/plugins/transformers/latex.ts`
**Change**: Removed Typst support
**Reason**: Unused dependency removal
**Lines**: ~30 removed
**Risk**: **MEDIUM** - if upstream re-adds Typst features

### `quartz/plugins/transformers/index.ts`
**Change**: Removed exports for Citations, Roam, OxHugoFM; Added FrontmatterLinks export
**Reason**: Unused transformers removed; New plugin for frontmatter link extraction
**Lines**: 3 lines removed, 1 line added
**Risk**: Low - easy to re-add if needed

### `quartz/plugins/transformers/frontmatterLinks.ts`
**Change**: New transformer plugin
**Reason**: Enable graph view to show connections defined in frontmatter `related` field
**Problem Solved**: By default, wikilinks in YAML frontmatter are treated as plain strings and don't appear in the graph. This plugin extracts `[[...]]` links from frontmatter fields and adds them to `file.data.links`.
**Features**:
- Configurable fields to scan (default: `["related"]`)
- Supports both `[[Page]]` and `[[Page|Alias]]` syntax
- Deduplicates links (uses Set)
- Non-destructive: merges with existing body links
**Usage in quartz.config.ts**:
```ts
Plugin.FrontmatterLinks({ fields: ["related"] })
```
**Frontmatter format**:
```yaml
related:
  - "[[Page Name]]"
  - "[[Another Page|Display Text]]"
```
**Plugin Order**: Must be placed AFTER `CrawlLinks` in transformers array
**Documentation**: See `docs/plugins/FrontmatterLinks.md`
**Risk**: Low - new isolated plugin, no changes to existing code

### `globals.d.ts`
**Change**: 
1. Added `*.inline` module declarations
2. Removed typst-related types
**Reason**: TypeScript support for inline scripts
**Lines**: ~10 modified
**Risk**: Low

## Deleted Files

| File | Reason | Recovery |
|------|--------|----------|
| `quartz/plugins/transformers/citations.ts` | Unused | Restore from upstream |
| `quartz/plugins/transformers/roam.ts` | Unused | Restore from upstream |
| `quartz/plugins/transformers/oxhugofm.ts` | Unused | Restore from upstream |

## Removed Dependencies

```json
{
  "cli-spinner": "removed - unused",
  "rehype-citation": "removed - unused", 
  "rehype-typst": "removed - unused"
}
```

To restore: `npm install <package-name>`

## Merge Strategy

When updating from upstream:

```bash
# 1. Create backup branch
git checkout -b backup-custom

# 2. Fetch upstream
git fetch upstream v4

# 3. Merge with theirs strategy
git checkout main
git merge upstream/v4 -X theirs --no-commit

# 4. Restore custom components (already isolated in /custom)
# They should not be affected

# 5. Check these files for conflicts:
#    - quartz/build.ts
#    - quartz/components/scripts/graph.inline.ts
#    - quartz/plugins/transformers/latex.ts

# 6. Re-add custom exports to:
#    - quartz/components/index.ts (the import from "./custom")

# 7. Test build
npm run quartz build
```

## Last Updated
2026-01-25
