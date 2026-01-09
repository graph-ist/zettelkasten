// Toggle functionality for backlinks collapsible section
function setupBacklinksToggle() {
  const toggle = document.getElementById("backlinks-toggle")
  const content = document.getElementById("backlinks-content")
  
  if (!toggle || !content) return

  function toggleBacklinks(this: HTMLElement) {
    const isExpanded = this.getAttribute("aria-expanded") === "true"
    this.setAttribute("aria-expanded", isExpanded ? "false" : "true")
    content!.classList.toggle("collapsed", isExpanded)
  }

  toggle.addEventListener("click", toggleBacklinks)
  window.addCleanup(() => toggle.removeEventListener("click", toggleBacklinks))
}

document.addEventListener("nav", setupBacklinksToggle)
