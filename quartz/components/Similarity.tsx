import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/similarity.scss"
import { resolveRelative, simplifySlug, SimpleSlug } from "../util/path"
import { classNames } from "../util/lang"
import { buildAdjacencyMap } from "../util/graph"
import script from "./scripts/similarity.inline"

interface SimilarityOptions {
  hideWhenEmpty: boolean
  /** Minimum similarity score to display (0-1) */
  minScore: number
  /** Maximum number of similar notes to show */
  maxItems: number
}

const defaultOptions: SimilarityOptions = {
  hideWhenEmpty: true,
  minScore: 0.15,  // Jaccard >15% = significant overlap
  maxItems: 10,
}

interface SimilarNote {
  slug: SimpleSlug
  title: string
  score: number
  commonNeighbors: string[]
}

/**
 * Jaccard Similarity: |A ∩ B| / |A ∪ B|
 * Measures how similar two sets of neighbors are
 */
function jaccardSimilarity(neighborsA: Set<string>, neighborsB: Set<string>): number {
  if (neighborsA.size === 0 && neighborsB.size === 0) return 0
  
  const intersection = new Set([...neighborsA].filter(x => neighborsB.has(x)))
  const union = new Set([...neighborsA, ...neighborsB])
  
  return intersection.size / union.size
}

export default ((opts?: Partial<SimilarityOptions>) => {
  const options: SimilarityOptions = { ...defaultOptions, ...opts }

  const Similarity: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = simplifySlug(fileData.slug!)
    
    // Build adjacency list using shared utility
    const neighbors = buildAdjacencyMap(allFiles)
    
    // Get current note's neighbors
    const currentNeighbors = neighbors.get(currentSlug.toLowerCase()) || new Set<string>()
    
    // Calculate similarity with all other notes
    const similarities: SimilarNote[] = []
    
    for (const file of allFiles) {
      const fileSlug = simplifySlug(file.slug!)
      const fileSlugLower = fileSlug.toLowerCase()
      
      // Skip self
      if (fileSlugLower === currentSlug.toLowerCase()) continue
      
      const fileNeighbors = neighbors.get(fileSlugLower) || new Set<string>()
      const score = jaccardSimilarity(currentNeighbors, fileNeighbors)
      
      if (score >= options.minScore) {
        // Find common neighbors for display
        const common = [...currentNeighbors].filter(n => fileNeighbors.has(n))
        
        similarities.push({
          slug: fileSlug,
          title: file.frontmatter?.title || fileSlug,
          score,
          commonNeighbors: common,
        })
      }
    }
    
    // Sort by score descending
    similarities.sort((a, b) => b.score - a.score)
    const topSimilar = similarities.slice(0, options.maxItems)
    
    if (options.hideWhenEmpty && topSimilar.length === 0) {
      return null
    }
    
    return (
      <div class={classNames(displayClass, "similarity")}>
        <button
          type="button"
          id="similarity-toggle"
          class="similarity-header"
          aria-controls="similarity-content"
          aria-expanded="false"
        >
          <h3>Similar Notes</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="fold"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div id="similarity-content" class="similarity-content collapsed">
          <p class="similarity-description">
            Notes with similar connections (Jaccard)
          </p>
          {topSimilar.length > 0 ? (
            <ul class="similarity-list overflow">
              {topSimilar.map((similar) => (
                <li class="similarity-item">
                  <a 
                    href={resolveRelative(fileData.slug!, similar.slug)} 
                    class="internal similarity-link"
                  >
                    {similar.title}
                  </a>
                  <span class="similarity-score">{Math.round(similar.score * 100)}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p class="no-similarity">No similar notes found</p>
          )}
        </div>
      </div>
    )
  }

  Similarity.css = style
  Similarity.afterDOMLoaded = script

  return Similarity
}) satisfies QuartzComponentConstructor
