import {defineField, defineType} from 'sanity'

export const paradox = defineType({
  name: 'paradox',
  title: 'Paradox',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'severity',
      title: 'Severity',
      type: 'string',
      options: {
        list: [
          {title: 'Minor', value: 'minor'},
          {title: 'Moderate', value: 'moderate'},
          {title: 'Severe', value: 'severe'},
          {title: 'Critical', value: 'critical'},
        ],
      },
      initialValue: 'minor',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'sourceAction',
      title: 'Source action',
      type: 'reference',
      to: [{type: 'temporalAction'}],
    }),
    defineField({
      name: 'affectedDocuments',
      title: 'Affected documents',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'room'}, {type: 'gameObject'}, {type: 'clue'}, {type: 'causalityLink'}],
        },
      ],
    }),
    defineField({
      name: 'resolutionStatus',
      title: 'Resolution status',
      type: 'string',
      options: {
        list: [
          {title: 'Unresolved', value: 'unresolved'},
          {title: 'Under review', value: 'underReview'},
          {title: 'Resolved', value: 'resolved'},
          {title: 'Accepted', value: 'accepted'},
        ],
      },
      initialValue: 'unresolved',
    }),
    defineField({
      name: 'gmNotes',
      title: 'Game Master notes',
      type: 'text',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'severity'},
  },
})
