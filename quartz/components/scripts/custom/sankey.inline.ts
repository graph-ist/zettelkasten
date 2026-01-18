// D3 will be loaded dynamically from CDN

interface SankeyNodeData {
  id: string
  name: string
  category: "cssclass" | "subclass" | "related" | "note"
  slug?: string
}

interface SankeyLinkData {
  source: string
  target: string
  value: number
}

interface NoteInfo {
  slug: string
  title: string
  cssclass: string
  subclass: string
}

interface SankeyDataResponse {
  nodes: SankeyNodeData[]
  links: SankeyLinkData[]
  noteMapping: Record<string, { cssclass: string; subclass: string; related: string[] }>
  subclassNotes: Record<string, NoteInfo[]>
}

// Category colors
const COLORS: Record<string, string> = {
  cssclass: "#8b5cf6", // Purple
  subclass: "#8b5cf6", // Purple
  related: "#8b5cf6", // Purple
  note: "#8b5cf6", // Purple
}

// State for drill-down
let currentView: "overview" | "drilldown" = "overview"
let selectedSubclass: string | null = null
let globalData: SankeyDataResponse | null = null

async function renderSankey() {
  const container = document.getElementById("sankey-diagram")
  if (!container) return

  const height = parseInt(container.dataset.height || "450", 10)

  // Show loading
  container.innerHTML = '<div class="sankey-loading">Loading diagram...</div>'

  try {
    // Load D3 from CDN
    // @ts-expect-error: Dynamic CDN import
    const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm")
    // @ts-expect-error: Dynamic CDN import  
    const d3Sankey = await import("https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm")

    // Fetch data (only once)
    if (!globalData) {
      const response = await fetch("/sankeyData.json")
      if (!response.ok) throw new Error("Failed to load sankey data")
      globalData = await response.json()
    }

    // Clear container
    container.innerHTML = ""

    const width = container.clientWidth || 700
    const margin = { top: 10, right: 10, bottom: 10, left: 10 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create SVG - fill full width
    const svg = d3.select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Build data based on current view
    let nodes: SankeyNodeData[]
    let links: SankeyLinkData[]

    if (currentView === "overview") {
      // Show cssclasses → subclasses
      nodes = globalData!.nodes
      links = globalData!.links
    } else {
      // Drill-down: show subclass → notes
      const subclassName = selectedSubclass!
      const notes = globalData!.subclassNotes[subclassName] || []
      
      // Create nodes: one subclass + all its notes
      nodes = [
        {
          id: `subclass:${subclassName}`,
          name: subclassName.replace(/-/g, " "),
          category: "subclass",
        },
        ...notes.map((n) => ({
          id: `note:${n.slug}`,
          name: n.title,
          category: "note" as const,
          slug: n.slug,
        })),
      ]

      // Create links: subclass → each note
      links = notes.map((n) => ({
        source: `subclass:${subclassName}`,
        target: `note:${n.slug}`,
        value: 1,
      }))
    }

    // Build node index map
    const nodeIdToIndex = new Map<string, number>()
    nodes.forEach((n, i) => nodeIdToIndex.set(n.id, i))

    // Prepare nodes with index
    const sankeyNodes = nodes.map((d, i) => ({ ...d, index: i }))

    // Prepare links with numeric indices
    const sankeyLinks = links
      .filter((l) => nodeIdToIndex.has(l.source) && nodeIdToIndex.has(l.target))
      .map((l) => ({
        source: nodeIdToIndex.get(l.source)!,
        target: nodeIdToIndex.get(l.target)!,
        value: l.value,
        sourceId: l.source,
        targetId: l.target,
      }))

    if (sankeyLinks.length === 0) {
      container.innerHTML = '<div class="sankey-error">No data to display</div>'
      return
    }

    // Create sankey generator
    const sankeyGenerator = d3Sankey.sankey()
      .nodeWidth(15)
      .nodePadding(currentView === "drilldown" ? 4 : 8)
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])

    // Generate layout
    const graph = sankeyGenerator({
      nodes: sankeyNodes.map((d) => ({ ...d })),
      links: sankeyLinks.map((d) => ({ ...d })),
    })

    // Draw links
    const link = svg
      .append("g")
      .attr("fill", "none")
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("class", "link")
      .attr("d", d3Sankey.sankeyLinkHorizontal())
      .attr("stroke", (d: any) => {
        const source = d.source as any
        return COLORS[source?.category] || "#999"
      })
      .attr("stroke-width", (d: any) => Math.max(1, d.width || 1))

    // Draw nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(graph.nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", (d: any) => {
        if (currentView === "overview" && d.category === "subclass") return "pointer"
        if (currentView === "drilldown" && d.category === "note") return "pointer"
        if (currentView === "drilldown" && d.category === "subclass") return "pointer"
        return "default"
      })

    node
      .append("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => Math.max(1, d.y1 - d.y0))
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => COLORS[d.category] || "#999")
      .append("title")
      .text((d: any) => {
        if (d.category === "subclass" && currentView === "overview") {
          return `${d.name}\n${d.value || 0} notes\nClick to explore`
        }
        if (d.category === "note") {
          return `${d.name}\nClick to open`
        }
        return `${d.name}\n${d.value || 0} connections`
      })

    node
      .append("text")
      .attr("x", (d: any) => (d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => (d.x0 < innerWidth / 2 ? "start" : "end"))
      .text((d: any) => {
        const name = d.name || ""
        const maxLen = currentView === "drilldown" ? 35 : 20
        return name.length > maxLen ? name.slice(0, maxLen - 2) + "…" : name
      })

    // Click handlers
    node.on("click", function (_event: MouseEvent, d: any) {
      if (currentView === "overview" && d.category === "subclass") {
        // Drill down into subclass
        const subclassName = d.id.replace("subclass:", "")
        selectedSubclass = subclassName
        currentView = "drilldown"
        renderSankey()
      } else if (currentView === "drilldown" && d.category === "note") {
        // Navigate to note
        const slug = d.slug || d.id.replace("note:", "")
        window.location.href = `/${slug}`
      } else if (currentView === "drilldown" && d.category === "subclass") {
        // Go back to overview
        currentView = "overview"
        selectedSubclass = null
        renderSankey()
      }
    })

    // Hover interactions
    node.on("mouseenter", function (_event: MouseEvent, d: any) {
      link.attr("class", (l: any) => {
        const sourceId = l.sourceId || (l.source as any).id
        const targetId = l.targetId || (l.target as any).id
        if (sourceId === d.id || targetId === d.id) {
          return "link highlighted"
        }
        return "link dimmed"
      })
    })

    node.on("mouseleave", function () {
      link.attr("class", "link")
    })

  } catch (err) {
    console.error("Sankey error:", err)
    container.innerHTML = `<div class="sankey-error">Failed to load diagram: ${err}</div>`
  }
}

document.addEventListener("nav", () => {
  // Reset state on navigation
  currentView = "overview"
  selectedSubclass = null
  renderSankey()
})
