import {defineField, defineType} from 'sanity'

export const era = defineType({
  name: 'era',
  title: 'Era',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Display name for this era, e.g. "The Origin"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'The year this era represents, e.g. 1920',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Chronological order',
      type: 'number',
      description: 'Used to sort eras in sequence (1 = earliest)',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'visualTheme',
      title: 'Visual theme',
      type: 'object',
      description: 'Controls the look and feel of this era in the 3D scene',
      fields: [
        defineField({
          name: 'primaryColor',
          title: 'Primary color',
          type: 'string',
          description: 'Hex color, e.g. #D4A017',
        }),
        defineField({
          name: 'ambiance',
          title: 'Ambiance description',
          type: 'string',
          description: 'Short mood descriptor, e.g. "dusty amber, gaslight flicker"',
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'year'},
  },
})
