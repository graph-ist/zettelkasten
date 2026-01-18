export const escapeHTML = (unsafe: string) => {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

/**
 * Escapes CDATA section delimiters to prevent XML injection.
 * Converts "]]>" to "]]]]><![CDATA[>" which safely closes and reopens CDATA.
 * @param str - The string to escape
 * @returns The escaped string safe for use in CDATA sections
 */
export const escapeCDATA = (str: string): string => {
  return str.replace(/]]>/g, "]]]]><![CDATA[>")
}

export const unescapeHTML = (html: string) => {
  return html
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
}
