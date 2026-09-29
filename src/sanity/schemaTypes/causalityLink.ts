import {defineField, defineType} from 'sanity'

export const causalityLink = defineType({
  name: 'causalityLink',
  title: 'Causality link',
  type: 'document',
  fields: [
    defineField({
      name: 'sourceEvent',
      title: 'Source event',
      type: 'reference',
      to: [{type: 'temporalAction'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'targetState',
      title: 'Target state',
      type: 'reference',
      to: [{type: 'room'}, {type: 'gameObject'}, {type: 'clue'}],
      description: 'The document whose state this link affects',
    }),
    defineField({
      name: 'sourceEra',
      title: 'Source era',
      type: 'reference',
      to: [{type: 'era'}],
    }),
    defineField({
      name: 'targetEra',
      title: 'Target era',
      type: 'reference',
      to: [{type: 'era'}],
    }),
    defineField({
      name: 'relationshipType',
      title: 'Relationship type',
      type: 'string',
      options: {
        list: [
          {title: 'Enables', value: 'enables'},
          {title: 'Blocks', value: 'blocks'},
          {title: 'Transforms', value: 'transforms'},
          {title: 'Reveals', value: 'reveals'},
        ],
      },
    }),
    defineField({
      name: 'strength',
      title: 'Strength',
      type: 'number',
      description: 'How strong this causal relationship is, from 0 to 100',
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: 'explanation',
      title: 'Explanation',
      type: 'text',
      description: 'Human/agent-readable reasoning for why this link exists',
    }),
  ],
  preview: {
    select: {title: 'relationshipType', subtitle: 'sourceEvent.description'},
  },
})
