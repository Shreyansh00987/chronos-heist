import {defineField, defineType} from 'sanity'

export const player = defineType({
  name: 'player',
  title: 'Temporal Agent / Player',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Agent Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'callsign',
      title: 'Callsign / Code',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Specialty Role',
      type: 'string',
      options: {
        list: [
          {title: 'Origin Infiltrator (1920)', value: 'origin_infiltrator'},
          {title: 'Signal Specialist (1970)', value: 'signal_specialist'},
          {title: 'Cyber Heist Operator (2026)', value: 'cyber_operator'},
          {title: 'Game Master', value: 'game_master'},
        ],
      },
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar Icon',
      type: 'string',
      description: 'Icon identifier or sprite key',
    }),
    defineField({
      name: 'assignedEra',
      title: 'Assigned Era',
      type: 'reference',
      to: [{type: 'era'}],
    }),
    defineField({
      name: 'currentRoom',
      title: 'Current Room',
      type: 'reference',
      to: [{type: 'room'}],
    }),
    defineField({
      name: 'inventory',
      title: 'Carried Inventory',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'gameObject'}]}],
    }),
    defineField({
      name: 'session',
      title: 'Active Session',
      type: 'reference',
      to: [{type: 'gameSession'}],
    }),
    defineField({
      name: 'lastActive',
      title: 'Last Active Timestamp',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Temporal Status',
      type: 'string',
      options: {
        list: [
          {title: 'Synchronized', value: 'synchronized'},
          {title: 'Desynchronized', value: 'desynchronized'},
          {title: 'Temporal Drift', value: 'temporal_drift'},
        ],
      },
      initialValue: 'synchronized',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
    },
  },
})
