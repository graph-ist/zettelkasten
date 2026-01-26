import { QuartzTransformerPlugin } from "../types"
import { simplifySlug, slugifyFilePath, FilePath } from "../../util/path"
import { Root } from "hast"

interface Options {
  /** Frontmatter fields to extract wikilinks from */
  fields: string[]
}

const defaultOptions: Options = {
  fields: ["related"],
}

// Regex to match wikilinks: [[Page Name]] or [[Page Name|Display Text]]
const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

/**
 * Extracts wikilinks from frontmatter fields and adds them to the file's links.
 * This enables the graph view to show connections defined in frontmatter.
 */
export const FrontmatterLinks: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "FrontmatterLinks",
    htmlPlugins() {
      return [
        () => {
          return (_tree: Root, file) => {
            const frontmatter = file.data.frontmatter
            if (!frontmatter) return

            // Get existing links or initialize empty array
            const existingLinks = new Set(file.data.links ?? [])

            // Extract wikilinks from each configured field
            for (const field of opts.fields) {
              const fieldValue = frontmatter[field]
              if (!fieldValue) continue

              // Handle array of strings (e.g., related: ["[[Page 1]]", "[[Page 2]]"])
              const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue]

              for (const value of values) {
                if (typeof value !== "string") continue

                // Extract all wikilinks from the string
                let match
                while ((match = wikilinkRegex.exec(value)) !== null) {
                  const linkTarget = match[1].trim()
                  // Convert to slug format
                  const slug = simplifySlug(slugifyFilePath((linkTarget + ".md") as FilePath))
                  existingLinks.add(slug)
                }
                // Reset regex lastIndex for next iteration
                wikilinkRegex.lastIndex = 0
              }
            }

            // Update file links
            file.data.links = [...existingLinks]
          }
        },
      ]
    },
  }
}
