import { defineType, defineField } from 'sanity'
import { DocumentTextIcon, ImageIcon, PlayIcon } from '@sanity/icons'

/** One full-viewport block on the project page: image, video, or text */
const projectBlock = defineType({
  name: 'projectBlock',
  title: 'Project block',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Block type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
          { title: 'Text', value: 'text' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Shown centered at the bottom of the page for this block (e.g. “Fountain Detail”)',
      hidden: ({ parent }) => parent?.mediaType === 'text',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'image' && !value) return 'Image is required'
          return true
        }),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: { accept: 'video/*' },
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
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'text',
      title: 'Text (desktop)',
      type: 'text',
      rows: 8,
      description: 'Shown on desktop (and on mobile if Mobile text is empty)',
      hidden: ({ parent }) => parent?.mediaType !== 'text',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {
            mediaType?: string
            textMobile?: string
          } | undefined
          if (parent?.mediaType !== 'text') return true
          if (!value?.trim() && !parent?.textMobile?.trim()) {
            return 'Add desktop text and/or mobile text'
          }
          return true
        }),
    }),
    defineField({
      name: 'textMobile',
      title: 'Text (mobile)',
      type: 'text',
      rows: 8,
      description:
        'Optional. If set, mobile shows this instead of desktop text — use for shorter or different paragraphs on small screens.',
      hidden: ({ parent }) => parent?.mediaType !== 'text',
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      caption: 'caption',
      text: 'text',
      textMobile: 'textMobile',
      media: 'image',
    },
    prepare: ({ mediaType, caption, text, textMobile, media }) => {
      const typeLabel =
        mediaType === 'video' ? 'Video' : mediaType === 'text' ? 'Text' : 'Image'
      const subtitle =
        mediaType === 'text'
          ? (text || textMobile || '').slice(0, 60)
          : caption || typeLabel
      return {
        title: typeLabel,
        subtitle,
        media:
          mediaType === 'text'
            ? DocumentTextIcon
            : mediaType === 'video'
              ? PlayIcon
              : media || ImageIcon,
      }
    },
  },
})

export default projectBlock
