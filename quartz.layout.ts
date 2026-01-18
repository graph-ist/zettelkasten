import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ContentMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({
      filterFn: (node) => node.name !== "----------------------------------",
    }),
  ],
  right: [
    Component.Graph({
      localGraph: {
        fontSize: 0.4,
        showTags: false,
      },
      globalGraph: {
        fontSize: 0.4,
        showTags: false,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.CoCitations(),
    Component.Similarity(),
    Component.LinkPrediction(),
    Component.Community(),
  ],
  afterBody: [
    Component.VirtualLinker(),
    Component.ConditionalRender({
      component: Component.SankeyDiagram({ height: 450 }),
      condition: (page) => page.fileData.slug === "index",
    }),
    // Component.ConditionalRender({
    //   component: Component.TopCommunities({
    //     title: "Topic Clusters",
    //     topCommunities: 3,
    //     notesPerCommunity: 4,
    //   }),
    //   condition: (page) => page.fileData.slug === "index",
    // }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      filterFn: (node) => node.name !== "----------------------------------",
    }),
  ],
  right: [],
}
