import {defineField, defineType} from 'sanity'

export const timelineState = defineType({
  name: 'timelineState',
  title: 'Timeline state',
  type: 'document',
  fields: [
    defineField({
      name: 'timelineId',
      title: 'Timeline identifier',
      type: 'string',
      description: 'A short unique id for this timeline, e.g. "era-1920"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'era',
      title: 'Era',
      type: 'reference',
      to: [{type: 'era'}],
    }),
    defineField({
      name: 'currentStatus',
      title: 'Current status',
      type: 'string',
      options: {
        list: [
          {title: 'Stable', value: 'stable'},
          {title: 'Fluctuating', value: 'fluctuating'},
          {title: 'Unstable', value: 'unstable'},
          {title: 'Sealed', value: 'sealed'},
        ],
      },
      initialValue: 'stable',
    }),
    defineField({
      name: 'activeParadoxes',
      title: 'Active paradoxes',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'paradox'}]}],
    }),
    defineField({
      name: 'lastCommittedAction',
      title: 'Last committed action',
      type: 'reference',
      to: [{type: 'temporalAction'}],
    }),
    defineField({
      name: 'healthIndicator',
      title: 'Causality integrity (%)',
      type: 'number',
      validation: (rule) => rule.min(0).max(100),
      initialValue: 100,
    }),
    defineField({
      name: 'sealedState',
      title: 'Sealed',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'timelineId', subtitle: 'currentStatus'},
  },
})
