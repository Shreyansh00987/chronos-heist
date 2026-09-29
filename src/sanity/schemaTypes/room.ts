import {defineField, defineType} from 'sanity'

export const room = defineType({
  name: 'room',
  title: 'Room',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Room Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug Identifier',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'era',
      title: 'Era',
      type: 'reference',
      to: [{type: 'era'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'linkedRooms',
      title: 'Linked Rooms (Other Eras)',
      description:
        'The same physical space in a different era. The causality engine follows these references to find which rooms to update.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'room'}]}],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'historicalNotes',
      title: 'Historical Archive Notes',
      type: 'text',
      description: 'Temporal surveyor notes on this era’s structural history',
    }),
    defineField({
      name: 'visualConfig',
      title: 'Visual Configuration',
      type: 'object',
      description: 'Settings for how this room renders',
      fields: [
        defineField({name: 'environmentPreset', title: 'Environment Preset', type: 'string'}),
        defineField({
          name: 'ambientColor',
          title: 'Ambient Color',
          type: 'string',
          description: 'Hex color',
        }),
        defineField({
          name: 'accentColor',
          title: 'Accent Glow Color',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'objects',
      title: 'Objects in this Room',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'gameObject'}]}],
    }),
    defineField({
      name: 'structuralState',
      title: 'Structural State',
      type: 'string',
      options: {
        list: [
          {title: 'Intact', value: 'intact'},
          {title: 'Damaged / Altered', value: 'damaged'},
          {title: 'Renovated / Reconstructed', value: 'reconstructed'},
          {title: 'Temporal Fissure Present', value: 'fissure'},
        ],
      },
      initialValue: 'intact',
    }),
    defineField({
      name: 'hiddenCompartments',
      title: 'Hidden Compartments & Cavities',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'hiddenCompartment',
          fields: [
            defineField({name: 'label', title: 'Compartment Label', type: 'string'}),
            defineField({
              name: 'revealed',
              title: 'Revealed / Unlocked',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'contentsDescription',
              title: 'Contents Description',
              type: 'string',
            }),
            defineField({
              name: 'triggeredBy',
              title: 'Triggered By Temporal Action',
              type: 'reference',
              to: [{type: 'temporalAction'}],
            }),
            defineField({
              name: 'position',
              title: 'Compartment Location (X, Y %)',
              type: 'object',
              fields: [
                defineField({name: 'x', title: 'X (%)', type: 'number'}),
                defineField({name: 'y', title: 'Y (%)', type: 'number'}),
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'temporalPreview',
      title: 'Temporal Surveillance Preview (GIF/Frames)',
      type: 'object',
      description: 'Generated surveillance animation showing the room across timeline changes',
      fields: [
        defineField({name: 'previewUrl', title: 'Preview Media URL', type: 'url'}),
        defineField({name: 'status', title: 'Render Status', type: 'string'}),
        defineField({name: 'renderedAt', title: 'Rendered At', type: 'datetime'}),
        defineField({name: 'rendererProvider', title: 'Renderer Provider', type: 'string'}),
      ],
    }),
    defineField({
      name: 'timelineState',
      title: 'Causality State Reference',
      type: 'reference',
      to: [{type: 'timelineState'}],
      description: "Which timeline state document tracks this room's current causality health",
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'era.name'},
  },
})
