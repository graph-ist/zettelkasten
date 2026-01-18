// Virtual Linker - Auto-link text matching titles/aliases

document.addEventListener("nav", async () => {
  // Use Quartz's global fetchData which already handles base path correctly
  const contentIndex = await fetchData
  
  // Build a map of terms to all matching pages
  const termToPages: Map<string, { slug: string; title: string }[]> = new Map()
  
  // Get current page slug
  const currentSlug = document.body.dataset.slug || ''

  for (const [slug, data] of Object.entries(contentIndex)) {
    // Skip current page
    if (slug === currentSlug || slug === currentSlug + '/index' || 
        slug.replace(/\/index$/, '') === currentSlug) continue

    const title = (data as any).title || ""
    const aliases = (data as any).aliases || []
    
    // Build the href - use relative path starting with ./
    // This works correctly regardless of base path
    const href = "./" + slug.replace(/\/index$/, "")

    // Add title as term
    if (title && title.length >= 3) {
      const termLower = title.toLowerCase()
      if (!termToPages.has(termLower)) {
        termToPages.set(termLower, [])
      }
      termToPages.get(termLower)!.push({ slug: href, title })
    }

    // Add aliases as terms
    for (const alias of aliases) {
      if (alias && alias.length >= 3) {
        const termLower = alias.toLowerCase()
        if (!termToPages.has(termLower)) {
          termToPages.set(termLower, [])
        }
        // Avoid duplicates
        const existing = termToPages.get(termLower)!
        if (!existing.some(p => p.slug === href)) {
          termToPages.get(termLower)!.push({ slug: href, title })
        }
      }
    }
  }

  // Sort terms by length (longer first)
  const sortedTerms = Array.from(termToPages.keys()).sort((a, b) => b.length - a.length)

  // Process content
  const content = document.querySelector(".center article")
  if (!content) return

  const linkedTerms = new Set<string>()

  // Find all text nodes
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      const tagName = parent.tagName.toLowerCase()
      if (["a", "code", "pre", "script", "style", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
        return NodeFilter.FILTER_REJECT
      }
      if (parent.classList.contains("virtual-link") || parent.classList.contains("virtual-link-multi")) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text)
  }

  // Process each text node
  for (const textNode of textNodes) {
    let text = textNode.nodeValue || ""
    if (text.trim().length < 3) continue

    for (const termLower of sortedTerms) {
      if (linkedTerms.has(termLower)) continue

      const escapedTerm = termLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(`\\b(${escapedTerm})\\b`, "i")
      const match = text.match(regex)

      if (match && match.index !== undefined) {
        const pages = termToPages.get(termLower)!
        const before = text.slice(0, match.index)
        const matched = match[1]
        const after = text.slice(match.index + matched.length)

        const parent = textNode.parentNode!
        const beforeNode = document.createTextNode(before)

        if (pages.length === 1) {
          // Single match - simple link
          const link = document.createElement("a")
          link.href = pages[0].slug
          link.className = "virtual-link internal"
          link.textContent = matched
          link.title = pages[0].title
          
          parent.insertBefore(beforeNode, textNode)
          parent.insertBefore(link, textNode)
        } else {
          // Multiple matches - show options
          const span = document.createElement("span")
          span.className = "virtual-link-multi"
          
          const mainLink = document.createElement("a")
          mainLink.href = pages[0].slug
          mainLink.className = "virtual-link internal"
          mainLink.textContent = matched
          mainLink.title = pages[0].title
          span.appendChild(mainLink)

          const options = document.createElement("span")
          options.className = "virtual-link-options"
          options.textContent = " ("
          
          pages.forEach((page, i) => {
            if (i > 0) {
              const sep = document.createTextNode(", ")
              options.appendChild(sep)
            }
            const numLink = document.createElement("a")
            numLink.href = page.slug
            numLink.className = "virtual-link-num internal"
            numLink.textContent = String.fromCharCode(97 + i) // a, b, c...
            numLink.title = page.title
            options.appendChild(numLink)
          })
          
          options.appendChild(document.createTextNode(")"))
          span.appendChild(options)

          parent.insertBefore(beforeNode, textNode)
          parent.insertBefore(span, textNode)
        }

        const afterNode = document.createTextNode(after)
        parent.replaceChild(afterNode, textNode)
        linkedTerms.add(termLower)
        break
      }
    }
  }

  // Process Mermaid diagrams - add click handlers to SVG text elements
  // Wait a bit for Mermaid to render
  const processMermaid = () => {
    const mermaidDiagrams = document.querySelectorAll(".mermaid svg")
    if (mermaidDiagrams.length === 0) return
    
    for (const diagram of mermaidDiagrams) {
      // Get all node groups (g elements with class "node")
      const nodeGroups = diagram.querySelectorAll("g.node, g.cluster")
      
      for (const nodeGroup of nodeGroups) {
        if (nodeGroup.classList.contains("virtual-link-mermaid-processed")) continue
        nodeGroup.classList.add("virtual-link-mermaid-processed")
        
        // Get text content from the node
        const textEl = nodeGroup.querySelector(".nodeLabel, text, tspan, foreignObject span")
        const rawText = textEl?.textContent?.trim()
        if (!rawText || rawText.length < 3) continue
        
        // Convert kebab-case to space-separated for matching
        const normalizedText = rawText.replace(/-/g, ' ').toLowerCase()

        // Try to match the text
        let pages = termToPages.get(normalizedText)
        if (!pages) {
          pages = termToPages.get(rawText.toLowerCase())
        }
        
        if (pages && pages.length > 0) {
          const targetPage = pages[0]
          
          // Create an SVG anchor element wrapping the node content
          const svgNS = "http://www.w3.org/2000/svg"
          
          // Style the node to look clickable
          nodeGroup.classList.add("virtual-link-mermaid")
          const shape = nodeGroup.querySelector("rect, circle, polygon, path, ellipse")
          if (shape) {
            (shape as SVGElement).style.cursor = "pointer"
          }
          
          // Add click handler directly to the node group
          const clickHandler = (e: Event) => {
            e.preventDefault()
            e.stopPropagation()
            // Use Quartz's SPA navigation
            const link = document.createElement("a")
            link.href = targetPage.slug
            link.click()
          }
          
          nodeGroup.addEventListener("click", clickHandler, true)
          nodeGroup.addEventListener("mousedown", (e) => e.stopPropagation(), true)
          
          // Add tooltip
          const title = document.createElementNS(svgNS, "title")
          title.textContent = `→ ${targetPage.title}`
          nodeGroup.insertBefore(title, nodeGroup.firstChild)
        }
      }
    }
  }
  
  // Use MutationObserver to detect when Mermaid finishes rendering
  const articleContent = document.querySelector(".center article")
  if (articleContent) {
    // Try immediately in case Mermaid already rendered
    processMermaid()
    
    // Set up observer for dynamic Mermaid rendering
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check if any added nodes contain Mermaid SVGs
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.matches(".mermaid svg") || node.querySelector(".mermaid svg")) {
              processMermaid()
              return // Process once per batch of mutations
            }
          }
        }
      }
    })
    
    observer.observe(articleContent, { 
      childList: true, 
      subtree: true 
    })
    
    // Cleanup observer on navigation
    window.addCleanup(() => observer.disconnect())
  }
})
