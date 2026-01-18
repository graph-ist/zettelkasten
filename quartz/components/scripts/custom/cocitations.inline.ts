// Toggle functionality for co-citations collapsible section
function setupCoCitationsToggle() {
  const toggle = document.getElementById("cocitations-toggle")
  const content = document.getElementById("cocitations-content")
  
  if (!toggle || !content) return

  function toggleCoCitations(this: HTMLElement) {
    const isExpanded = this.getAttribute("aria-expanded") === "true"
    this.setAttribute("aria-expanded", isExpanded ? "false" : "true")
    content!.classList.toggle("collapsed", isExpanded)
  }

  toggle.addEventListener("click", toggleCoCitations)
  window.addCleanup(() => toggle.removeEventListener("click", toggleCoCitations))
}

document.addEventListener("nav", setupCoCitationsToggle)
