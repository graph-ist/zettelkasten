# Changelog - Modifications to Vanilla Quartz

This file documents all changes made to Quartz core files.
Use this as a reference when merging upstream updates.

## Core Files Status

| File | Status | Notes |
|------|--------|-------|
| `quartz/build.ts` | **MODIFIED** | Race condition fix |
| `quartz/components/scripts/graph.inline.ts` | **MODIFIED** | Memory leak fix + constants |

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
**Change**: New file with shared graph algorithms
**Reason**: DRY code for Community, TopCommunities, CoCitations, etc.
**Exports**: 
- `buildAdjacencyMap()`
- `buildSlugToFileMap()`
- `deterministicHash()`
- `labelPropagation()`
- `clusteringCoefficient()`
**Risk**: Low - new file, no conflicts


### `quartz/plugins/transformers/latex.ts`
**Change**: Removed Typst support
**Reason**: Unused dependency removal
**Lines**: ~30 removed
**Risk**: **MEDIUM** - if upstream re-adds Typst features

### `quartz/plugins/transformers/index.ts`
**Change**: Removed exports for Citations, Roam, OxHugoFM
**Reason**: Unused transformers
**Lines**: 3 lines removed
**Risk**: Low - easy to re-add if needed

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
2026-01-18
