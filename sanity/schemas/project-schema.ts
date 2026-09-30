import { defineType, defineField, defineArrayMember } from 'sanity'

const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'blocks',
      title: 'Page blocks',
      type: 'array',
      description:
        'Full-viewport scroll: images, videos, text, or mobile-only empty space. Order here is the page order and counter.',
      of: [
        defineArrayMember({ type: 'projectBlock', title: 'Image / Video / Text' }),
        defineArrayMember({ type: 'projectSpacer25' }),
        defineArrayMember({ type: 'projectSpacer50' }),
      ],
      options: {
        sortable: true,
      },
    }),
  ],
})

export default project
