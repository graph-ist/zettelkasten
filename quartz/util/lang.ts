export function capitalize(s: string): string {
  return s.substring(0, 1).toUpperCase() + s.substring(1)
}

export function classNames(
  displayClass?: "mobile-only" | "desktop-only",
  ...classes: string[]
): string {
  if (displayClass) {
    classes.push(displayClass)
  }
  return classes.join(" ")
}

/**
 * Merges default options with user-provided overrides.
 * Provides type-safe partial overrides of default configuration objects.
 * 
 * @param defaults - The default options object
 * @param overrides - Optional partial overrides
 * @returns Merged options with defaults and overrides combined
 */
export function mergeOptions<T extends object>(defaults: T, overrides?: Partial<T>): T {
  return { ...defaults, ...overrides }
}
