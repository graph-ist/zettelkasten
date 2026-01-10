import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/cocitations.scss"
import { resolveRelative, simplifySlug, SimpleSlug } from "../util/path"
import { classNames } from "../util/lang"

// @ts-ignore
import script from "./scripts/cocitations.inline"

interface CoCitationsOptions {
  hideWhenEmpty: boolean
  /** Minimum co-citation score percentage to display (0-100) */
  minScore: number
  /** Maximum number of co-cited notes to show */
  maxItems: number
}

const defaultOptions: CoCitationsOptions = {
  hideWhenEmpty: true,
  minScore: 30,  // Co-citation >30% = conceptual affinity
  maxItems: 20,
}

interface CoCitation {
  slug: SimpleSlug
  title: string
  count: number
  score: number  // Percentage (0-100)
  /** Pages where both notes are cited together */
  sources: Array<{
    slug: SimpleSlug
    title: string
  }>
}

export default ((opts?: Partial<CoCitationsOptions>) => {
  const options: CoCitationsOptions = { ...defaultOptions, ...opts }

  const CoCitations: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = simplifySlug(fileData.slug!).toLowerCase() as SimpleSlug
    
    // Build a map of which pages cite which notes (normalized to lowercase)
    const citationMap = new Map<string, Set<SimpleSlug>>()
    
    for (const file of allFiles) {
      const fileSlug = simplifySlug(file.slug!)
      if (file.links) {
        for (const link of file.links) {
          const linkKey = link.toLowerCase()
          if (!citationMap.has(linkKey)) {
            citationMap.set(linkKey, new Set())
          }
          citationMap.get(linkKey)!.add(fileSlug)
        }
      }
    }
    
    // Build a map of lowercase slug to file info for quick lookup
    const slugToFile = new Map<string, typeof allFiles[0]>()
    for (const file of allFiles) {
      const slug = simplifySlug(file.slug!).toLowerCase()
      slugToFile.set(slug, file)
      // Also add aliases
      if (file.frontmatter?.aliases) {
        for (const alias of file.frontmatter.aliases as string[]) {
          slugToFile.set(alias.toLowerCase().replace(/\s+/g, '-'), file)
        }
      }
    }
    
    // Get current page's aliases for searching backlinks
    const currentAliases = (fileData.frontmatter?.aliases as string[] | undefined) || []
    const currentAliasesLower = currentAliases.map(a => a.toLowerCase().replace(/\s+/g, '-'))
    
    // Find pages that cite the current note (by slug OR by any alias)
    const pagesCitingCurrent = new Set<SimpleSlug>()
    // Check by slug (last segment only)
    const slugParts = currentSlug.split('/')
    const lastSlugPart = slugParts[slugParts.length - 1]
    const citedBySlug = citationMap.get(lastSlugPart) || new Set<SimpleSlug>()
    citedBySlug.forEach(s => pagesCitingCurrent.add(s))
    // Check by full slug
    const citedByFullSlug = citationMap.get(currentSlug) || new Set<SimpleSlug>()
    citedByFullSlug.forEach(s => pagesCitingCurrent.add(s))
    // Check by aliases
    for (const alias of currentAliasesLower) {
      const citedByAlias = citationMap.get(alias) || new Set<SimpleSlug>()
      citedByAlias.forEach(s => pagesCitingCurrent.add(s))
    }
    
    // Count co-citations: for each page that cites current note,
    // find other notes it also cites
    const coCitationCounts = new Map<string, CoCitation>()
    
    // All identifiers for current note (to skip self-references)
    const currentIdentifiers = new Set([currentSlug, lastSlugPart, ...currentAliasesLower])
    
    for (const citingPageSlug of pagesCitingCurrent) {
      const citingPage = allFiles.find(f => simplifySlug(f.slug!) === citingPageSlug)
      if (!citingPage?.links) continue
      
      for (const otherLink of citingPage.links) {
        const otherLinkKey = otherLink.toLowerCase()
        // Skip self-references (by any identifier)
        if (currentIdentifiers.has(otherLinkKey)) continue
        
        // Find the other note's info using our lookup map
        const otherNote = slugToFile.get(otherLinkKey)
        if (!otherNote) continue
        
        const otherNoteSlug = simplifySlug(otherNote.slug!)
        const existing = coCitationCounts.get(otherLinkKey)
        if (existing) {
          existing.count++
          existing.sources.push({
            slug: citingPageSlug,
            title: citingPage.frontmatter?.title || citingPageSlug,
          })
        } else {
          coCitationCounts.set(otherLinkKey, {
            slug: otherNoteSlug,
            title: otherNote.frontmatter?.title || otherNoteSlug,
            count: 1,
            score: 0,  // Will be calculated below
            sources: [{
              slug: citingPageSlug,
              title: citingPage.frontmatter?.title || citingPageSlug,
            }],
          })
        }
      }
    }
    
    // Calculate percentage score: count / total pages citing current note * 100
    const totalCitingPages = pagesCitingCurrent.size
    for (const coCite of coCitationCounts.values()) {
      coCite.score = totalCitingPages > 0 ? (coCite.count / totalCitingPages) * 100 : 0
    }
    
    // Convert to array, filter by score percentage, and sort
    const coCitations = Array.from(coCitationCounts.values())
      .filter(c => c.score >= options.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, options.maxItems)
    
    if (options.hideWhenEmpty && coCitations.length === 0) {
      return null
    }
    
    return (
      <div class={classNames(displayClass, "cocitations")}>
        <button
          type="button"
          id="cocitations-toggle"
          class="cocitations-header"
          aria-controls="cocitations-content"
          aria-expanded="false"
        >
          <h3>Co-Citations</h3>
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
        <div id="cocitations-content" class="cocitations-content collapsed">
          <p class="cocitations-description">
            Notes frequently cited together with this one
          </p>
          <ul class="cocitations-list">
            {coCitations.length > 0 ? (
              coCitations.map((coCite) => (
                <li class="cocitation-item">
                  <a 
                    href={resolveRelative(fileData.slug!, coCite.slug)} 
                    class="internal"
                  >
                    {coCite.title}
                  </a>
                </li>
              ))
            ) : (
              <li>No co-citations found</li>
            )}
          </ul>
        </div>
      </div>
    )
  }

  CoCitations.css = style
  CoCitations.afterDOMLoaded = script

  return CoCitations
}) satisfies QuartzComponentConstructor
