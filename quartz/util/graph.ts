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
