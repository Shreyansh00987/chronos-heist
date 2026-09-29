'use client'

/**
 * Sanity Studio Configuration for Chronos-Heist
 * Includes Custom Operations Structure, D3 Causality Graph Tool, and Temporal Preview Renderer Tool
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {CausalityGraphTool} from './src/sanity/tools/CausalityGraphTool'
import {TemporalPreviewTool} from './src/sanity/tools/TemporalPreviewTool'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
  tools: (prev) => [
    ...prev,
    {
      name: 'causality-graph',
      title: 'Causality Graph',
      component: CausalityGraphTool,
    },
    {
      name: 'temporal-preview',
      title: 'Temporal Preview',
      component: TemporalPreviewTool,
    },
  ],
})
