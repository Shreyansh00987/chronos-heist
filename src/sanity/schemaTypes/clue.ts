import {defineField, defineType} from 'sanity'

export const clue = defineType({
  name: 'clue',
  title: 'Clue',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'reference',
      to: [{type: 'room'}],
    }),
    defineField({
      name: 'relatedObjects',
      title: 'Related objects',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'gameObject'}]}],
    }),
    defineField({
      name: 'relatedEvents',
      title: 'Related timeline events',
      type: 'array',
      of: [
        {type: 'reference', to: [{type: 'temporalAction'}, {type: 'causalityLink'}]},
      ],
    }),
    defineField({
      name: 'discoveryState',
      title: 'Discovery state',
      type: 'string',
      options: {
        list: [
          {title: 'Undiscovered', value: 'undiscovered'},
          {title: 'Discovered', value: 'discovered'},
          {title: 'Analyzed', value: 'analyzed'},
        ],
      },
      initialValue: 'undiscovered',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'discoveryState'},
  },
})
