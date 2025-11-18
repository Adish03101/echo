import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Node, Category } from '../types';

interface TreeViewProps {
  nodes: Node[];
  onDelete: (id: string) => void;
}

// Layout constants for the SVG graph
const NODE_WIDTH = 180;
const NODE_HEIGHT = 70;
const PHASE_GAP = 120;
const NODE_VERTICAL_GAP = 30;
const PADDING = 100; // Padding around the graph for dragging space

const categoryColors: { [key in Category]: { bg: string; text: string; } } = {
  [Category.Strategy]: { bg: '#dbeafe', text: '#1e40af' },
  [Category.Creation]: { bg: '#d1fae5', text: '#065f46' },
  [Category.Score]: { bg: '#fef9c3', text: '#854d0e' },
};

const TreeView: React.FC<TreeViewProps> = ({ nodes, onDelete }) => {
  const [draggedPositions, setDraggedPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [draggingInfo, setDraggingInfo] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const nodesByPhase = useMemo(() => {
    const grouped: { [key: number]: Node[] } = {};
    nodes.forEach(node => {
      if (!grouped[node.phase]) {
        grouped[node.phase] = [];
      }
      grouped[node.phase].push(node);
    });
    return grouped;
  }, [nodes]);

  const sortedPhases = useMemo(() => {
    return Object.keys(nodesByPhase).map(Number).sort((a, b) => a - b);
  }, [nodesByPhase]);
  
  const { initialLayout, svgWidth, svgHeight } = useMemo(() => {
    const layout = new Map<string, { x: number; y: number }>();
    if (sortedPhases.length === 0) {
      return { initialLayout: layout, svgWidth: 0, svgHeight: 0 };
    }

    const maxNodesInPhase = Math.max(1, ...sortedPhases.map(p => nodesByPhase[p]?.length || 0));
    const calculatedSvgHeight = maxNodesInPhase * (NODE_HEIGHT + NODE_VERTICAL_GAP) + PADDING * 2;
    
    sortedPhases.forEach((phase, phaseIndex) => {
      const x = phaseIndex * (NODE_WIDTH + PHASE_GAP) + PHASE_GAP / 2 + PADDING;
      const phaseNodes = nodesByPhase[phase];
      const phaseHeight = phaseNodes.length * (NODE_HEIGHT + NODE_VERTICAL_GAP) - NODE_VERTICAL_GAP;
      const yOffset = (calculatedSvgHeight - phaseHeight) / 2;

      phaseNodes.forEach((node, nodeIndex) => {
        const y = yOffset + nodeIndex * (NODE_HEIGHT + NODE_VERTICAL_GAP);
        layout.set(node.id, { x, y });
      });
    });
    
    const calculatedSvgWidth = sortedPhases.length * (NODE_WIDTH + PHASE_GAP) - PHASE_GAP + PADDING * 2;

    return { initialLayout: layout, svgWidth: Math.max(600, calculatedSvgWidth), svgHeight: Math.max(400, calculatedSvgHeight) };
  }, [nodesByPhase, sortedPhases]);

  // When the node list changes, clear any manually dragged positions to reset the layout
  useEffect(() => {
    setDraggedPositions(new Map());
  }, [nodes]);

  const getPosition = (nodeId: string): { x: number; y: number } | undefined => {
    return draggedPositions.get(nodeId) || initialLayout.get(nodeId);
  };

  const handleMouseDown = (event: React.MouseEvent, nodeId: string) => {
    event.preventDefault();
    if (!svgRef.current) return;

    const pos = getPosition(nodeId);
    if (!pos) return;

    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    setDraggingInfo({
      id: nodeId,
      offsetX: svgPoint.x - pos.x,
      offsetY: svgPoint.y - pos.y,
    });
  };

  useEffect(() => {
    if (!draggingInfo) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!svgRef.current) return;
      event.preventDefault();

      const point = svgRef.current.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

      const newX = svgPoint.x - draggingInfo.offsetX;
      const newY = svgPoint.y - draggingInfo.offsetY;

      setDraggedPositions(prev => new Map(prev).set(draggingInfo.id, { x: newX, y: newY }));
    };

    const handleMouseUp = (event: MouseEvent) => {
      event.preventDefault();
      setDraggingInfo(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingInfo]);
  
  const nodesWithPositions = useMemo(() => {
    return nodes
      .map(node => ({
        node,
        pos: getPosition(node.id),
      }))
      .filter((item): item is { node: Node; pos: { x: number, y: number } } => !!item.pos);
  }, [nodes, initialLayout, draggedPositions]);


  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white/50 rounded-lg p-8 border-2 border-dashed border-slate-300">
        <div className="text-center text-slate-500">
          <p className="text-lg font-medium">No nodes yet!</p>
          <p>Use the form to add your first node and start building your tree.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Project Graph</h2>
      <div className="w-full overflow-auto border rounded-lg bg-slate-50">
        <svg ref={svgRef} width={svgWidth} height={svgHeight} className="font-sans">
          <defs>
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
            </marker>
          </defs>

          {/* Edges */}
          <g>
            {nodesWithPositions.map(({ node }) =>
              node.parentIds.map(parentId => {
                const parentPos = getPosition(parentId);
                const childPos = getPosition(node.id);

                if (!parentPos || !childPos) return null;

                const startX = parentPos.x + NODE_WIDTH;
                const startY = parentPos.y + NODE_HEIGHT / 2;
                const endX = childPos.x;
                const endY = childPos.y + NODE_HEIGHT / 2;
                
                const controlX1 = startX + (endX - startX) * 0.5;
                const controlX2 = endX - (endX - startX) * 0.5;

                const pathData = `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;

                return (
                  <path
                    key={`${parentId}-${node.id}`}
                    d={pathData}
                    stroke="#6366f1"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })
            )}
          </g>

          {/* Nodes */}
          <g>
            {nodesWithPositions.map(({ node, pos }) => (
              <g 
                key={node.id} 
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseDown={e => handleMouseDown(e, node.id)}
                className={`transition-transform duration-75 ${
                  draggingInfo?.id === node.id ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                <rect
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx="8"
                  fill="white"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  className={draggingInfo?.id === node.id ? 'stroke-indigo-500 shadow-xl' : ''}
                />
                <foreignObject x="0" y="0" width={NODE_WIDTH} height={NODE_HEIGHT}>
   <div className="p-2 flex flex-col justify-start h-full select-none relative">
      {/* ✅ DELETE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();  // Don't trigger drag when clicking button
          onDelete(node.id);     // Call the delete function
        }}
        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        title="Delete node"
      >
        ×
      </button>
      
      {/* Node Content */}
      <div className="font-semibold text-slate-800 text-sm break-words leading-tight">{node.name}</div>
      {node.categories && node.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {node.categories.map(cat => (
            <span key={cat} style={{ backgroundColor: categoryColors[cat].bg, color: categoryColors[cat].text }} className={`text-xs font-medium px-1.5 py-0.5 rounded-full self-start`}>
              {cat}
            </span>
          ))}
        </div>
       )}
   </div>
</foreignObject>
                <title>{`${node.name}${node.categories && node.categories.length > 0 ? ` [${node.categories.join(', ')}]` : ''}`}</title>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default TreeView;
