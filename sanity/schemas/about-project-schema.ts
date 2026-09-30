import { defineType, defineField } from 'sanity'
import { DocumentsIcon } from '@sanity/icons'

const aboutProject = defineType({
  name: 'aboutProject',
  title: 'About Project',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Project name shown in the about list (e.g. PIZZABAR)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Short line under the title (location, award, status, etc.)',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Shown as a full-bleed blurred background on desktop hover',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'image',
    },
  },
})

export default aboutProject
