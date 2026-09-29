import {defineField, defineType} from 'sanity'

export const gameSession = defineType({
  name: 'gameSession',
  title: 'Game Session',
  type: 'document',
  fields: [
    defineField({
      name: 'sessionCode',
      title: 'Session Access Code',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Investigation Codename',
      type: 'string',
      initialValue: "Operation Chronos: The Clockmaker's Vault",
    }),
    defineField({
      name: 'currentMission',
      title: 'Current Mission Directive',
      type: 'text',
      initialValue: 'Locate the Chronos Core hidden across the three temporal iterations of the Clockmaker’s Vault.',
    }),
    defineField({
      name: 'players',
      title: 'Active Agents',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'player'}]}],
    }),
    defineField({
      name: 'playerNames',
      title: 'Player Names / Handles',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'activeTimeline',
      title: 'Primary Monitored Timeline',
      type: 'reference',
      to: [{type: 'timelineState'}],
    }),
    defineField({
      name: 'currentEra',
      title: 'Focal Era',
      type: 'reference',
      to: [{type: 'era'}],
    }),
    defineField({
      name: 'currentRoom',
      title: 'Focal Room',
      type: 'reference',
      to: [{type: 'room'}],
    }),
    defineField({
      name: 'sessionStatus',
      title: 'Session Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active Investigation', value: 'active'},
          {title: 'Paused', value: 'paused'},
          {title: 'Causality Breach', value: 'breach'},
          {title: 'Timeline Stabilized', value: 'stabilized'},
          {title: 'Ended', value: 'ended'},
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'startTime',
      title: 'Start Time',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {title: 'sessionCode', subtitle: 'sessionStatus'},
  },
})
