# Zettelkasten - Philosophy Knowledge Graph

A digital garden for philosophy notes built on [Quartz v4.5.2](https://quartz.jzhao.xyz/), enhanced with custom graph analysis components for discovering connections between concepts.

## Features

This fork extends Quartz with powerful graph analysis tools:

| Component | Algorithm | Purpose |
|-----------|-----------|---------|
| **Co-Citations** | Co-citation frequency | Notes frequently cited together |
| **Similar Notes** | Jaccard Similarity | Notes with similar connections |
| **Suggested Links** | Adamic-Adar Index | Potential links to create |
| **Community** | Label Propagation | Thematic clusters detection |
| **Virtual Linker** | Runtime auto-linking | Automatic text-to-link conversion |
| **Top Communities** | Global clustering view | Overview of all clusters |

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npx quartz build --serve

# Production build
npx quartz build
```

Visit `http://localhost:8080` for local preview.

## Project Structure

```
zettelkasten/
├── content/                        # Markdown notes
│   ├── index.md                    # Homepage
│   └── Blueprints/                 # Technical documentation
├── quartz/
│   ├── components/
│   │   ├── custom/                 # Custom components (isolated)
│   │   │   ├── CoCitations.tsx
│   │   │   ├── Community.tsx
│   │   │   ├── Similarity.tsx
│   │   │   ├── LinkPrediction.tsx
│   │   │   ├── VirtualLinker.tsx
│   │   │   ├── TopCommunities.tsx
│   │   │   ├── FrontmatterDisplay.tsx
│   │   │   └── index.ts            # Re-exports
│   │   ├── scripts/custom/         # Custom inline scripts
│   │   └── styles/custom/          # Custom SCSS styles
│   ├── util/
│   │   ├── graph.ts                # Shared graph algorithms
│   │   └── graph.test.ts           # Unit tests
│   └── plugins/                    # Content transformers
├── quartz.config.ts                # Site configuration
├── quartz.layout.ts                # Layout configuration
└── CHANGELOG.md                    # Modifications to vanilla Quartz
```

---

# Custom Components Documentation

## Virtual Linker

Automatically transforms text matching note titles or aliases into clickable links without manual wikilinks.

### How It Works

1. **Loading**: Downloads content index (`contentIndex.json`) on page load
2. **Indexing**: Builds a map of all titles/aliases → note slugs
3. **Scanning**: Scans article text for matches
4. **Linking**: Replaces matches with clickable links

### Features

- **Case-insensitive**: "Kant" and "kant" both match
- **Word boundaries**: Only matches whole words
- **Length priority**: Longer terms take precedence
- **Disambiguation**: Shows selector when multiple notes match
- **Exclusions**: Skips headings, code blocks, existing links
- **Mermaid support**: Works in Mermaid diagrams via MutationObserver

### Visual Style

Virtual links have a dashed underline to distinguish them from regular links.

---

## Graph Analysis Components

### Co-Citations

Shows notes frequently cited alongside the current note.

**Algorithm:**
```
Score(B) = (pages citing both A and B) / (pages citing A) × 100
```

**Interpretation:**
- **>70%**: Strong conceptual affinity
- **50-70%**: Good correlation
- **30-50%**: Moderate correlation

### Similar Notes (Jaccard Similarity)

Finds notes with similar "neighborhoods" in the graph.

**Algorithm:**
```
Jaccard(A, B) = |N(A) ∩ N(B)| / |N(A) ∪ N(B)|
```

Where N(X) = set of neighbors (incoming + outgoing links)

**Interpretation:**
- **>30%**: Very similar
- **20-30%**: Similar
- **15-20%**: Slight correlation

### Suggested Links (Adamic-Adar Index)

Predicts which links could be added to the graph.

**Algorithm:**
```
Adamic-Adar(A, B) = Σ 1/log(degree(z))  for each common neighbor z
```

Rare neighbors (low degree) contribute more than hub nodes.

**Interpretation:**
- **>70%**: Strong recommendation
- **50-70%**: Good suggestion

### Community Detection

Identifies thematic clusters using Label Propagation, ranked by Clustering Coefficient.

**Label Propagation:**
1. Each node gets a unique label
2. Iteratively: each node adopts the most common neighbor label
3. Nodes with the same final label = same community

**Clustering Coefficient:**
```
CC(v) = 2e / k(k-1)
```
Where e = links between neighbors, k = number of neighbors

---

# Technical Notes

## Shared Utilities (`quartz/util/graph.ts`)

```typescript
// Build bidirectional adjacency map
export function buildAdjacencyMap(allFiles: QuartzPluginData[]): AdjacencyMap

// Build slug → file lookup (includes aliases)
export function buildSlugToFileMap(allFiles: QuartzPluginData[]): Map<string, QuartzPluginData>

// Deterministic hash for reproducible sorting
export function deterministicHash(str: string): number

// Community detection algorithm
export function labelPropagation(
  nodes: string[], 
  neighbors: AdjacencyMap, 
  maxIterations?: number
): Map<string, number>

// Node interconnectedness measure
export function clusteringCoefficient(node: string, neighbors: AdjacencyMap): number
```

## Minimum Thresholds

To avoid showing weak correlations:

| Component | Threshold | Rationale |
|-----------|-----------|-----------|
| Co-Citations | 30% | At least 1/3 shared citations |
| Similar Notes | 15% | Significant neighbor overlap |
| Suggested Links | 50% | High utility probability |
| Community | none | Shows all cluster members |

## Performance

- Graph analysis components compute metrics at **build-time**
- Virtual Linker operates at **runtime** with cached index
- MutationObserver for Mermaid detection (no polling)

---

# Customizations vs Vanilla Quartz

## Added Components (7)

| Component | Lines | Purpose |
|-----------|-------|---------|
| CoCitations.tsx | 145 | Bibliometric analysis |
| Community.tsx | 110 | Cluster detection |
| Similarity.tsx | 145 | Jaccard recommendations |
| LinkPrediction.tsx | 155 | Link suggestions |
| VirtualLinker.tsx | 14 | Auto-linking wrapper |
| TopCommunities.tsx | 140 | Global cluster view |
| FrontmatterDisplay.tsx | 90 | Metadata display |

## Added Utilities

| File | Exports |
|------|---------|
| `util/graph.ts` | `buildAdjacencyMap`, `buildSlugToFileMap`, `deterministicHash`, `labelPropagation`, `clusteringCoefficient` |

## Removed Dependencies

- `cli-spinner` (unused)
- `rehype-citation` (unused)
- `rehype-typst` (unused)

**Result:** -58 MB from node_modules

## Key Fixes Applied

1. **Deterministic builds**: Replaced `Math.random()` with hash-based sorting
2. **No magic timeouts**: MutationObserver for Mermaid detection
3. **DRY code**: Shared `labelPropagation()` in graph.ts
4. **Proper URLs**: `resolveRelative()` for baseUrl support
5. **XSS prevention**: `escapeCDATA()` for RSS content
6. **Race condition fix**: `build.ts` generates buildId inside mutex
7. **Memory leak fix**: `graph.inline.ts` preventive cleanup on navigation
8. **Magic numbers removed**: `GRAPH_CONSTANTS` object in graph.inline.ts

---

# Updating from Upstream

```bash
# Backup customizations
cp -r quartz/components/{CoCitations,Community,Similarity,LinkPrediction,VirtualLinker,TopCommunities,FrontmatterDisplay}.tsx /tmp/

# Fetch upstream
git remote add upstream https://github.com/jackyzha0/quartz.git
git fetch upstream v4
git merge upstream/v4 -X theirs --no-commit

# Restore customizations
cp /tmp/*.tsx quartz/components/

# Resolve conflicts in:
# - quartz/components/index.ts (add custom exports)
# - package.json (keep removed dependencies)
```

---

# References

- **Jaccard Index**: Jaccard, P. (1912). "The distribution of the flora in the alpine zone"
- **Adamic-Adar**: Adamic, L. & Adar, E. (2003). "Friends and neighbors on the Web"
- **Label Propagation**: Raghavan et al. (2007). "Near linear time algorithm to detect community structures"
- **Clustering Coefficient**: Watts & Strogatz (1998). "Collective dynamics of small-world networks"

---

# License

Based on [Quartz](https://github.com/jackyzha0/quartz) by Jacky Zhao, licensed under MIT.
