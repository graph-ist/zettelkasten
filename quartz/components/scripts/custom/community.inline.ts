// Toggle functionality for community collapsible section
function setupCommunityToggle() {
  const toggle = document.getElementById("community-toggle")
  const content = document.getElementById("community-content")
  
  if (!toggle || !content) return

  function toggleCommunity(this: HTMLElement) {
    const isExpanded = this.getAttribute("aria-expanded") === "true"
    this.setAttribute("aria-expanded", isExpanded ? "false" : "true")
    content!.classList.toggle("collapsed", isExpanded)
  }

  toggle.addEventListener("click", toggleCommunity)
  window.addCleanup(() => toggle.removeEventListener("click", toggleCommunity))
}

document.addEventListener("nav", setupCommunityToggle)
