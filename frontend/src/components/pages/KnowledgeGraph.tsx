// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Upload, Plus, Package, Link, Target } from 'lucide-react';

interface KnowledgeGraphProps {
  selectedBrands?: string[];
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ selectedBrands = [] }) => {
  // Note: Knowledge Graph currently shows SweetNight data only. Multi-brand support coming soon.
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const svgRef = useRef(null);

  // Define graph data
  const graphData = {
    nodes: [
      { id: 'brand', label: 'SweetNight', type: 'Brand', x: 400, y: 200, color: '#3B82F6' },
      { id: 'product1', label: 'CoolNest Mattress', type: 'Product', x: 300, y: 350, color: '#8B5CF6' },
      { id: 'product2', label: 'Gel Pillow', type: 'Product', x: 500, y: 350, color: '#8B5CF6' },
      { id: 'feature1', label: 'Cooling Tech', type: 'Feature', x: 200, y: 500, color: '#10B981' },
      { id: 'feature2', label: 'Memory Foam', type: 'Feature', x: 350, y: 500, color: '#10B981' },
      { id: 'feature3', label: 'Gel-Infused', type: 'Feature', x: 550, y: 500, color: '#10B981' },
      { id: 'problem1', label: 'Night Sweats', type: 'Problem', x: 150, y: 650, color: '#EF4444' },
      { id: 'problem2', label: 'Hot Sleep', type: 'Problem', x: 400, y: 650, color: '#EF4444' },
      { id: 'user1', label: 'Hot Sleepers', type: 'UserGroup', x: 600, y: 650, color: '#F59E0B' },
      { id: 'scenario1', label: 'Summer Sleep', type: 'Scenario', x: 300, y: 50, color: '#EC4899' }
    ],
    edges: [
      { from: 'brand', to: 'product1', label: 'HAS_PRODUCT' },
      { from: 'brand', to: 'product2', label: 'HAS_PRODUCT' },
      { from: 'product1', to: 'feature1', label: 'HAS_FEATURE' },
      { from: 'product1', to: 'feature2', label: 'HAS_FEATURE' },
      { from: 'product2', to: 'feature3', label: 'HAS_FEATURE' },
      { from: 'feature1', to: 'problem1', label: 'SOLVES' },
      { from: 'feature2', to: 'problem2', label: 'SOLVES' },
      { from: 'user1', to: 'problem2', label: 'HAS_PROBLEM' },
      { from: 'scenario1', to: 'brand', label: 'APPLIES_TO' },
      { from: 'feature3', to: 'user1', label: 'BENEFITS' }
    ]
  };

  const entities = [
    { id: 1, type: 'Product', name: 'Cool Mattress Queen', connections: 12, status: 'active' },
    { id: 2, type: 'Feature', name: 'Gel-infused Memory Foam', connections: 8, status: 'active' },
    { id: 3, type: 'Scenario', name: 'Summer Sleep', connections: 6, status: 'active' },
    { id: 4, type: 'Problem', name: 'Night Sweats', connections: 5, status: 'active' },
    { id: 5, type: 'UserGroup', name: 'Hot Sleepers', connections: 7, status: 'active' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Graph</h1>
          <p className="text-gray-600 mt-1">Manage entities and relationships in your knowledge base</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Entity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Graph Visualization</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg">Network View</button>
              <button className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">List View</button>
            </div>
          </div>
          <div className="h-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl relative overflow-hidden">
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 800 700"
              className="cursor-move"
            >
              {/* Define arrow markers for edges */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#94A3B8" />
                </marker>
              </defs>

              {/* Render edges (relationships) */}
              {graphData.edges.map((edge, i) => {
                const fromNode = graphData.nodes.find(n => n.id === edge.from);
                const toNode = graphData.nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                // Calculate edge midpoint for label
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                return (
                  <g key={i}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#94A3B8"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      opacity="0.6"
                    />
                    <text
                      x={midX}
                      y={midY - 5}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748B"
                      className="pointer-events-none"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Render nodes */}
              {graphData.nodes.map((node) => (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-transform hover:scale-110"
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                >
                  {/* Outer glow for selected node */}
                  {selectedNode?.id === node.id && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="45"
                      fill={node.color}
                      opacity="0.2"
                    />
                  )}

                  {/* Main node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="35"
                    fill={node.color}
                    opacity="0.9"
                    stroke="white"
                    strokeWidth="3"
                  />

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y - 45}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#1F2937"
                    className="pointer-events-none"
                  >
                    {node.label}
                  </text>

                  {/* Node type */}
                  <text
                    x={node.x}
                    y={node.y + 55}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6B7280"
                    className="pointer-events-none"
                  >
                    {node.type}
                  </text>
                </g>
              ))}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-xs">
              <p className="font-semibold mb-2 text-gray-700">Entity Types</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                  <span className="text-gray-600">Brand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></div>
                  <span className="text-gray-600">Product</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                  <span className="text-gray-600">Feature</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                  <span className="text-gray-600">Problem</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                  <span className="text-gray-600">UserGroup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EC4899' }}></div>
                  <span className="text-gray-600">Scenario</span>
                </div>
              </div>
            </div>

            {/* Selected node info */}
            {selectedNode && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-4 max-w-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{selectedNode.label}</h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><span className="font-medium">Type:</span> {selectedNode.type}</p>
                  <p><span className="font-medium">ID:</span> {selectedNode.id}</p>
                  <p><span className="font-medium">Connections:</span> {graphData.edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).length}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Entity Types</h3>
          <div className="space-y-2">
            {entities.map((entity) => (
              <button
                key={entity.id}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{entity.name}</p>
                    <p className="text-xs text-gray-500">{entity.type}</p>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">{entity.connections}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Total Entities</h3>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">1,234</p>
          <p className="text-sm text-gray-500 mt-1">+45 this week</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Relationships</h3>
            <Link className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">5,678</p>
          <p className="text-sm text-gray-500 mt-1">+123 this week</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Coverage</h3>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">87%</p>
          <p className="text-sm text-gray-500 mt-1">+5% improvement</p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
