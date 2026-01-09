import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, simplifySlug, SimpleSlug } from "../util/path"
import { classNames } from "../util/lang"
import { buildAdjacencyMap, buildSlugToFileMap } from "../util/graph"

interface TopCommunitiesOptions {
  /** Number of top communities to show */
  topCommunities: number
  /** Number of notes to show per community */
  notesPerCommunity: number
  /** Number of label propagation iterations */
  iterations: number
  /** Title for the section */
  title: string
}

const defaultOptions: TopCommunitiesOptions = {
  topCommunities: 3,
  notesPerCommunity: 5,
  iterations: 10,
  title: "Topic Clusters",
}

interface CommunityInfo {
  label: number
  members: Array<{
    slug: SimpleSlug
    title: string
    degree: number
  }>
  totalMembers: number
}

/**
 * Simple Label Propagation Algorithm
 */
function labelPropagation(
  neighbors: Map<string, Set<string>>,
  iterations: number
): Map<string, number> {
  const labels = new Map<string, number>()
  
  let labelId = 0
  for (const node of neighbors.keys()) {
    labels.set(node, labelId++)
  }
  
  for (let i = 0; i < iterations; i++) {
    const nodes = [...neighbors.keys()]
    // Use deterministic shuffle based on iteration for consistency
    nodes.sort((a, b) => {
      const hashA = (a.charCodeAt(0) + i) % 100
      const hashB = (b.charCodeAt(0) + i) % 100
      return hashA - hashB
    })
    
    for (const node of nodes) {
      const nodeNeighbors = neighbors.get(node)
      if (!nodeNeighbors || nodeNeighbors.size === 0) continue
      
      const labelCounts = new Map<number, number>()
      for (const neighbor of nodeNeighbors) {
        const neighborLabel = labels.get(neighbor)
        if (neighborLabel !== undefined) {
          labelCounts.set(neighborLabel, (labelCounts.get(neighborLabel) || 0) + 1)
        }
      }
      
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

export default ((opts?: Partial<TopCommunitiesOptions>) => {
  const options: TopCommunitiesOptions = { ...defaultOptions, ...opts }

  const TopCommunities: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    // Build adjacency list and slug lookup
    const neighbors = buildAdjacencyMap(allFiles)
    const slugToFile = buildSlugToFileMap(allFiles)
    
    // Run label propagation
    const labels = labelPropagation(neighbors, options.iterations)
    
    // Group nodes by community
    const communities = new Map<number, string[]>()
    for (const [nodeSlug, label] of labels) {
      if (!communities.has(label)) {
        communities.set(label, [])
      }
      communities.get(label)!.push(nodeSlug)
    }
    
    // Build community info with member details
    const communityInfos: CommunityInfo[] = []
    for (const [label, memberSlugs] of communities) {
      // Skip tiny communities
      if (memberSlugs.length < 3) continue
      
      const members = memberSlugs
        .map(slug => {
          const file = slugToFile.get(slug)
          if (!file) return null
          return {
            slug: simplifySlug(file.slug!),
            title: file.frontmatter?.title || slug,
            degree: neighbors.get(slug)?.size || 0,
          }
        })
        .filter((m): m is NonNullable<typeof m> => m !== null)
        // Sort by degree (most connected first)
        .sort((a, b) => b.degree - a.degree)
        .slice(0, options.notesPerCommunity)
      
      if (members.length > 0) {
        communityInfos.push({
          label,
          members,
          totalMembers: memberSlugs.length,
        })
      }
    }
    
    // Sort by community size
    communityInfos.sort((a, b) => b.totalMembers - a.totalMembers)
    const topCommunities = communityInfos.slice(0, options.topCommunities)
    
    if (topCommunities.length === 0) {
      return null
    }
    
    return (
      <div class={classNames(displayClass, "top-communities")}>
        <h3>{options.title}</h3>
        <p class="top-communities-description">
          Automatically detected topic clusters via Label Propagation
        </p>
        <div class="communities-grid">
          {topCommunities.map((community, idx) => (
            <div class="community-card">
              <div class="community-card-header">
                <span class="community-number">#{idx + 1}</span>
                <span class="community-size">{community.totalMembers} notes</span>
              </div>
              <ul class="community-members">
                {community.members.map((member) => (
                  <li>
                    <a 
                      href={resolveRelative(fileData.slug!, member.slug)} 
                      class="internal"
                    >
                      {member.title}
                    </a>
                  </li>
                ))}
              </ul>
              {community.totalMembers > options.notesPerCommunity && (
                <span class="community-more">
                  +{community.totalMembers - options.notesPerCommunity} more
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  TopCommunities.css = `
.top-communities {
  margin: 2rem 0;
}

.top-communities h3 {
  margin-bottom: 0.5rem;
}

.top-communities-description {
  color: var(--gray);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.communities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.community-card {
  background: var(--lightgray);
  border-radius: 8px;
  padding: 1rem;
}

.community-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--gray);
}

.community-number {
  font-weight: bold;
  color: var(--secondary);
}

.community-size {
  font-size: 0.8rem;
  color: var(--gray);
}

.community-members {
  list-style: none;
  padding: 0;
  margin: 0;
}

.community-members li {
  margin: 0.25rem 0;
}

.community-members a {
  font-size: 0.9rem;
}

.community-more {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--gray);
  font-style: italic;
}
`

  return TopCommunities
}) satisfies QuartzComponentConstructor
