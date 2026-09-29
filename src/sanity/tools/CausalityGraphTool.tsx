'use client'

import React, {useEffect, useRef, useState} from 'react'
import * as d3 from 'd3'
import {useClient} from 'sanity'

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

export function CausalityGraphTool() {
  const client = useClient({apiVersion: '2024-01-01'})
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [filterEra, setFilterEra] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [graphData, setGraphData] = useState<{nodes: NodeData[]; links: LinkData[]}>({
    nodes: [],
    links: [],
  })
  const [loading, setLoading] = useState(true)

  const loadGraph = async () => {
    setLoading(true)
    try {
      const [actions, rooms, objects, links, paradoxes, transitions] = await Promise.all([
        client.fetch(
          `*[_type == "temporalAction"]{_id, description, actionType, causalityStatus, sourceEra->{name, year}, targetObject->{name}}`,
        ),
        client.fetch(
          `*[_type == "room"]{_id, name, structuralState, era->{name, year}, linkedRooms[]->{_id, era->{year}}}`,
        ),
        client.fetch(
          `*[_type == "gameObject"]{_id, name, objectType, state, originEra->{year}, currentLocation->{name}}`,
        ),
        client.fetch(
          `*[_type == "causalityLink"]{_id, relationshipType, strength, explanation, sourceEra->{year}, targetEra->{year}}`,
        ),
        client.fetch(`*[_type == "paradox"]{_id, title, severity, resolutionStatus}`),
        client.fetch(
          `*[_type == "workflowTransition"]{_id, transitionState, agentAnalysis, sourceAction->{description}}`,
        ),
      ])

      const nodes: NodeData[] = []
      const linksData: LinkData[] = []

      // Add rooms
      rooms.forEach((r: any) => {
        const year = r.era?.year ? String(r.era.year) : 'Unknown'
        const color = year === '1920' ? '#d97706' : year === '1970' ? '#06b6d4' : '#a855f7'
        nodes.push({
          id: r._id,
          label: `${r.name} (${year})`,
          type: 'room',
          era: year,
          color,
          status: r.structuralState,
          details: r,
        })

        // Inter-room temporal links
        if (r.linkedRooms && Array.isArray(r.linkedRooms)) {
          r.linkedRooms.forEach((lr: any) => {
            if (lr?._id) {
              linksData.push({
                source: r._id,
                target: lr._id,
                label: 'cross-era continuity',
                relationshipType: 'continuity',
              })
            }
          })
        }
      })

      // Add key objects
      objects.forEach((obj: any) => {
        const year = obj.originEra?.year ? String(obj.originEra.year) : 'Unknown'
        nodes.push({
          id: obj._id,
          label: obj.name,
          type: 'object',
          era: year,
          color: '#10b981',
          status: obj.state,
          details: obj,
        })
      })

      // Add actions
      actions.forEach((act: any) => {
        const year = act.sourceEra?.year ? String(act.sourceEra.year) : 'Unknown'
        nodes.push({
          id: act._id,
          label: act.description || 'Temporal Action',
          type: 'action',
          era: year,
          color: '#ef4444',
          status: act.causalityStatus,
          details: act,
        })

        // Link action to room
        if (act.targetObject?._id) {
          linksData.push({
            source: act._id,
            target: act.targetObject._id,
            label: 'targets',
            relationshipType: 'mutation',
          })
        }
      })

      // Add paradoxes
      paradoxes.forEach((p: any) => {
        nodes.push({
          id: p._id,
          label: p.title,
          type: 'paradox',
          color: '#f59e0b',
          status: p.resolutionStatus,
          details: p,
        })
      })

      // Add workflow transitions
      transitions.forEach((t: any) => {
        nodes.push({
          id: t._id,
          label: `Stage: ${t.transitionState}`,
          type: 'transition',
          color: '#3b82f6',
          status: t.transitionState,
          details: t,
        })
      })

      // Link 1920 Brass Key action to 2026 Vault if exists
      const brassAction = actions.find((a: any) => a.description?.toLowerCase().includes('key'))
      const vault2026 = rooms.find((r: any) => r.era?.year === 2026)
      if (brassAction && vault2026) {
        linksData.push({
          source: brassAction._id,
          target: vault2026._id,
          label: 'CAUSAL PROPAGATION',
          relationshipType: 'reveals',
        })
      }

      setGraphData({nodes, links: linksData})
    } catch (err) {
      console.error('Error loading causality graph data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGraph()
  }, [])

  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return

    const width = 800
    const height = 540

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Filter nodes
    const filteredNodes = graphData.nodes.filter((n) => {
      const matchesEra = filterEra === 'all' || n.era === filterEra || !n.era
      const matchesType = filterType === 'all' || n.type === filterType
      return matchesEra && matchesType
    })

    const nodeIds = new Set(filteredNodes.map((n) => n.id))
    const filteredLinks = graphData.links.filter((l) => {
      const sourceId = typeof l.source === 'object' ? (l.source as NodeData).id : l.source
      const targetId = typeof l.target === 'object' ? (l.target as NodeData).id : l.target
      return nodeIds.has(sourceId) && nodeIds.has(targetId)
    })

    // Container with zoom
    const container = svg.append('g')
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Arrow markers
    svg
      .append('defs')
      .selectAll('marker')
      .data(['causal-arrow'])
      .enter()
      .append('marker')
      .attr('id', (d) => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
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
          .distance(120),
      )
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    // Draw Links
    const link = container
      .append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) => (d.relationshipType === 'reveals' ? '#a855f7' : '#4b5563'))
      .attr('stroke-width', (d) => (d.relationshipType === 'reveals' ? 3 : 1.5))
      .attr('stroke-dasharray', (d) => (d.relationshipType === 'reveals' ? '5,5' : 'none'))
      .attr('marker-end', 'url(#causal-arrow)')

    // Draw Nodes
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

    // Node circles
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'room' ? 18 : d.type === 'action' ? 15 : 12))
      .attr('fill', (d) => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))')

    // Node labels
    node
      .append('text')
      .text((d) => (d.label.length > 20 ? d.label.slice(0, 18) + '...' : d.label))
      .attr('x', 20)
      .attr('y', 5)
      .attr('fill', '#e5e7eb')
      .attr('font-size', '11px')
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
  }, [graphData, filterEra, filterType])

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0f', color: '#e5e7eb', padding: '1.5rem', fontFamily: 'system-ui, sans-serif'}}>
      {/* Header & Controls */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #1f2937', paddingBottom: '1rem'}}>
        <div>
          <h2 style={{margin: 0, fontSize: '1.5rem', color: '#a855f7', letterSpacing: '0.05em', fontFamily: 'monospace'}}>
            // CAUSALITY_GRAPH_ENGINE_v2.4
          </h2>
          <p style={{margin: '0.25rem 0 0 0', color: '#9ca3af', fontSize: '0.875rem'}}>
            Multi-era dependency network powered by live Sanity GROQ queries
          </p>
        </div>
        <div style={{display: 'flex', gap: '0.75rem'}}>
          <select
            value={filterEra}
            onChange={(e) => setFilterEra(e.target.value)}
            style={{background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '4px', padding: '0.5rem 0.75rem', fontSize: '0.85rem'}}
          >
            <option value="all">All Eras (1920/1970/2026)</option>
            <option value="1920">1920 (Origin)</option>
            <option value="1970">1970 (Echo)</option>
            <option value="2026">2026 (Consequence)</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '4px', padding: '0.5rem 0.75rem', fontSize: '0.85rem'}}
          >
            <option value="all">All Document Types</option>
            <option value="room">Rooms</option>
            <option value="object">Game Objects</option>
            <option value="action">Temporal Actions</option>
            <option value="paradox">Paradoxes</option>
            <option value="transition">Workflow States</option>
          </select>
          <button
            onClick={loadGraph}
            style={{background: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'}}
          >
            Sync Live
          </button>
        </div>
      </div>

      {/* Main Graph & Inspector Split */}
      <div style={{display: 'flex', flex: 1, gap: '1.5rem', minHeight: '540px'}}>
        <div style={{flex: 3, background: '#050508', border: '1px solid #1f2937', borderRadius: '8px', overflow: 'hidden', position: 'relative'}}>
          {loading && (
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', zIndex: 10}}>
              <span style={{color: '#a855f7', fontFamily: 'monospace'}}>Synthesizing Causal Topology...</span>
            </div>
          )}
          <svg ref={svgRef} style={{width: '100%', height: '100%', minHeight: '540px'}} />
          <div style={{position: 'absolute', bottom: '12px', left: '12px', fontSize: '11px', color: '#6b7280', fontFamily: 'monospace'}}>
            Zoom: Scroll | Pan: Drag Canvas | Inspect: Click Node
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div style={{flex: 1.2, background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', padding: '1.25rem', overflowY: 'auto'}}>
          <h3 style={{margin: '0 0 1rem 0', fontSize: '1rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #374151', paddingBottom: '0.5rem'}}>
            Node Inspector
          </h3>
          {selectedNode ? (
            <div>
              <div style={{display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', background: selectedNode.color, color: '#000', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.5rem'}}>
                {selectedNode.type.toUpperCase()}
              </div>
              <h4 style={{margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#ffffff'}}>{selectedNode.label}</h4>
              <p style={{margin: '0 0 0.5rem 0', color: '#9ca3af', fontSize: '0.85rem'}}>
                Era: <strong>{selectedNode.era || 'Universal'}</strong>
              </p>
              {selectedNode.status && (
                <p style={{margin: '0 0 0.75rem 0', color: '#9ca3af', fontSize: '0.85rem'}}>
                  Status: <strong>{selectedNode.status}</strong>
                </p>
              )}
              <div style={{marginTop: '1rem', borderTop: '1px solid #374151', paddingTop: '0.75rem'}}>
                <span style={{fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase'}}>Raw Document Payload</span>
                <pre style={{marginTop: '0.5rem', background: '#030712', padding: '0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: '#10b981', overflowX: 'auto', maxHeight: '300px'}}>
                  {JSON.stringify(selectedNode.details, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p style={{color: '#6b7280', fontSize: '0.85rem', fontStyle: 'italic'}}>
              Click any node in the graph to inspect its Sanity document state and causal links.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
