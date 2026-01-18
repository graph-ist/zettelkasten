// Theme Generator using RampenSau
// Generates new color palettes on each click - full theme with background, text, and links

interface ThemeColors {
  hue: number
  bgPrimary: string
  bgSecondary: string
  textColor: string
  linkColor: string
  linkHover: string
}

// Convert HSL to CSS oklch string
function hslToOklch(h: number, s: number, l: number): string {
  const lightness = (l * 100).toFixed(1)
  const chroma = (s * 0.4).toFixed(3)
  return `oklch(${lightness}% ${chroma} ${h.toFixed(1)})`
}

// Generate a complete theme palette from a base hue
function generatePalette(hue: number): ThemeColors {
  // Background: very dark, low saturation, based on hue
  const bgPrimary = hslToOklch(hue, 0.1, 0.08)  // Very dark main background
  const bgSecondary = hslToOklch(hue, 0.12, 0.12) // Slightly lighter for cards/sidebar
  
  // Text: light, low saturation, complementary
  const textHue = (hue + 30) % 360
  const textColor = hslToOklch(textHue, 0.05, 0.85) // Light gray with slight tint
  
  // Links: vibrant, high saturation
  const linkColor = hslToOklch(hue, 0.7, 0.55) // Vibrant link color
  const linkHover = hslToOklch(hue, 0.8, 0.65) // Brighter on hover
  
  return { hue, bgPrimary, bgSecondary, textColor, linkColor, linkHover }
}

function applyTheme(palette: ThemeColors) {
  let styleTag = document.getElementById('theme-generator-style') as HTMLStyleElement
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.id = 'theme-generator-style'
    document.head.appendChild(styleTag)
  }
  
  console.log('Applying theme with hue:', palette.hue, palette)
  
  styleTag.textContent = `
    /* Background - highest specificity */
    html[saved-theme="dark"], 
    html[saved-theme="dark"] body,
    :root[saved-theme="dark"],
    :root[saved-theme="dark"] body {
      background: ${palette.bgPrimary} !important;
      background-color: ${palette.bgPrimary} !important;
    }
    
    /* Center content area - article */
    html[saved-theme="dark"] .center,
    html[saved-theme="dark"] article,
    html[saved-theme="dark"] article.popover-hint,
    html[saved-theme="dark"] .popover,
    html[saved-theme="dark"] .popover-inner {
      background: ${palette.bgSecondary} !important;
      background-color: ${palette.bgSecondary} !important;
    }
    
    /* Text color for center content */
    html[saved-theme="dark"] .center,
    html[saved-theme="dark"] .center p,
    html[saved-theme="dark"] .center li,
    html[saved-theme="dark"] .center h1,
    html[saved-theme="dark"] .center h2,
    html[saved-theme="dark"] .center h3,
    html[saved-theme="dark"] .center h4,
    html[saved-theme="dark"] .center h5,
    html[saved-theme="dark"] .center h6,
    html[saved-theme="dark"] .center blockquote,
    html[saved-theme="dark"] article,
    html[saved-theme="dark"] article p,
    html[saved-theme="dark"] article li,
    html[saved-theme="dark"] article h1,
    html[saved-theme="dark"] article h2,
    html[saved-theme="dark"] article h3,
    html[saved-theme="dark"] article h4,
    html[saved-theme="dark"] article h5,
    html[saved-theme="dark"] article h6,
    html[saved-theme="dark"] article blockquote {
      color: ${palette.textColor} !important;
    }
    
    /* Links */
    html[saved-theme="dark"] a,
    html[saved-theme="dark"] a:visited { 
      color: ${palette.linkColor} !important; 
    }
    html[saved-theme="dark"] a:hover { 
      color: ${palette.linkHover} !important;
    }
    
    /* Code blocks */
    html[saved-theme="dark"] pre,
    html[saved-theme="dark"] code {
      background: ${palette.bgPrimary} !important;
      background-color: ${palette.bgPrimary} !important;
    }
  `
}

function generateTheme() {
  const hue = Math.random() * 360
  const palette = generatePalette(hue)
  
  applyTheme(palette)
  
  // Save theme to localStorage
  localStorage.setItem('generatedTheme', JSON.stringify({ hue }))
  
  // Emit custom event
  const event = new CustomEvent('themegenerated', { detail: palette })
  document.dispatchEvent(event)
  
  // Add a brief animation to the sun icon
  const btn = document.querySelector('.theme-generator svg')
  if (btn) {
    btn.classList.add('spin')
    setTimeout(() => btn.classList.remove('spin'), 500)
  }
}

function restoreTheme() {
  const saved = localStorage.getItem('generatedTheme')
  if (saved) {
    try {
      const { hue } = JSON.parse(saved)
      const palette = generatePalette(hue)
      applyTheme(palette)
    } catch (e) {
      console.warn('Failed to restore theme:', e)
    }
  } else {
    // Apply a default dark theme if nothing saved
    const defaultPalette = generatePalette(220) // Blue-ish default
    applyTheme(defaultPalette)
  }
}

// Restore saved theme on load
restoreTheme()

// Force dark mode always
document.documentElement.setAttribute("saved-theme", "dark")

document.addEventListener("nav", () => {
  // Force dark mode on navigation
  document.documentElement.setAttribute("saved-theme", "dark")
  
  // Restore link color
  restoreTheme()
  
  // Add click handlers
  const buttons = document.getElementsByClassName("theme-generator")
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i]
    const handler = (e: Event) => {
      e.preventDefault()
      generateTheme()
    }
    btn.addEventListener("click", handler)
    window.addCleanup?.(() => btn.removeEventListener("click", handler))
  }
})
