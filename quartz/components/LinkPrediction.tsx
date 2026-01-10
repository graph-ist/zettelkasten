import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/linkprediction.scss"
import { resolveRelative, simplifySlug, SimpleSlug } from "../util/path"
import { classNames } from "../util/lang"
import { buildAdjacencyMap, buildSlugToFileMap } from "../util/graph"

// @ts-ignore
import script from "./scripts/linkprediction.inline"

interface LinkPredictionOptions {
  hideWhenEmpty: boolean
  /** Minimum score to display */
  minScore: number
  /** Maximum number of predictions to show */
  maxItems: number
  /** Algorithm to use: 'adamic-adar' or 'common-neighbors' */
  algorithm: 'adamic-adar' | 'common-neighbors'
}

const defaultOptions: LinkPredictionOptions = {
  hideWhenEmpty: true,
  minScore: 50,  // Minimum percentage (>50% = robust connection)
  maxItems: 10,
  algorithm: 'adamic-adar',
}

interface PredictedLink {
  slug: SimpleSlug
  title: string
  score: number
  commonNeighbors: string[]
}

export default ((opts?: Partial<LinkPredictionOptions>) => {
  const options: LinkPredictionOptions = { ...defaultOptions, ...opts }

  const LinkPrediction: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = simplifySlug(fileData.slug!)
    const currentSlugLower = currentSlug.toLowerCase()
    
    // Build adjacency list and slug lookup using shared utilities
    const neighbors = buildAdjacencyMap(allFiles)
    const slugToFile = buildSlugToFileMap(allFiles)
    
    // Get current note's direct neighbors
    const currentNeighbors = neighbors.get(currentSlugLower) || new Set<string>()
    
    // Find potential links (notes not directly connected but sharing neighbors)
    const predictions: PredictedLink[] = []
    
    for (const file of allFiles) {
      const fileSlug = simplifySlug(file.slug!)
      const fileSlugLower = fileSlug.toLowerCase()
      
      // Skip self and already connected notes
      if (fileSlugLower === currentSlugLower) continue
      if (currentNeighbors.has(fileSlugLower)) continue
      
      const fileNeighbors = neighbors.get(fileSlugLower) || new Set<string>()
      
      // Find common neighbors
      const common = [...currentNeighbors].filter(n => fileNeighbors.has(n))
      
      if (common.length === 0) continue
      
      let score: number
      
      if (options.algorithm === 'adamic-adar') {
        // Adamic-Adar: sum of 1/log(degree) for common neighbors
        // Gives more weight to rare shared connections
        score = common.reduce((sum, neighbor) => {
          const degree = (neighbors.get(neighbor)?.size || 1)
          return sum + (degree > 1 ? 1 / Math.log(degree) : 1)
        }, 0)
        
        // Normalize to percentage (0-100)
        // Max theoretical AA score would be if all common neighbors had degree 2
        // (1/log(2) ≈ 1.44 per neighbor)
        // We normalize relative to the actual max in this graph for better distribution
        const maxPossibleAA = common.length * (1 / Math.log(2))
        score = maxPossibleAA > 0 ? (score / maxPossibleAA) * 100 : 0
      } else {
        // Common Neighbors: just count shared neighbors
        score = common.length
      }
      
      if (score >= options.minScore) {
        predictions.push({
          slug: fileSlug,
          title: file.frontmatter?.title || fileSlug,
          score,
          commonNeighbors: common,
        })
      }
    }
    
    // Sort by score descending
    predictions.sort((a, b) => b.score - a.score)
    const topPredictions = predictions.slice(0, options.maxItems)
    
    if (options.hideWhenEmpty && topPredictions.length === 0) {
      return null
    }
    
    return (
      <div class={classNames(displayClass, "link-prediction")}>
        <button
          type="button"
          id="linkprediction-toggle"
          class="linkprediction-header"
          aria-controls="linkprediction-content"
          aria-expanded="false"
        >
          <h3>Suggested Links</h3>
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
        <div id="linkprediction-content" class="linkprediction-content collapsed">
          <p class="linkprediction-description">
            Notes you might want to link (Adamic-Adar)
          </p>
          <ul class="linkprediction-list">
            {topPredictions.length > 0 ? (
              topPredictions.map((prediction) => (
                <li class="linkprediction-item">
                  <a 
                    href={resolveRelative(fileData.slug!, prediction.slug)} 
                    class="internal"
                  >
                    {prediction.title}
                  </a>
                </li>
              ))
            ) : (
              <li>No link suggestions</li>
            )}
          </ul>
        </div>
      </div>
    )
  }

  LinkPrediction.css = style
  LinkPrediction.afterDOMLoaded = script

  return LinkPrediction
}) satisfies QuartzComponentConstructor
