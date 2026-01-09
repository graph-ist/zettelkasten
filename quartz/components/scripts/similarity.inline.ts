// Toggle functionality for similarity collapsible section
function setupSimilarityToggle() {
  const toggle = document.getElementById("similarity-toggle")
  const content = document.getElementById("similarity-content")
  
  if (!toggle || !content) return

  function toggleSimilarity(this: HTMLElement) {
    const isExpanded = this.getAttribute("aria-expanded") === "true"
    this.setAttribute("aria-expanded", isExpanded ? "false" : "true")
    content!.classList.toggle("collapsed", isExpanded)
  }

  toggle.addEventListener("click", toggleSimilarity)
  window.addCleanup(() => toggle.removeEventListener("click", toggleSimilarity))
}

document.addEventListener("nav", setupSimilarityToggle)
