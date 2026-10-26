import type { StructureResolver } from 'sanity/structure'
import { DocumentsIcon, ImageIcon, ImagesIcon } from '@sanity/icons'

const SINGLETONS = ['landing', 'home']
const HIDDEN_TYPES = [
  ...SINGLETONS,
  'aboutProject',
  'homeSlide',
  'projectBlock',
]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Landing Page')
        .icon(ImageIcon)
        .child(S.document().schemaType('landing').documentId('landing').title('Landing Page')),
      S.listItem()
        .title('Home Page')
        .icon(ImagesIcon)
        .child(S.document().schemaType('home').documentId('home').title('Home Page')),
      S.divider(),
      S.listItem()
        .title('About Projects')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('aboutProject').title('About Projects')),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !HIDDEN_TYPES.includes(listItem.getId() as string),
      ),
    ])
