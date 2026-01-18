import { QuartzEmitterPlugin } from "../types"
import { FilePath, FullSlug, simplifySlug } from "../../util/path"
import { write } from "./helpers"

export interface SankeyNode {
  id: string
  name: string
  category: "cssclass" | "subclass" | "related" | "note"
  slug?: string // For notes, the page slug
}

export interface SankeyLink {
  source: string
  target: string
  value: number
}

export interface NoteInfo {
  slug: string
  title: string
  cssclass: string
  subclass: string
}

export interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
  noteMapping: Record<string, { cssclass: string; subclass: string; related: string[] }>
  // For drill-down: subclass → list of notes
  subclassNotes: Record<string, NoteInfo[]>
}

export const SankeyData: QuartzEmitterPlugin = () => {
  return {
    name: "SankeyData",
    getQuartzComponents() {
      return []
    },
    async emit(ctx, content, _resources): Promise<FilePath[]> {
      const nodesMap = new Map<string, SankeyNode>()
      const linksMap = new Map<string, SankeyLink>()
      const noteMapping: SankeyData["noteMapping"] = {}
      const subclassNotes: SankeyData["subclassNotes"] = {}

      // Process all files
      for (const [_tree, file] of content) {
        const slug = simplifySlug(file.data.slug as FullSlug)
        const frontmatter = file.data.frontmatter

        // Skip index/welcome page
        if (slug === "index" || slug === "" || slug === "/") continue

        if (!frontmatter) continue

        // Extract cssclasses (first value)
        const cssclasses = frontmatter.cssclasses as string[] | undefined
        const cssclass = cssclasses?.[0] || "Uncategorized"

        // Extract subclasses (first value)
        const subclasses = frontmatter.subclasses as string[] | undefined
        const subclass = subclasses?.[0] || "Other"

        // Extract related (wikilinks to clean strings)
        const related = (frontmatter.related as string[] | undefined) || []
        const cleanRelated = related.map((r) =>
          r.replace(/\[\[|\]\]/g, "").trim()
        )

        // Get title
        const title = (frontmatter.title as string) || file.data.slug?.split("/").pop() || slug

        // Store note mapping for highlight feature
        noteMapping[slug] = { cssclass, subclass, related: cleanRelated }

        // Store note in subclass list (for drill-down)
        const subclassKey = subclass
        if (!subclassNotes[subclassKey]) {
          subclassNotes[subclassKey] = []
        }
        subclassNotes[subclassKey].push({
          slug,
          title,
          cssclass,
          subclass,
        })

        // Add cssclass node
        const cssclassId = `cssclass:${cssclass}`
        if (!nodesMap.has(cssclassId)) {
          nodesMap.set(cssclassId, {
            id: cssclassId,
            name: cssclass,
            category: "cssclass",
          })
        }

        // Add subclass node
        const subclassId = `subclass:${subclass}`
        if (!nodesMap.has(subclassId)) {
          nodesMap.set(subclassId, {
            id: subclassId,
            name: subclass.replace(/-/g, " "),
            category: "subclass",
          })
        }

        // Add link: cssclass → subclass
        const link1Key = `${cssclassId}->${subclassId}`
        if (!linksMap.has(link1Key)) {
          linksMap.set(link1Key, {
            source: cssclassId,
            target: subclassId,
            value: 0,
          })
        }
        linksMap.get(link1Key)!.value++
      }

      const data: SankeyData = {
        nodes: Array.from(nodesMap.values()),
        links: Array.from(linksMap.values()),
        noteMapping,
        subclassNotes,
      }

      const fp = "static/sankeyData.json" as FilePath
      await write({
        ctx,
        content: JSON.stringify(data),
        slug: "sankeyData" as FullSlug,
        ext: ".json",
      })

      return [fp]
    },
  }
}
