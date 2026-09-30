import { defineType, defineField, defineArrayMember } from 'sanity'
import { ImagesIcon, ImageIcon } from '@sanity/icons'

/** One homepage scroll item: image or video + linked project */
export const homeSlide = defineType({
  name: 'homeSlide',
  title: 'Homepage media',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Label in Studio and accessible name on the site',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mediaType',
      title: 'Media type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
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
      hidden: ({ parent }) => parent?.mediaType === 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== 'video' && !value) return 'Image is required'
          return true
        }),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      description: 'Upload an MP4 (or similar). Plays muted, looping, full-bleed on the homepage.',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'video' && !value) return 'Video is required'
          return true
        }),
    }),
    defineField({
      name: 'poster',
      title: 'Video poster (optional)',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Still frame shown before the video loads',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
      description: 'Clicking this media on the site opens this project',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      mediaType: 'mediaType',
      projectTitle: 'project.title',
    },
    prepare: ({ title, media, mediaType, projectTitle }) => ({
      title: title || 'Untitled',
      subtitle: [
        mediaType === 'video' ? 'Video' : 'Image',
        projectTitle ? `→ ${projectTitle}` : 'No project',
      ].join(' · '),
      media,
    }),
  },
})

const home = defineType({
  name: 'home',
  title: 'Home Page',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal title for Studio (not shown on the site)',
      initialValue: 'Home Page',
    }),
    defineField({
      name: 'images',
      title: 'Media',
      type: 'array',
      description:
        'Add images or videos. Each row is one full-bleed scroll item linked to a project. Drag to reorder — order = scroll order and 1/N counter.',
      of: [defineArrayMember({ type: 'homeSlide' })],
      options: {
        sortable: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0.image',
      count: 'images',
    },
    prepare: ({ title, media, count }) => ({
      title: title || 'Home Page',
      subtitle: `${Array.isArray(count) ? count.length : 0} items`,
      media,
    }),
  },
})

export default home
