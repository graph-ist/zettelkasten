import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, simplifySlug, SimpleSlug } from "../util/path"
import { classNames } from "../util/lang"
import { buildAdjacencyMap, buildSlugToFileMap, labelPropagation } from "../util/graph"
import style from "./styles/topCommunities.scss"

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
    
    // Run label propagation (now using shared, deterministic implementation)
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

  TopCommunities.css = style

  return TopCommunities
}) satisfies QuartzComponentConstructor
