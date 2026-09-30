import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

const landing = defineType({
  name: 'landing',
  title: 'Landing Page',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal title for Studio (not shown on the site)',
      initialValue: 'Landing Page',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Full-bleed background image for the landing / enter page',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describe the image for accessibility',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'enterText',
      title: 'Enter text',
      type: 'string',
      description: 'Text shown on the landing page (e.g. “click anywhere to enter site”)',
      initialValue: 'click anywhere to enter site',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'heroImage',
    },
  },
})

export default landing
