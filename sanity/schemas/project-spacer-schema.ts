import { defineType, defineField } from 'sanity'
import { BlockElementIcon } from '@sanity/icons'

/** Mobile-only blank gap — 25vh */
export const projectSpacer25 = defineType({
  name: 'projectSpacer25',
  title: 'Empty space mobile (25vh)',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      readOnly: true,
      initialValue:
        'Adds a blank 25vh gap on mobile. Hidden on desktop — no other settings.',
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Empty space mobile (25vh)',
      subtitle: 'Blank gap on mobile only — hidden on desktop',
    }),
  },
})

/** Mobile-only blank gap — 50vh */
export const projectSpacer50 = defineType({
  name: 'projectSpacer50',
  title: 'Empty space mobile (50vh)',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      readOnly: true,
      initialValue:
        'Adds a blank 50vh gap on mobile. Hidden on desktop — no other settings.',
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Empty space mobile (50vh)',
      subtitle: 'Blank gap on mobile only — hidden on desktop',
    }),
  },
})
