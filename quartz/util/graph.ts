import { QuartzPluginData } from "../plugins/vfile"
import { simplifySlug } from "./path"

export type AdjacencyMap = Map<string, Set<string>>

/**
 * Builds a bidirectional adjacency map from all files' links.
 * Each slug maps to its neighbors (both outgoing links and incoming backlinks).
 * All slugs are normalized to lowercase for case-insensitive matching.
 *
 * @param allFiles - Array of all file data containing slugs and links
 * @returns Map where keys are lowercase slugs and values are sets of connected slugs
 */
export function buildAdjacencyMap(allFiles: QuartzPluginData[]): AdjacencyMap {
  const neighbors: AdjacencyMap = new Map()

  for (const file of allFiles) {
    const fileSlug = simplifySlug(file.slug!).toLowerCase()
    if (!neighbors.has(fileSlug)) {
      neighbors.set(fileSlug, new Set())
    }

    // Add outgoing links and their reverse (incoming) connections
    if (file.links) {
      for (const link of file.links) {
        const linkLower = link.toLowerCase()
        neighbors.get(fileSlug)!.add(linkLower)

        // Add reverse link (incoming)
        if (!neighbors.has(linkLower)) {
          neighbors.set(linkLower, new Set())
        }
        neighbors.get(linkLower)!.add(fileSlug)
      }
    }
  }

  return neighbors
}

/**
 * Builds a map from lowercase slug to file data for quick lookups.
 * Includes both primary slugs and aliases for comprehensive lookup.
 *
 * @param allFiles - Array of all file data
 * @returns Map from lowercase slug to file data
 */
export function buildSlugToFileMap(
  allFiles: QuartzPluginData[],
): Map<string, QuartzPluginData> {
  const slugToFile = new Map<string, QuartzPluginData>()

  for (const file of allFiles) {
    const slug = simplifySlug(file.slug!).toLowerCase()
    slugToFile.set(slug, file)

    // Also add aliases as valid lookup keys
    const aliases = file.frontmatter?.aliases as string[] | undefined
    if (aliases) {
      for (const alias of aliases) {
        const aliasSlug = alias.toLowerCase().replace(/\s+/g, "-")
        slugToFile.set(aliasSlug, file)
      }
    }
  }

  return slugToFile
}

/**
 * Deterministic shuffle using a simple hash function.
 * Produces consistent ordering across builds.
 *
 * @param str - String to hash
 * @param seed - Seed for variation (e.g., iteration number)
 * @returns Hash value for sorting
 */
export function deterministicHash(str: string, seed: number = 0): number {
  let hash = seed
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return hash
}

/**
 * Label Propagation Algorithm for community detection.
 * Each node iteratively adopts the most common label among its neighbors.
 * Uses deterministic shuffle to ensure reproducible results across builds.
 *
 * @param neighbors - Adjacency map from buildAdjacencyMap()
 * @param iterations - Number of iterations (default: 10)
 * @returns Map from node slug to community label (number)
 */
export function labelPropagation(
  neighbors: AdjacencyMap,
  iterations: number = 10
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
    // Deterministic shuffle based on iteration for reproducibility
    nodes.sort((a, b) => deterministicHash(a, i) - deterministicHash(b, i))

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
 * Clustering Coefficient: measures how interconnected a node's neighbors are.
 * A value of 1 means all neighbors are connected to each other (clique).
 * A value of 0 means no neighbors are connected to each other.
 *
 * @param node - The node to calculate coefficient for
 * @param neighbors - Adjacency map from buildAdjacencyMap()
 * @returns Coefficient between 0 and 1
 */
export function clusteringCoefficient(node: string, neighbors: AdjacencyMap): number {
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
