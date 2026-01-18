// Module declarations for inline scripts (fixes @ts-ignore usage)
declare module "*.inline" {
  const content: string
  export default content
}

declare module "*.inline.ts" {
  const content: string
  export default content
}

declare module "*.inline.scss" {
  const content: string
  export default content
}

declare module "*.scss" {
  const content: string
  export default content
}

export declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K] | UIEvent): void
  }
  interface Window {
    spaNavigate(url: URL, isBack: boolean = false)
    addCleanup(fn: (...args: any[]) => void)
  }
}
