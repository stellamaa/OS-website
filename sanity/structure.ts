import type { StructureResolver } from 'sanity/structure'
import { DocumentsIcon, ImageIcon } from '@sanity/icons'

const SINGLETONS = ['landing']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Landing Page')
        .icon(ImageIcon)
        .child(S.document().schemaType('landing').documentId('landing').title('Landing Page')),
      S.divider(),
      S.listItem()
        .title('About Projects')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('aboutProject').title('About Projects')),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !SINGLETONS.includes(listItem.getId() as string) && listItem.getId() !== 'aboutProject',
      ),
    ])
