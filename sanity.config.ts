import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import project from './sanity/schemas/project-schema'
import projectBlock from './sanity/schemas/project-block-schema'
import {
  projectSpacer25,
  projectSpacer50,
} from './sanity/schemas/project-spacer-schema'
import about from './sanity/schemas/about-schema'
import aboutProject from './sanity/schemas/about-project-schema'
import landing from './sanity/schemas/landing-schema'
import home, { homeSlide } from './sanity/schemas/home-schema'
import { structure } from './sanity/structure'

const siteBase = process.env.NEXT_PUBLIC_BASE_PATH || ''

const config = defineConfig({
  projectId: 'dcvdj7yc',
  dataset: 'production',
  title: ' OS Website',
  apiVersion: '2026-04-08',
  basePath: `${siteBase}/admin`,
  plugins: [structureTool({ structure })],
  schema: {
    types: [
      projectBlock,
      projectSpacer25,
      projectSpacer50,
      project,
      about,
      aboutProject,
      landing,
      homeSlide,
      home,
    ],
  },
})

export default config
