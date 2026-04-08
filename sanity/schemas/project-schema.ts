const project = {
    name: 'project',
    title: 'Projects',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Project Title',
            type: 'string',
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
            },
        },
        {
            name: 'mapTitle',
            title: 'Map Title',
            type: 'string',
            description: 'Title for the map, establishment, city, year (eg. "Riela Bath house, Madrid, 2026)',
        },
        {
            name: "listTitle",
            title: "List Title",
            type: "string",
            description: "Title for the list of projects, year, establishment, city (eg. '2026 Riela Bath house, Madrid')",
        },
        {
            name: 'description',
            title: 'Project Description',
            type: 'array',
            of: [
              { type: 'block' },
              {
                type: 'object',
                name: 'lineBreak',
                title: 'Line break',
                description: 'Adds a line break. Use when you want to start a new line.',
                fields: [
                  {
                    name: 'marker',
                    title: 'Marker',
                    type: 'string',
                    initialValue: 'lineBreak',
                    hidden: true,
                  },
                ],
                preview: {
                  prepare: () => ({ title: 'Line break', subtitle: 'Adds a new line' }),
                },
              },
            ],
        },
        {
            name: 'image',
            title: 'Image',
            type: "array",
            of: [{
                type: "image",
                options: { hotspot: true },
         
            fields: [
                {
                    name: 'alt',
                    title: 'Alt',
                    type: 'string',
                },

            ],

            }],
        },

    ],
}

export default project;