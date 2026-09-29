import {defineField, defineType} from 'sanity'

export const temporalAction = defineType({
  name: 'temporalAction',
  title: 'Temporal action',
  type: 'document',
  fields: [
    defineField({
      name: 'description',
      title: 'Action description',
      type: 'string',
      description: 'e.g. "Hide the brass key inside the east wall"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceEra',
      title: 'Source era',
      type: 'reference',
      to: [{type: 'era'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'targetObject',
      title: 'Target object',
      type: 'reference',
      to: [{type: 'gameObject'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'affectedRooms',
      title: 'Affected future rooms',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'room'}]}],
    }),
    defineField({
      name: 'actionType',
      title: 'Action type',
      type: 'string',
      options: {
        list: [
          {title: 'Hide', value: 'hide'},
          {title: 'Move', value: 'move'},
          {title: 'Destroy', value: 'destroy'},
          {title: 'Reveal', value: 'reveal'},
          {title: 'Alter', value: 'alter'},
        ],
      },
    }),
    defineField({
      name: 'causalityStatus',
      title: 'Causality status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Committed', value: 'committed'},
          {title: 'Propagating', value: 'propagating'},
          {title: 'Resolved', value: 'resolved'},
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
    }),
    defineField({
      name: 'paradoxRisk',
      title: 'Paradox risk',
      type: 'string',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Low', value: 'low'},
          {title: 'Medium', value: 'medium'},
          {title: 'High', value: 'high'},
          {title: 'Critical', value: 'critical'},
        ],
      },
      initialValue: 'none',
    }),
  ],
  preview: {
    select: {title: 'description', subtitle: 'causalityStatus'},
  },
})
