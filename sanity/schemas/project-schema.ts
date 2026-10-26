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
        'Images, videos, and text. For each image/video pick Landscape, Portrait, or Irregular display.',
      of: [
        defineArrayMember({ type: 'projectBlock', title: 'Image / Video / Text' }),
      ],
      options: {
        sortable: true,
      },
    }),
  ],
})

export default project
