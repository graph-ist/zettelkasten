import { QuartzTransformerPlugin } from "../types"
import { JSResource } from "../../util/resources"

export interface Options {
  // Future options can be added here
}

// Inline script for dataview backlinks tables
const dataviewScript = `
function loadDataviewTables() {
  const dataviewElements = document.querySelectorAll('.dataview-backlinks');
  
  dataviewElements.forEach(async (el) => {
    // Skip if already loaded
    if (el.dataset.loaded === 'true') return;
    el.dataset.loaded = 'true';
    
    const target = el.getAttribute('data-target');
    if (!target) return;
    
    try {
      // Get base URL
      const baseUrl = window.location.origin + (window.location.pathname.includes('/zettelkasten') ? '/zettelkasten' : '');
      
      // Fetch the content index
      const response = await fetch(baseUrl + '/static/contentIndex.json');
      if (!response.ok) throw new Error('Failed to fetch content index');
      const contentIndex = await response.json();
      
      // Find all files that link to the target
      const backlinks = [];
      const targetLower = target.toLowerCase();
      
      for (const [slug, data] of Object.entries(contentIndex)) {
        if (data.links && Array.isArray(data.links)) {
          for (const link of data.links) {
            const linkLower = link.toLowerCase();
            if (linkLower === targetLower) {
              backlinks.push({
                title: data.title || slug,
                slug: slug
              });
              break;
            }
          }
        }
      }
      
      // Sort alphabetically
      backlinks.sort((a, b) => a.title.localeCompare(b.title));
      
      // Generate table HTML
      if (backlinks.length > 0) {
        let tableHtml = '<table class="dataview-table"><thead><tr><th>Notes citing ' + target + '</th></tr></thead><tbody>';
        for (const bl of backlinks) {
          const href = baseUrl + '/' + bl.slug;
          tableHtml += '<tr><td><a href="' + href + '" class="internal">' + bl.title + '</a></td></tr>';
        }
        tableHtml += '</tbody></table>';
        el.innerHTML = tableHtml;
      } else {
        el.innerHTML = '<p><em>No notes citing ' + target + '</em></p>';
      }
    } catch (error) {
      console.error('Error loading backlinks:', error);
      el.innerHTML = '<p><em>Error loading backlinks</em></p>';
    }
  });
}

// Run on initial load and on SPA navigation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDataviewTables);
} else {
  loadDataviewTables();
}
document.addEventListener('nav', loadDataviewTables);
`

// Regex to match dataview code blocks
const dataviewBlockRegex = /```dataview\n([\s\S]*?)```/g

export const DataviewTables: QuartzTransformerPlugin<Partial<Options>> = () => {
  return {
    name: "DataviewTables",
    textTransform(_ctx, src) {
      // Replace dataview blocks at text level before parsing
      return src.replace(dataviewBlockRegex, (_match, query) => {
        // Match FROM [[FileName]] pattern
        const fromMatch = query.match(/FROM\s+\[\[([^\]]+)\]\]/i)
        if (!fromMatch) {
          // If no FROM match, just remove the block
          return ''
        }

        const targetFile = fromMatch[1]
        
        // Return HTML div that will be processed client-side
        return `<div class="dataview-backlinks" data-target="${targetFile}"><p><em>Loading backlinks...</em></p></div>`
      })
    },
    markdownPlugins() {
      return []
    },
    htmlPlugins() {
      return []
    },
    externalResources() {
      return {
        css: [],
        js: [
          {
            script: dataviewScript,
            loadTime: "afterDOMReady",
            contentType: "inline",
          } as JSResource,
        ],
      }
    },
  }
}

