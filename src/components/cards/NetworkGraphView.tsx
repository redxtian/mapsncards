'use client'

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCcw, Search, Filter, Maximize2, ExternalLink } from "lucide-react";
import ForceGraph2D from "react-force-graph-2d";
import { CardItem } from "@/lib/firebase";

interface GraphNode {
  id: string;
  name: string;
  card: CardItem;
  tier: string;
  leverage: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  color?: string;
  size?: number;
  level: number; // Distance from root node
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'reference';
  color?: string;
  width?: number;
}

interface NetworkGraphViewProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardItem[];
  centerCardId?: string;
  onCardSelect?: (card: CardItem) => void;
  maxDepth?: number;
}

export function NetworkGraphView({
  isOpen,
  onClose,
  cards,
  centerCardId,
  onCardSelect,
  maxDepth = 3
}: NetworkGraphViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(centerCardId || null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightEdges, setHighlightEdges] = useState(new Set<string>());
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStartPositions, setDragStartPositions] = useState<Map<string, {x: number, y: number}>>(new Map());
  const graphRef = useRef<any>(null);

  // Color scheme for tiers
  const tierColors: Record<string, string> = {
    'L1': '#22c55e', // green
    'L2': '#3b82f6', // blue  
    'L3': '#8b5cf6', // purple
    'L4': '#f59e0b', // amber
    'L5': '#ef4444'  // red
  };

  // Build graph data from cards
  const graphData = useMemo(() => {
    if (!cards.length || !centerCardId) return { nodes: [], links: [] };

    const cardMap = new Map<string, CardItem>();
    cards.forEach(card => cardMap.set(card.id, card));

    // Extract all references
    const references = new Map<string, string[]>();
    cards.forEach(card => {
      const refs: string[] = [];
      card.steps?.forEach(step => {
        const matches = step.match(/`([^`]+)`/g);
        if (matches) {
          matches.forEach(match => {
            const refId = match.slice(1, -1);
            if (cardMap.has(refId)) {
              refs.push(refId);
            }
          });
        }
      });
      references.set(card.id, refs);
    });

    // Build graph using BFS from center card
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const visited = new Set<string>();
    const queue: Array<{ id: string; level: number }> = [{ id: centerCardId, level: 0 }];

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      
      if (visited.has(id) || level > maxDepth) continue;
      visited.add(id);

      const card = cardMap.get(id);
      if (!card) continue;

      // Add node
      const connectionCount = (references.get(id) || []).length + 
        Array.from(references.entries()).filter(([_, refs]) => refs.includes(id)).length;
      
      nodes.push({
        id,
        name: card.name,
        card,
        tier: card.tier,
        leverage: card.leverage,
        color: tierColors[card.tier] || '#6b7280',
        size: Math.max(12, Math.min(25, 12 + connectionCount * 2)),
        level
      });

      // Add edges for references (outgoing)
      const cardRefs = references.get(id) || [];
      cardRefs.forEach(refId => {
        if (cardMap.has(refId)) {
          edges.push({
            source: id,
            target: refId,
            type: 'reference',
            color: '#94a3b8',
            width: 2
          });
          
          // Add referenced card to queue
          queue.push({ id: refId, level: level + 1 });
        }
      });

      // Add edges for reverse references (incoming)
      Array.from(references.entries()).forEach(([cardId, refs]) => {
        if (refs.includes(id) && !visited.has(cardId)) {
          const referencingCard = cardMap.get(cardId);
          if (referencingCard) {
            queue.push({ id: cardId, level: level + 1 });
          }
        }
      });
    }

    return { nodes, links: edges };
  }, [cards, centerCardId, maxDepth]);

  // Filter nodes based on search
  const filteredGraphData = useMemo(() => {
    if (!searchQuery.trim()) return graphData;

    const query = searchQuery.toLowerCase();
    const filteredNodes = graphData.nodes.filter(node => 
      node.name.toLowerCase().includes(query) ||
      node.leverage.toLowerCase().includes(query) ||
      node.tier.toLowerCase().includes(query)
    );
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link => 
      nodeIds.has(link.source as string) && nodeIds.has(link.target as string)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchQuery]);

  // Handle node hover
  const handleNodeHover = (node: GraphNode | null) => {
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightEdges(new Set());
      return;
    }

    const highlightNodesSet = new Set<string>([node.id]);
    const highlightEdgesSet = new Set<string>();

    // Highlight connected nodes and edges
    filteredGraphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === node.id || targetId === node.id) {
        highlightNodesSet.add(sourceId);
        highlightNodesSet.add(targetId);
        highlightEdgesSet.add(`${sourceId}-${targetId}`);
      }
    });

    setHighlightNodes(highlightNodesSet);
    setHighlightEdges(highlightEdgesSet);
  };

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    onCardSelect?.(node.card);
    
    // Center the graph on clicked node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
    }
  };

  // Graph controls
  const zoomIn = () => graphRef.current?.zoom(1.5, 400);
  const zoomOut = () => graphRef.current?.zoom(0.75, 400);
  const resetView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  // Center on initial card when opened
  useEffect(() => {
    if (isOpen && centerCardId && graphRef.current) {
      setTimeout(() => {
        const centerNode = filteredGraphData.nodes.find(n => n.id === centerCardId);
        if (centerNode) {
          graphRef.current.centerAt(centerNode.x, centerNode.y, 1000);
        } else {
          graphRef.current.zoomToFit(400, 50);
        }
      }, 100);
    }
  }, [isOpen, centerCardId, filteredGraphData.nodes]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-white/95 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl w-full max-w-6xl h-5/6 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glass shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-gray-900">Card Network Graph</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  {filteredGraphData.nodes.length} cards
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  {filteredGraphData.links.length} connections
                </span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={zoomIn}
                className="p-2 rounded-full hover:bg-gray-100/80 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={zoomOut}
                className="p-2 rounded-full hover:bg-gray-100/80 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={resetView}
                className="p-2 rounded-full hover:bg-gray-100/80 transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100/80 transition-colors ml-2"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards in graph..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/60 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 py-2 border-b border-white/10 bg-gray-50/50">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="font-medium">Tiers:</span>
              {Object.entries(tierColors).map(([tier, color]) => (
                <div key={tier} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span>{tier}</span>
                </div>
              ))}
              <span className="ml-4 text-gray-500">• Node size = connection count • Click nodes to navigate • Hover to highlight • Drag nodes to stretch (keeps 50% distance)</span>
            </div>
          </div>

          {/* Graph Container */}
          <div className="flex-1 relative">
            <ForceGraph2D
              ref={graphRef}
              graphData={filteredGraphData}
              width={undefined}
              height={undefined}
              backgroundColor="rgba(255, 255, 255, 0)"
              
              // Node appearance
              nodeLabel={(node: any) => `
                <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px; max-width: 200px;">
                  <strong>${node.name}</strong><br/>
                  <span style="color: #ccc;">Tier: ${node.tier} | ${node.leverage}</span>
                </div>
              `}
              nodeCanvasObject={(node: any, ctx: any) => {
                const isHighlighted = highlightNodes.has(node.id);
                const isSelected = selectedNodeId === node.id;
                const isDragged = draggedNodeId === node.id;
                
                // Adjust node size and opacity for dragging
                const nodeSize = isDragged ? node.size * 1.2 : node.size;
                const opacity = isDragged ? 1.0 : (isHighlighted ? 1.0 : 0.85);
                
                // Node circle with glow effect when dragged
                if (isDragged) {
                  // Glow effect
                  ctx.shadowColor = node.color;
                  ctx.shadowBlur = 15;
                  ctx.shadowOffsetX = 0;
                  ctx.shadowOffsetY = 0;
                }
                
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
                
                // Set fill color with opacity
                const baseColor = isSelected ? '#1d4ed8' : node.color;
                ctx.fillStyle = isDragged ? baseColor : 
                               isSelected ? '#1d4ed8' : 
                               (isHighlighted ? node.color : `${node.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
                ctx.fill();
                
                // Reset shadow
                ctx.shadowBlur = 0;
                
                // Border for selected/highlighted/dragged
                if (isSelected || isHighlighted || isDragged) {
                  ctx.strokeStyle = isDragged ? '#059669' : (isSelected ? '#1d4ed8' : node.color);
                  ctx.lineWidth = isDragged ? 4 : (isSelected ? 3 : 2);
                  ctx.stroke();
                }
                
                // Text label with background for better readability
                const fontSize = Math.max(10, node.size * 0.7);
                const text = node.name.length > 12 ? node.name.substring(0, 12) + '...' : node.name;
                const textY = node.y + node.size + fontSize + 4;
                
                // Measure text for background
                ctx.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const padding = 4;
                
                // Draw text background
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(
                  node.x - textWidth / 2 - padding, 
                  textY - fontSize / 2 - padding / 2,
                  textWidth + padding * 2,
                  fontSize + padding
                );
                
                // Draw text border
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                  node.x - textWidth / 2 - padding, 
                  textY - fontSize / 2 - padding / 2,
                  textWidth + padding * 2,
                  fontSize + padding
                );
                
                // Draw text
                ctx.fillStyle = '#1f2937';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, node.x, textY);
              }}
              
              // Link appearance  
              linkCanvasObject={(link: any, ctx: any) => {
                const isHighlighted = highlightEdges.has(`${link.source.id}-${link.target.id}`);
                
                ctx.strokeStyle = isHighlighted ? '#374151' : '#94a3b8';
                ctx.lineWidth = isHighlighted ? 2 : 1;
                ctx.globalAlpha = isHighlighted ? 1 : 0.6;
                
                ctx.beginPath();
                ctx.moveTo(link.source.x, link.source.y);
                ctx.lineTo(link.target.x, link.target.y);
                ctx.stroke();
                ctx.globalAlpha = 1;
                
                // Arrow head for direction
                if (isHighlighted) {
                  const arrowLength = 8;
                  const arrowAngle = Math.PI / 6;
                  
                  const angle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
                  const targetX = link.target.x - Math.cos(angle) * (link.target.size + 2);
                  const targetY = link.target.y - Math.sin(angle) * (link.target.size + 2);
                  
                  ctx.beginPath();
                  ctx.moveTo(targetX, targetY);
                  ctx.lineTo(
                    targetX - arrowLength * Math.cos(angle - arrowAngle),
                    targetY - arrowLength * Math.sin(angle - arrowAngle)
                  );
                  ctx.moveTo(targetX, targetY);
                  ctx.lineTo(
                    targetX - arrowLength * Math.cos(angle + arrowAngle),
                    targetY - arrowLength * Math.sin(angle + arrowAngle)
                  );
                  ctx.stroke();
                }
              }}
              
              // Interactions
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              onNodeDragStart={(node: any) => {
                setDraggedNodeId(node.id);
                // Store original positions of connected nodes
                const startPositions = new Map();
                
                // Find all connected nodes
                const connectedNodes = new Set<string>();
                filteredGraphData.links.forEach(link => {
                  const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                  const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                  
                  if (sourceId === node.id) {
                    connectedNodes.add(targetId);
                  } else if (targetId === node.id) {
                    connectedNodes.add(sourceId);
                  }
                });
                
                // Store positions of connected nodes
                filteredGraphData.nodes.forEach(n => {
                  if (connectedNodes.has(n.id)) {
                    startPositions.set(n.id, { x: n.x, y: n.y });
                  }
                });
                
                // Also store the dragged node's original position
                startPositions.set(node.id, { x: node.x, y: node.y });
                setDragStartPositions(startPositions);
              }}
              onNodeDrag={(node: any) => {
                // Fix the node position during drag to prevent it from snapping back
                node.fx = node.x;
                node.fy = node.y;
              }}
              onNodeDragEnd={(node: any) => {
                setDraggedNodeId(null);
                
                // Calculate 50% of the stretched distance and apply it
                const originalPos = dragStartPositions.get(node.id);
                if (originalPos && graphRef.current) {
                  // Calculate the total displacement
                  const totalDx = node.x - originalPos.x;
                  const totalDy = node.y - originalPos.y;
                  
                  // Set final position to 50% of the stretch
                  const finalX = originalPos.x + (totalDx * 0.5);
                  const finalY = originalPos.y + (totalDy * 0.5);
                  
                  // Apply the 50% position after a short delay
                  setTimeout(() => {
                    node.fx = finalX;
                    node.fy = finalY;
                    
                    // Then release after allowing the network to settle
                    setTimeout(() => {
                      node.fx = undefined;
                      node.fy = undefined;
                    }, 1500);
                  }, 200);
                } else {
                  // Fallback to original behavior
                  setTimeout(() => {
                    node.fx = undefined;
                    node.fy = undefined;
                  }, 2000);
                }
                
                // Clear stored positions
                setDragStartPositions(new Map());
              }}
              
              // Physics
              d3Force={{
                charge: -800,  // Stronger repulsion between nodes
                link: 150,     // Longer link distance
                collision: 50, // Larger collision detection
                center: 0.1,   // Weaker centering force
                x: 0.05,       // Weak horizontal positioning
                y: 0.05        // Weak vertical positioning
              }}
              cooldownTicks={300}
              warmupTicks={100}
              d3VelocityDecay={0.3}
              enablePanInteraction={true}
              enableZoomInteraction={true}
            />
          </div>

          {/* Selected card info */}
          <AnimatePresence>
            {selectedNodeId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-4 max-w-xs shadow-lg"
              >
                {(() => {
                  const selectedNode = filteredGraphData.nodes.find(n => n.id === selectedNodeId);
                  if (!selectedNode) return null;
                  
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${selectedNode.tier === 'L1' ? 'bg-green-100 text-green-700' :
                              selectedNode.tier === 'L2' ? 'bg-blue-100 text-blue-700' :
                              selectedNode.tier === 'L3' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'}`}>
                            {selectedNode.tier}
                          </span>
                          <span className="text-xs text-gray-600">{selectedNode.leverage}</span>
                        </div>
                        <button
                          onClick={() => onCardSelect?.(selectedNode.card)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          title="View full card details"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Full
                        </button>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{selectedNode.name}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{selectedNode.card.summary}</p>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Click "View Full" to see complete card details and references
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}