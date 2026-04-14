import { defineType, defineField } from "sanity";
import GeopointSearchInput from "../components/GeopointSearchInput";

const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "listTitle",
      title: "List Title",
      type: "string",
      description:
        "Line shown in the project list (e.g. “2026 Riela Bath house, Madrid”).",
    }),
    defineField({
      name: "mapTitle",
      title: "Map Title",
      type: "string",
      description:
        "Label on the map pin if different from the project title (e.g. establishment, city, year). Falls back to project title when empty.",
    }),
    defineField({
      name: "location",
      title: "Map location",
      type: "geopoint",
      description: "Set to show this project on the map view.",
      components: {
        input: GeopointSearchInput,
      },
    }),
    defineField({
      name: "description",
      title: "Project Description",
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
    }),
    defineField({
      name: "image",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
            }),
          ],
        },
      ],
    }),
  ],
});

export default project;
