import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import project from './sanity/schemas/project-schema'
import about from './sanity/schemas/about-schema'
import aboutProject from './sanity/schemas/about-project-schema'
import landing from './sanity/schemas/landing-schema'
import { structure } from './sanity/structure'

const config = defineConfig({
  projectId: 'dcvdj7yc',
  dataset: 'production',
  title: ' OS Website',
  apiVersion: '2026-04-08',
  basePath: '/admin',
  plugins: [structureTool({ structure })],
  schema: {
    types: [project, about, aboutProject, landing],
  },
})

export default config
