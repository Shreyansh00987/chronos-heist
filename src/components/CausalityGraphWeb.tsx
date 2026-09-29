'use client'

import React, {useEffect, useRef, useState} from 'react'
import * as d3 from 'd3'

interface NodeData extends d3.SimulationNodeDatum {
  id: string
  label: string
  type: 'action' | 'room' | 'object' | 'paradox' | 'transition'
  era?: string
  status?: string
  color: string
  details?: Record<string, unknown>
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData
  target: string | NodeData
  label?: string
  relationshipType?: string
}

export function CausalityGraphWeb({initialData}: {initialData: {nodes: NodeData[]; links: LinkData[]}}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [filterEra, setFilterEra] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    if (!svgRef.current || !initialData.nodes.length) return

    const width = 860
    const height = 560

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Filter nodes
    const filteredNodes = initialData.nodes.filter((n) => {
      const matchesEra = filterEra === 'all' || n.era === filterEra || !n.era
      const matchesType = filterType === 'all' || n.type === filterType
      return matchesEra && matchesType
    })

    const nodeIds = new Set(filteredNodes.map((n) => n.id))
    const filteredLinks = initialData.links.filter((l) => {
      const sourceId = typeof l.source === 'object' ? (l.source as NodeData).id : l.source
      const targetId = typeof l.target === 'object' ? (l.target as NodeData).id : l.target
      return nodeIds.has(sourceId) && nodeIds.has(targetId)
    })

    const container = svg.append('g')
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Markers
    svg
      .append('defs')
      .selectAll('marker')
      .data(['arrow-causality'])
      .enter()
      .append('marker')
      .attr('id', (d) => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#a855f7')

    // Simulation
    const simulation = d3
      .forceSimulation<NodeData>(filteredNodes)
      .force(
        'link',
        d3
          .forceLink<NodeData, LinkData>(filteredLinks)
          .id((d) => d.id)
          .distance(130),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(45))

    // Links
    const link = container
      .append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) => (d.relationshipType === 'reveals' ? '#a855f7' : '#334155'))
      .attr('stroke-width', (d) => (d.relationshipType === 'reveals' ? 3 : 1.5))
      .attr('stroke-dasharray', (d) => (d.relationshipType === 'reveals' ? '5,5' : 'none'))
      .attr('marker-end', 'url(#arrow-causality)')

    // Nodes
    const node = container
      .append('g')
      .selectAll('g')
      .data(filteredNodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (_, d) => setSelectedNode(d))
      .call(
        d3
          .drag<SVGGElement, NodeData>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          }),
      )

    node
      .append('circle')
      .attr('r', (d) => (d.type === 'room' ? 20 : d.type === 'action' ? 16 : 14))
      .attr('fill', (d) => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))')

    node
      .append('text')
      .text((d) => (d.label.length > 22 ? d.label.slice(0, 20) + '...' : d.label))
      .attr('x', 24)
      .attr('y', 5)
      .attr('fill', '#f1f5f9')
      .attr('font-size', '12px')
      .attr('font-family', 'monospace')
      .attr('pointer-events', 'none')

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [initialData, filterEra, filterType])

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
      {/* Filters */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d131f', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.85rem 1.25rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <span style={{color: '#a855f7', fontWeight: 'bold', fontFamily: 'monospace'}}>// FILTER_CONTROLS</span>
          <span style={{fontSize: '0.8rem', color: '#94a3b8', marginLeft: '0.75rem'}}>
            Showing {initialData.nodes.length} nodes &amp; {initialData.links.length} causal edges
          </span>
        </div>
        <div style={{display: 'flex', gap: '0.75rem'}}>
          <select
            value={filterEra}
            onChange={(e) => setFilterEra(e.target.value)}
            style={{background: '#070a10', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '4px', padding: '0.45rem 0.75rem', fontSize: '0.85rem', fontFamily: 'monospace'}}
          >
            <option value="all">All Eras (1920/1970/2026)</option>
            <option value="1920">1920 (Origin)</option>
            <option value="1970">1970 (Echo)</option>
            <option value="2026">2026 (Consequence)</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{background: '#070a10', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '4px', padding: '0.45rem 0.75rem', fontSize: '0.85rem', fontFamily: 'monospace'}}
          >
            <option value="all">All Document Types</option>
            <option value="room">Rooms</option>
            <option value="object">Game Objects</option>
            <option value="action">Temporal Actions</option>
            <option value="paradox">Paradoxes</option>
            <option value="transition">Workflow Transitions</option>
          </select>
        </div>
      </div>

      {/* Main Canvas & Inspector */}
      <div style={{display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.25rem'}}>
        <div style={{background: '#040711', border: '1px solid #1e293b', borderRadius: '10px', overflow: 'hidden', position: 'relative', minHeight: '560px'}}>
          <svg ref={svgRef} style={{width: '100%', height: '100%', minHeight: '560px'}} />
          <div style={{position: 'absolute', bottom: '12px', left: '15px', color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace'}}>
            Zoom: Scroll | Pan: Drag Canvas | Inspect: Click Node | Reposition: Drag Node
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div style={{background: '#0d131f', border: '1px solid #1e293b', borderRadius: '10px', padding: '1.25rem', overflowY: 'auto', maxHeight: '560px'}}>
          <div style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem', marginBottom: '0.75rem'}}>
            // LIVE_DOCUMENT_INSPECTOR
          </div>

          {selectedNode ? (
            <div>
              <div style={{display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', background: selectedNode.color, color: '#000', fontWeight: 'bold', fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '0.5rem'}}>
                {selectedNode.type.toUpperCase()}
              </div>
              <h3 style={{margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.15rem'}}>{selectedNode.label}</h3>
              <p style={{margin: '0 0 0.4rem 0', color: '#94a3b8', fontSize: '0.85rem'}}>
                Era: <strong>{selectedNode.era || 'Universal / All'}</strong>
              </p>
              {selectedNode.status && (
                <p style={{margin: '0 0 0.75rem 0', color: '#94a3b8', fontSize: '0.85rem'}}>
                  Status: <strong>{selectedNode.status}</strong>
                </p>
              )}
              <div style={{marginTop: '1rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem'}}>
                <span style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace'}}>
                  Authoritative Sanity Document Payload
                </span>
                <pre style={{marginTop: '0.5rem', background: '#02050b', padding: '0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: '#34d399', overflowX: 'auto', maxHeight: '300px', whiteSpace: 'pre-wrap'}}>
                  {JSON.stringify(selectedNode.details, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem 0'}}>
              Click any node in the interactive D3 graph to inspect its underlying Sanity document and live attributes.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
