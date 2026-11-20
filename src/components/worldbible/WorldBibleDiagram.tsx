import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
  EdgeProps,
  EdgeLabelRenderer,
  getBezierPath,
  BaseEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '@/stores/projectStore';
import { useTabStore } from '@/stores/tabStore';
import {
  Plus,
  RotateCcw,
  Zap,
  Globe,
  Shield,
  BookOpen,
  Trash2,
  Edit2,
  Check,
  X,
  Network,
  Link2,
  Save,
  ArrowDownUp,
  Sparkles,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type {
  WorldBibleDiagramNode,
  WorldBibleDiagramEdge,
  ExtractedCategoryItem,
} from '@/types';

// ======== Domain color and icon helpers ========
const DOMAIN_CONFIG = {
  'power-system': {
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.08)',
    borderColor: 'rgba(217, 119, 6, 0.4)',
    label: 'Sức Mạnh',
    icon: Zap,
  },
  'world-building': {
    color: '#2563EB',
    bgColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: 'rgba(37, 99, 235, 0.4)',
    label: 'World Building',
    icon: Globe,
  },
  faction: {
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.08)',
    borderColor: 'rgba(220, 38, 38, 0.4)',
    label: 'Thế Lực',
    icon: Shield,
  },
  plot: {
    color: '#9333EA',
    bgColor: 'rgba(147, 51, 234, 0.08)',
    borderColor: 'rgba(147, 51, 234, 0.4)',
    label: 'Cốt Truyện',
    icon: BookOpen,
  },
};

const RELATIONSHIP_TYPES = [
  { value: 'related', label: 'Liên quan', color: '#6B7280' },
  { value: 'parent-child', label: 'Phân cấp (Cha → Con)', color: '#2563EB' },
  { value: 'dependency', label: 'Phụ thuộc', color: '#D97706' },
  { value: 'conflict', label: 'Xung đột / Đối lập', color: '#DC2626' },
  { value: 'evolution', label: 'Tiến hóa / Phát triển', color: '#16A34A' },
  { value: 'custom', label: 'Tùy chỉnh', color: '#8B5CF6' },
];

// ======== Custom Concept Node ========
interface ConceptNodeData extends Record<string, unknown> {
  label: string;
  domain: 'power-system' | 'world-building' | 'faction' | 'plot';
  color?: string;
  description?: string;
  categoryId?: string;
}

const ConceptNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as ConceptNodeData;
  const domainCfg =
    DOMAIN_CONFIG[nodeData.domain] || DOMAIN_CONFIG['world-building'];
  const IconComponent = domainCfg.icon;
  const nodeColor = nodeData.color || domainCfg.color;

  return (
    <div
      className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 shadow-md hover:shadow-xl transition-all cursor-grab active:cursor-grabbing min-w-[160px] max-w-[260px] select-none ${
        selected ? 'ring-2 ring-offset-2' : ''
      }`}
      style={{
        borderColor: nodeColor,
        backgroundColor: domainCfg.bgColor,
        ...(selected ? { ringColor: nodeColor } : {}),
      }}
    >
      {/* Handles on all 4 sides */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[var(--color-accent)] opacity-0 group-hover:opacity-80 transition-opacity !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[var(--color-accent)] opacity-0 group-hover:opacity-80 transition-opacity !border-2 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-[var(--color-accent)] opacity-0 group-hover:opacity-80 transition-opacity !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-[var(--color-accent)] opacity-0 group-hover:opacity-80 transition-opacity !border-2 !border-white"
      />

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${nodeColor}20`, color: nodeColor }}
      >
        <IconComponent size={16} />
      </div>

      {/* Label */}
      <div className="flex flex-col text-left overflow-hidden flex-1 min-w-0">
        <span
          className="font-bold text-xs text-[var(--color-ink-primary)] truncate leading-tight"
          title={nodeData.label}
        >
          {nodeData.label}
        </span>
        <span className="text-[9px] font-semibold mt-0.5" style={{ color: nodeColor }}>
          {domainCfg.label}
        </span>
        {nodeData.description && (
          <span
            className="text-[9px] text-[var(--color-ink-tertiary)] truncate mt-0.5"
            title={nodeData.description}
          >
            {nodeData.description}
          </span>
        )}
      </div>
    </div>
  );
};

// ======== Custom Labeled Edge ========
const LabeledEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const edgeData = data as { label?: string; relationshipType?: string; color?: string } | undefined;
  const relType = RELATIONSHIP_TYPES.find((r) => r.value === edgeData?.relationshipType);
  const edgeColor = edgeData?.color || relType?.color || '#6B7280';

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: 2,
        }}
        markerEnd={markerEnd}
      />
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm text-[var(--color-ink-primary)] whitespace-nowrap"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// ======== Main Component ========
export const WorldBibleDiagram: React.FC = () => {
  const { project, updateProject } = useProjectStore();
  const { openTab } = useTabStore();

  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);

  // New node modal state
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeDomain, setNewNodeDomain] = useState<
    'power-system' | 'world-building' | 'faction' | 'plot'
  >('world-building');
  const [newNodeDescription, setNewNodeDescription] = useState('');

  // Edge modal state
  const [edgeLabel, setEdgeLabel] = useState('');
  const [edgeRelType, setEdgeRelType] = useState<string>('related');

  // Editing node state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeLabel, setEditingNodeLabel] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const nodeTypes = useMemo(() => ({ concept: ConceptNode }), []);
  const edgeTypes = useMemo(() => ({ labeled: LabeledEdge }), []);

  // Build initial nodes from saved diagram data + extracted categories
  const diagramData = project.worldBibleDiagram || { nodes: [], edges: [] };
  const categories = project.extractedCategories || [];

  const buildInitialNodes = useCallback((): Node[] => {
    const savedNodes = diagramData.nodes || [];
    // If there are saved nodes, use them
    if (savedNodes.length > 0) {
      return savedNodes.map((n) => ({
        id: n.id,
        type: 'concept',
        position: n.position,
        data: {
          label: n.data.label,
          domain: n.data.domain,
          color: n.data.color,
          description: n.data.description,
          categoryId: n.data.categoryId,
        },
      }));
    }

    // Otherwise auto-generate from extracted categories
    const total = categories.length || 1;
    return categories.map((cat, index) => {
      const angle = (index / total) * 2 * Math.PI;
      const radius = Math.max(250, total * 50);
      const x = 500 + radius * Math.cos(angle);
      const y = 400 + radius * Math.sin(angle);

      return {
        id: cat.id,
        type: 'concept',
        position: { x, y },
        data: {
          label: cat.name,
          domain: cat.domain,
          color: undefined,
          description: undefined,
          categoryId: cat.id,
        },
      };
    });
  }, [diagramData.nodes, categories]);

  const buildInitialEdges = useCallback((): Edge[] => {
    const savedEdges = diagramData.edges || [];
    return savedEdges.map((e) => {
      const relType = RELATIONSHIP_TYPES.find((r) => r.value === e.relationshipType);
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'labeled',
        animated: e.animated || e.relationshipType === 'evolution',
        data: {
          label: e.label || '',
          relationshipType: e.relationshipType,
          color: e.color || relType?.color,
        },
        markerEnd: e.relationshipType === 'parent-child' ? { type: 'arrowclosed' as const } : undefined,
      };
    });
  }, [diagramData.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(buildInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildInitialEdges());

  // Sync when diagramData changes
  useEffect(() => {
    setNodes(buildInitialNodes());
  }, [buildInitialNodes, setNodes]);

  useEffect(() => {
    setEdges(buildInitialEdges());
  }, [buildInitialEdges, setEdges]);

  // Filter nodes by domain
  const visibleNodeIds = useMemo(() => {
    if (domainFilter === 'all') return new Set(nodes.map((n) => n.id));
    return new Set(
      nodes
        .filter((n) => (n.data as ConceptNodeData).domain === domainFilter)
        .map((n) => n.id)
    );
  }, [nodes, domainFilter]);

  const filteredNodes = useMemo(
    () => nodes.filter((n) => visibleNodeIds.has(n.id)),
    [nodes, visibleNodeIds]
  );
  const filteredEdges = useMemo(
    () => edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)),
    [edges, visibleNodeIds]
  );

  // ---- Save to project ----
  const saveDiagram = useCallback(() => {
    const diagramNodes: WorldBibleDiagramNode[] = nodes.map((n) => ({
      id: n.id,
      position: n.position,
      data: {
        label: (n.data as ConceptNodeData).label,
        domain: (n.data as ConceptNodeData).domain,
        color: (n.data as ConceptNodeData).color,
        description: (n.data as ConceptNodeData).description,
        categoryId: (n.data as ConceptNodeData).categoryId,
      },
    }));

    const diagramEdges: WorldBibleDiagramEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: (e.data as any)?.label || '',
      relationshipType: (e.data as any)?.relationshipType || 'related',
      color: (e.data as any)?.color,
      animated: e.animated,
    }));

    updateProject({
      worldBibleDiagram: { nodes: diagramNodes, edges: diagramEdges },
    });
  }, [nodes, edges, updateProject]);

  // Auto-save on changes (debounced)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveDiagram();
    }, 1500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, edges, saveDiagram]);

  // ---- Connection handler: open modal to name the relationship ----
  const onConnect = useCallback(
    (params: Connection) => {
      setPendingConnection(params);
      setEdgeLabel('');
      setEdgeRelType('related');
      setShowEdgeModal(true);
    },
    []
  );

  const handleConfirmEdge = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!pendingConnection) return;

      const relType = RELATIONSHIP_TYPES.find((r) => r.value === edgeRelType);
      const newEdge: Edge = {
        id: `edge-${uuidv4()}`,
        source: pendingConnection.source!,
        target: pendingConnection.target!,
        sourceHandle: pendingConnection.sourceHandle,
        targetHandle: pendingConnection.targetHandle,
        type: 'labeled',
        animated: edgeRelType === 'evolution',
        data: {
          label: edgeLabel.trim(),
          relationshipType: edgeRelType,
          color: relType?.color,
        },
        markerEnd:
          edgeRelType === 'parent-child'
            ? { type: 'arrowclosed' as const }
            : undefined,
      };

      setEdges((eds) => [...eds, newEdge]);
      setShowEdgeModal(false);
      setPendingConnection(null);
    },
    [pendingConnection, edgeLabel, edgeRelType, setEdges]
  );

  // ---- Edit edge on double-click ----
  const onEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEditingEdge(edge);
      const edgeData = edge.data as { label?: string; relationshipType?: string } | undefined;
      setEdgeLabel(edgeData?.label || '');
      setEdgeRelType(edgeData?.relationshipType || 'related');
      setShowEdgeModal(true);
    },
    []
  );

  const handleUpdateEdge = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingEdge) return;

      const relType = RELATIONSHIP_TYPES.find((r) => r.value === edgeRelType);
      setEdges((eds) =>
        eds.map((ed) =>
          ed.id === editingEdge.id
            ? {
                ...ed,
                animated: edgeRelType === 'evolution',
                data: {
                  label: edgeLabel.trim(),
                  relationshipType: edgeRelType,
                  color: relType?.color,
                },
                markerEnd:
                  edgeRelType === 'parent-child'
                    ? { type: 'arrowclosed' as const }
                    : undefined,
              }
            : ed
        )
      );
      setShowEdgeModal(false);
      setEditingEdge(null);
    },
    [editingEdge, edgeLabel, edgeRelType, setEdges]
  );

  const handleDeleteEdge = useCallback(() => {
    if (!editingEdge) return;
    setEdges((eds) => eds.filter((ed) => ed.id !== editingEdge.id));
    setShowEdgeModal(false);
    setEditingEdge(null);
  }, [editingEdge, setEdges]);

  // ---- Add new concept node ----
  const handleAddNode = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newNodeLabel.trim()) return;

      const newNode: Node = {
        id: uuidv4(),
        type: 'concept',
        position: {
          x: 300 + Math.random() * 400,
          y: 200 + Math.random() * 300,
        },
        data: {
          label: newNodeLabel.trim(),
          domain: newNodeDomain,
          color: undefined,
          description: newNodeDescription.trim() || undefined,
          categoryId: undefined,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setNewNodeLabel('');
      setNewNodeDescription('');
      setShowAddModal(false);
    },
    [newNodeLabel, newNodeDomain, newNodeDescription, setNodes]
  );

  // ---- Sync categories into diagram (import missing categories as nodes) ----
  const handleSyncCategories = useCallback(() => {
    const existingCatIds = new Set(
      nodes
        .map((n) => (n.data as ConceptNodeData).categoryId)
        .filter(Boolean)
    );

    const newCatNodes: Node[] = categories
      .filter((cat) => !existingCatIds.has(cat.id))
      .map((cat, index) => {
        const angle = (index / Math.max(categories.length, 1)) * 2 * Math.PI;
        const radius = 200;
        return {
          id: cat.id,
          type: 'concept' as const,
          position: {
            x: 500 + radius * Math.cos(angle) + Math.random() * 50,
            y: 400 + radius * Math.sin(angle) + Math.random() * 50,
          },
          data: {
            label: cat.name,
            domain: cat.domain,
            categoryId: cat.id,
          },
        };
      });

    if (newCatNodes.length > 0) {
      setNodes((nds) => [...nds, ...newCatNodes]);
    }
  }, [categories, nodes, setNodes]);

  // ---- Delete selected nodes ----
  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
    if (selectedNodeIds.size === 0) return;
    if (!confirm(`Xoá ${selectedNodeIds.size} nút đã chọn?`)) return;

    setNodes((nds) => nds.filter((n) => !selectedNodeIds.has(n.id)));
    setEdges((eds) =>
      eds.filter((e) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target))
    );
  }, [nodes, setNodes, setEdges]);

  // ---- Rename node on double-click ----
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setEditingNodeId(node.id);
      setEditingNodeLabel((node.data as ConceptNodeData).label);
      setTimeout(() => editInputRef.current?.focus(), 50);
    },
    []
  );

  const handleSaveNodeLabel = useCallback(() => {
    if (!editingNodeId || !editingNodeLabel.trim()) {
      setEditingNodeId(null);
      return;
    }
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNodeId
          ? { ...n, data: { ...n.data, label: editingNodeLabel.trim() } }
          : n
      )
    );
    setEditingNodeId(null);
  }, [editingNodeId, editingNodeLabel, setNodes]);

  // Count stats
  const totalNodes = nodes.length;
  const totalEdges = edges.length;

  return (
    <div className="w-full h-full relative bg-[var(--color-canvas)] overflow-hidden">
      {/* ---- Top Control Bar ---- */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center gap-2.5 bg-[var(--color-surface)]/95 backdrop-blur-sm border border-[var(--color-border)] p-2.5 rounded-2xl shadow-xl text-[var(--color-ink-primary)]">
        {/* Title */}
        <div className="flex items-center gap-2 px-2 font-bold text-xs border-r border-[var(--color-border)] pr-3">
          <Network size={16} className="text-[var(--color-accent)]" />
          <span>Sơ Đồ Khái Niệm Bối Cảnh</span>
          <span className="text-[10px] text-[var(--color-ink-tertiary)] font-normal">
            ({totalNodes} nút • {totalEdges} liên kết)
          </span>
        </div>

        {/* Domain Filter */}
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-primary)] outline-none"
        >
          <option value="all">Tất cả phân khu</option>
          <option value="power-system">Hệ Thống Sức Mạnh</option>
          <option value="world-building">World Building</option>
          <option value="faction">Thế Lực / Bang Phái</option>
          <option value="plot">Cốt Truyện</option>
        </select>

        {/* Sync Categories */}
        <button
          onClick={handleSyncCategories}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-xs font-medium transition-all"
          title="Nhập thêm danh mục đã trích xuất vào sơ đồ"
        >
          <Sparkles size={13} className="text-[var(--color-accent)]" />
          Đồng Bộ Danh Mục
        </button>

        {/* Add Node */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-white text-xs font-bold transition-all shadow-2xs"
        >
          <Plus size={13} /> Thêm Khái Niệm
        </button>

        {/* Delete Selected */}
        <button
          onClick={handleDeleteSelected}
          className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-ink-tertiary)] hover:text-[var(--color-destructive)] transition-colors"
          title="Xoá các nút đã chọn"
        >
          <Trash2 size={14} />
        </button>

        {/* Reset */}
        <button
          onClick={() => {
            setNodes(buildInitialNodes());
            setEdges(buildInitialEdges());
          }}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)]"
          title="Tự động reset layout"
        >
          <RotateCcw size={14} />
        </button>

        {/* Save */}
        <button
          onClick={saveDiagram}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] hover:border-green-500 text-xs font-medium text-green-600 transition-all"
          title="Lưu sơ đồ ngay"
        >
          <Save size={13} />
          Lưu
        </button>
      </div>

      {/* ---- Instruction hint (bottom-left) ---- */}
      <div className="absolute bottom-6 left-6 z-20 bg-[var(--color-surface)]/90 backdrop-blur-sm border border-[var(--color-border)] px-3 py-2 rounded-xl shadow-md text-[10px] text-[var(--color-ink-tertiary)] max-w-xs space-y-0.5">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--color-ink-secondary)] mb-0.5">
          <Link2 size={12} /> Hướng dẫn thao tác
        </div>
        <div>• <strong>Kéo thả</strong> để di chuyển nút</div>
        <div>• <strong>Kéo từ ⚫ chấm tròn</strong> trên nút sang nút khác để tạo liên kết</div>
        <div>• <strong>Nhấp đúp vào nút</strong> để đổi tên</div>
        <div>• <strong>Nhấp đúp vào đường nối</strong> để sửa / xoá quan hệ</div>
        <div>• Chọn nút rồi nhấn <strong>Delete</strong> để xoá</div>
      </div>

      {/* ---- Empty State ---- */}
      {totalNodes === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <Network size={48} className="text-[var(--color-ink-tertiary)] opacity-40 mb-3" />
          <h3 className="font-heading text-lg font-bold text-[var(--color-ink-primary)]">
            Chưa có khái niệm nào trong sơ đồ
          </h3>
          <p className="text-xs text-[var(--color-ink-secondary)] max-w-sm mt-1 mb-4">
            Nhấn <strong>"Thêm Khái Niệm"</strong> để tạo nút mới, hoặc <strong>"Đồng Bộ Danh Mục"</strong> để nhập tự động từ các danh mục bạn đã trích xuất.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white text-xs font-bold shadow-md transition-all"
            >
              <Plus size={14} /> Thêm Khái Niệm
            </button>
            <button
              onClick={handleSyncCategories}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-ink-primary)] hover:border-[var(--color-accent)] transition-all shadow-md"
            >
              <Sparkles size={14} className="text-[var(--color-accent)]" /> Đồng Bộ Danh Mục
            </button>
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          defaultEdgeOptions={{ type: 'labeled' }}
        >
          <Controls className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-md" />
          <MiniMap
            nodeColor={(n) => {
              const d = (n.data as ConceptNodeData).domain;
              return DOMAIN_CONFIG[d]?.color || '#D97706';
            }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-md"
          />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      )}

      {/* ---- Inline node rename input ---- */}
      {editingNodeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-5 w-full max-w-sm space-y-3">
            <h3 className="font-heading font-bold text-sm text-[var(--color-ink-primary)] flex items-center gap-2">
              <Edit2 size={15} className="text-[var(--color-accent)]" />
              Đổi tên khái niệm
            </h3>
            <input
              ref={editInputRef}
              type="text"
              value={editingNodeLabel}
              onChange={(e) => setEditingNodeLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNodeLabel();
                if (e.key === 'Escape') setEditingNodeId(null);
              }}
              className="w-full text-sm p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNodeId(null)}
                className="px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)]"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNodeLabel}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] flex items-center gap-1"
              >
                <Check size={13} /> Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Add New Concept Modal ---- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddNode}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md p-6 text-[var(--color-ink-primary)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="font-heading font-bold text-base flex items-center gap-2">
                <Plus size={16} className="text-[var(--color-accent)]" />
                Thêm Khái Niệm Mới
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg text-[var(--color-ink-tertiary)]"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Tên khái niệm / danh mục *
              </label>
              <input
                type="text"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder="VD: Ma Dược Phục Linh, Hệ Phép Thuật Nguyên Tố, Hắc Long Bang..."
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Phân khu
              </label>
              <select
                value={newNodeDomain}
                onChange={(e) =>
                  setNewNodeDomain(
                    e.target.value as 'power-system' | 'world-building' | 'faction' | 'plot'
                  )
                }
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none"
              >
                <option value="power-system">⚡ Hệ Thống Sức Mạnh</option>
                <option value="world-building">🌍 World Building</option>
                <option value="faction">🛡️ Thế Lực / Bang Phái</option>
                <option value="plot">📖 Cốt Truyện</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Mô tả ngắn (không bắt buộc)
              </label>
              <input
                type="text"
                value={newNodeDescription}
                onChange={(e) => setNewNodeDescription(e.target.value)}
                placeholder="Ghi chú ngắn gọn về khái niệm này..."
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)]"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-1"
              >
                <Plus size={13} /> Thêm Vào Sơ Đồ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---- Edge Relationship Modal (create or edit) ---- */}
      {showEdgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={editingEdge ? handleUpdateEdge : handleConfirmEdge}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md p-6 text-[var(--color-ink-primary)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="font-heading font-bold text-base flex items-center gap-2">
                <Link2 size={16} className="text-[var(--color-accent)]" />
                {editingEdge ? 'Chỉnh Sửa Quan Hệ' : 'Đặt Tên Mối Quan Hệ'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEdgeModal(false);
                  setPendingConnection(null);
                  setEditingEdge(null);
                }}
                className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg text-[var(--color-ink-tertiary)]"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Loại quan hệ
              </label>
              <select
                value={edgeRelType}
                onChange={(e) => setEdgeRelType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none"
              >
                {RELATIONSHIP_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Nhãn mối quan hệ (tự do đặt tên)
              </label>
              <input
                type="text"
                value={edgeLabel}
                onChange={(e) => setEdgeLabel(e.target.value)}
                placeholder="VD: Nguồn gốc, Khắc chế, Tiến cấp từ, Đồng minh, Kiểm soát..."
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
                autoFocus
              />
            </div>

            {/* Color preview */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--color-ink-tertiary)]">Màu đường nối:</span>
              <span
                className="w-4 h-4 rounded-full border border-[var(--color-border)]"
                style={{
                  backgroundColor:
                    RELATIONSHIP_TYPES.find((r) => r.value === edgeRelType)?.color ||
                    '#6B7280',
                }}
              />
              <span className="text-[10px] font-semibold text-[var(--color-ink-secondary)]">
                {RELATIONSHIP_TYPES.find((r) => r.value === edgeRelType)?.label}
              </span>
            </div>

            <div className="flex justify-between pt-2">
              {editingEdge && (
                <button
                  type="button"
                  onClick={handleDeleteEdge}
                  className="px-3 py-1.5 text-xs rounded-lg text-[var(--color-destructive)] hover:bg-red-50 font-semibold flex items-center gap-1"
                >
                  <Trash2 size={13} /> Xoá Quan Hệ
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShowEdgeModal(false);
                    setPendingConnection(null);
                    setEditingEdge(null);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-1"
                >
                  <Check size={13} /> {editingEdge ? 'Cập Nhật' : 'Tạo Liên Kết'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
