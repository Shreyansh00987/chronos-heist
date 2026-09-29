import {defineField, defineType} from 'sanity'

export const gameObject = defineType({
  name: 'gameObject',
  title: 'Game Object',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'objectType',
      title: 'Object Type',
      type: 'string',
      options: {
        list: [
          {title: 'Key', value: 'key'},
          {title: 'Document / Clue', value: 'document'},
          {title: 'Artifact', value: 'artifact'},
          {title: 'Furniture / Mechanism', value: 'furniture'},
          {title: 'Evidence', value: 'evidence'},
          {title: 'Terminal / Electronic', value: 'terminal'},
          {title: 'Wall Section / Cavity', value: 'wall'},
        ],
      },
    }),
    defineField({
      name: 'currentLocation',
      title: 'Current Room Location',
      type: 'reference',
      to: [{type: 'room'}],
    }),
    defineField({
      name: 'originEra',
      title: 'Origin Era',
      type: 'reference',
      to: [{type: 'era'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'state',
      title: 'Current State',
      type: 'string',
      options: {
        list: [
          {title: 'Hidden', value: 'hidden'},
          {title: 'Visible', value: 'visible'},
          {title: 'Discovered', value: 'discovered'},
          {title: 'Moved', value: 'moved'},
          {title: 'Destroyed', value: 'destroyed'},
          {title: 'Buried', value: 'buried'},
        ],
      },
      initialValue: 'visible',
    }),
    defineField({
      name: 'interactable',
      title: 'Interactable by Players',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'position',
      title: 'Room Position Coordinates (%)',
      type: 'object',
      description: 'Coordinates relative to the room canvas (0 to 100%)',
      fields: [
        defineField({name: 'x', title: 'X (%)', type: 'number', initialValue: 50}),
        defineField({name: 'y', title: 'Y (%)', type: 'number', initialValue: 50}),
        defineField({name: 'z', title: 'Z-layer', type: 'number', initialValue: 1}),
      ],
    }),
    defineField({
      name: 'icon',
      title: 'Visual Icon / Sprite Key',
      type: 'string',
      description: 'e.g. "key", "clock", "scroll", "terminal", "safe", "tape", "laser"',
    }),
    defineField({
      name: 'affectsCausality',
      title: 'Affects Causality',
      type: 'boolean',
      description: 'Can actions on this object trigger causality propagation into later eras?',
      initialValue: false,
    }),
    defineField({
      name: 'causalRules',
      title: 'Causal Transformation Notes',
      type: 'text',
      description: 'Explanation of how altering this object shifts downstream eras',
    }),
    defineField({
      name: 'properties',
      title: 'Properties & Metadata',
      type: 'array',
      description: 'Key/value attributes (e.g. material, code, resonance)',
      of: [
        {
          type: 'object',
          name: 'property',
          fields: [
            defineField({name: 'key', title: 'Key', type: 'string'}),
            defineField({name: 'value', title: 'Value', type: 'string'}),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'objectType'},
  },
})
