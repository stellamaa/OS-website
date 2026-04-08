import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import project from './sanity/schemas/project-schema'
import about from './sanity/schemas/about-schema'

const config = defineConfig({
     projectId: 'dcvdj7yc',
     dataset:"production",
     title: " OS Website",
     apiVersion: "2026-04-08",
     basePath: "/admin",
     plugins: [structureTool()],
     schema: {
        types: [project, about],
     },

})

export default config;