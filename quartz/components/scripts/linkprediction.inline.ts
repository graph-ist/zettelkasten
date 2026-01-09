// Toggle functionality for link prediction collapsible section
function setupLinkPredictionToggle() {
  const toggle = document.getElementById("linkprediction-toggle")
  const content = document.getElementById("linkprediction-content")
  
  if (!toggle || !content) return

  function toggleLinkPrediction(this: HTMLElement) {
    const isExpanded = this.getAttribute("aria-expanded") === "true"
    this.setAttribute("aria-expanded", isExpanded ? "false" : "true")
    content!.classList.toggle("collapsed", isExpanded)
  }

  toggle.addEventListener("click", toggleLinkPrediction)
  window.addCleanup(() => toggle.removeEventListener("click", toggleLinkPrediction))
}

document.addEventListener("nav", setupLinkPredictionToggle)
