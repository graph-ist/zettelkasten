import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/community.scss"
import { resolveRelative, simplifySlug, SimpleSlug } from "../util/path"
import { classNames } from "../util/lang"
import { buildAdjacencyMap, buildSlugToFileMap } from "../util/graph"

// @ts-ignore
import script from "./scripts/community.inline"

interface CommunityOptions {
  hideWhenEmpty: boolean
  /** Maximum number of community members to show */
  maxItems: number
  /** Number of label propagation iterations */
  iterations: number
}

const defaultOptions: CommunityOptions = {
  hideWhenEmpty: true,
  maxItems: 15,
  iterations: 10,
}

interface CommunityMember {
  slug: SimpleSlug
  title: string
  clusteringCoeff: number
}

/**
 * Simple Label Propagation Algorithm
 * Each node adopts the most common label among its neighbors
 */
function labelPropagation(
  neighbors: Map<string, Set<string>>,
  iterations: number
): Map<string, number> {
  const labels = new Map<string, number>()
  
  // Initialize: each node gets unique label
  let labelId = 0
  for (const node of neighbors.keys()) {
    labels.set(node, labelId++)
  }
  
  // Iterate
  for (let i = 0; i < iterations; i++) {
    const nodes = [...neighbors.keys()]
    // Shuffle for randomness
    nodes.sort(() => Math.random() - 0.5)
    
    for (const node of nodes) {
      const nodeNeighbors = neighbors.get(node)
      if (!nodeNeighbors || nodeNeighbors.size === 0) continue
      
      // Count neighbor labels
      const labelCounts = new Map<number, number>()
      for (const neighbor of nodeNeighbors) {
        const neighborLabel = labels.get(neighbor)
        if (neighborLabel !== undefined) {
          labelCounts.set(neighborLabel, (labelCounts.get(neighborLabel) || 0) + 1)
        }
      }
      
      // Find most common label
      let maxCount = 0
      let bestLabel = labels.get(node)!
      for (const [label, count] of labelCounts) {
        if (count > maxCount) {
          maxCount = count
          bestLabel = label
        }
      }
      
      labels.set(node, bestLabel)
    }
  }
  
  return labels
}

/**
 * Clustering Coefficient: proportion of neighbors that are connected to each other
 */
function clusteringCoefficient(node: string, neighbors: Map<string, Set<string>>): number {
  const nodeNeighbors = neighbors.get(node)
  if (!nodeNeighbors || nodeNeighbors.size < 2) return 0
  
  const neighborList = [...nodeNeighbors]
  let connections = 0
  const possibleConnections = (neighborList.length * (neighborList.length - 1)) / 2
  
  for (let i = 0; i < neighborList.length; i++) {
    for (let j = i + 1; j < neighborList.length; j++) {
      const neighborsOfI = neighbors.get(neighborList[i])
      if (neighborsOfI?.has(neighborList[j])) {
        connections++
      }
    }
  }
  
  return possibleConnections > 0 ? connections / possibleConnections : 0
}

export default ((opts?: Partial<CommunityOptions>) => {
  const options: CommunityOptions = { ...defaultOptions, ...opts }

  const Community: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = simplifySlug(fileData.slug!)
    const currentSlugLower = currentSlug.toLowerCase()
    
    // Build adjacency list and slug lookup using shared utilities
    const neighbors = buildAdjacencyMap(allFiles)
    const slugToFile = buildSlugToFileMap(allFiles)
    
    // Run label propagation
    const labels = labelPropagation(neighbors, options.iterations)
    const currentLabel = labels.get(currentSlugLower)
    
    // Find all nodes in the same community
    const communityMembers: CommunityMember[] = []
    const currentClusteringCoeff = clusteringCoefficient(currentSlugLower, neighbors)
    
    for (const [nodeSlug, label] of labels) {
      if (label === currentLabel && nodeSlug !== currentSlugLower) {
        const file = slugToFile.get(nodeSlug)
        if (file) {
          communityMembers.push({
            slug: simplifySlug(file.slug!),
            title: file.frontmatter?.title || nodeSlug,
            clusteringCoeff: clusteringCoefficient(nodeSlug, neighbors),
          })
        }
      }
    }
    
    // Sort by clustering coefficient (more clustered = more central to community)
    communityMembers.sort((a, b) => b.clusteringCoeff - a.clusteringCoeff)
    const topMembers = communityMembers.slice(0, options.maxItems)
    
    if (options.hideWhenEmpty && topMembers.length === 0) {
      return null
    }
    
    return (
      <div class={classNames(displayClass, "community")}>
        <button
          type="button"
          id="community-toggle"
          class="community-header"
          aria-controls="community-content"
          aria-expanded="false"
        >
          <h3>Community</h3>
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
        <div id="community-content" class="community-content collapsed">
          <p class="community-description">
            Notes in the same cluster (Label Propagation)
          </p>
          {topMembers.length > 0 ? (
            <ul class="community-list overflow">
              {topMembers.map((member) => (
                <li class="community-item">
                  <a 
                    href={resolveRelative(fileData.slug!, member.slug)} 
                    class="internal community-link"
                  >
                    {member.title}
                  </a>
                  <span class="community-coeff" title="Clustering coefficient">
                    {Math.round(member.clusteringCoeff * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p class="no-community">No community members found</p>
          )}
        </div>
      </div>
    )
  }

  Community.css = style
  Community.afterDOMLoaded = script

  return Community
}) satisfies QuartzComponentConstructor
