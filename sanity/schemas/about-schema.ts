import { defineType, defineField } from "sanity";

const about = defineType({
  name: "about",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "aboutText",
      title: "About Text",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "object",
          name: "lineBreak",
          title: "Line break",
          description: "Adds a line break. Use when you want to start a new line.",
          fields: [
            defineField({
              name: "marker",
              title: "Marker",
              type: "string",
              initialValue: "lineBreak",
              hidden: true,
            }),
          ],
          preview: {
            prepare: () => ({ title: "Line break", subtitle: "Adds a new line" }),
          },
        },
      ],
      description: "Main text about the gallery location and access",
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "object",
          name: "lineBreak",
          title: "Line break",
          description: "Adds a line break. Use when you want to start a new line.",
          fields: [
            defineField({
              name: "marker",
              title: "Marker",
              type: "string",
              initialValue: "lineBreak",
              hidden: true,
            }),
          ],
          preview: {
            prepare: () => ({ title: "Line break", subtitle: "Adds a new line" }),
          },
        },
      ],
      description: "Address text",
    }),
  
    defineField({
        name: "contactPhone",
        title: "Contact Phone",
        type: "string",
        description: "Include country code, e.g. +44 (0)752033690",
      }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
    }),

  ],
});

export default about;
