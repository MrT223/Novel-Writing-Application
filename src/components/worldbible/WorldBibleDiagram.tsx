import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
  MarkerType,
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
  Sparkles,
  Table,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Project,
  WorldBibleDiagramNode,
  WorldBibleDiagramEdge,
} from '@/types';

// ======== Domain color and icon helpers ========
const DOMAIN_CONFIG: Record<
  string,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
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
  const nodeData = (data || {}) as unknown as ConceptNodeData;
  const domainKey =
    nodeData?.domain && DOMAIN_CONFIG[nodeData.domain]
      ? nodeData.domain
      : 'world-building';
  const domainCfg = DOMAIN_CONFIG[domainKey] || DOMAIN_CONFIG['world-building'];
  const IconComponent = domainCfg.icon || Globe;
  const nodeColor = nodeData?.color || domainCfg.color || '#D97706';
  const labelText = nodeData?.label || 'Chưa đặt tên';

  return (
    <div
      className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 shadow-md hover:shadow-xl transition-all cursor-grab active:cursor-grabbing min-w-[160px] max-w-[260px] select-none ${
        selected ? 'ring-2 ring-offset-2' : ''
      }`}
      style={{
        borderColor: nodeColor,
        backgroundColor: domainCfg.bgColor,
      }}
    >
      {/* Handles on all 4 sides */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-[var(--color-accent)] opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all !border-2 !border-white shadow-xs cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-[var(--color-accent)] opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all !border-2 !border-white shadow-xs cursor-crosshair"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3.5 !h-3.5 !bg-[var(--color-accent)] opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all !border-2 !border-white shadow-xs cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3.5 !h-3.5 !bg-[var(--color-accent)] opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all !border-2 !border-white shadow-xs cursor-crosshair"
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
          title={labelText}
        >
          {labelText}
        </span>
        <span className="text-[9px] font-semibold mt-0.5" style={{ color: nodeColor }}>
          {domainCfg.label}
        </span>
        {nodeData?.description && (
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

// Node types defined outside component to prevent re-creation
const NODE_TYPES = { concept: ConceptNode };

// Helpers to compute initial state ONCE
const getInitialNodes = (project: Project): Node[] => {
  const savedNodes = project.worldBibleDiagram?.nodes;
  if (savedNodes && savedNodes.length > 0) {
    return savedNodes.map((n) => ({
      id: String(n.id),
      type: 'concept',
      position: n.position || { x: 300, y: 200 },
      data: {
        label: n.data?.label || 'Chưa đặt tên',
        domain: n.data?.domain || 'world-building',
        color: n.data?.color,
        description: n.data?.description,
        categoryId: n.data?.categoryId,
      },
    }));
  }

  const categories = project.extractedCategories || [];
  const total = categories.length || 1;
  return categories.map((cat, index) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = Math.max(220, total * 45);
    const x = 450 + radius * Math.cos(angle);
    const y = 350 + radius * Math.sin(angle);

    return {
      id: String(cat.id || uuidv4()),
      type: 'concept',
      position: { x, y },
      data: {
        label: cat.name || 'Danh mục',
        domain: cat.domain || 'world-building',
        color: undefined,
        description: undefined,
        categoryId: cat.id,
      },
    };
  });
};

const getInitialEdges = (project: Project): Edge[] => {
  const savedEdges = project.worldBibleDiagram?.edges;
  if (!savedEdges || savedEdges.length === 0) return [];

  return savedEdges.map((e) => {
    const relType = RELATIONSHIP_TYPES.find((r) => r.value === e.relationshipType);
    const edgeColor = e.color || relType?.color || '#6B7280';
    const isDirected =
      e.relationshipType === 'parent-child' ||
      e.relationshipType === 'evolution' ||
      e.relationshipType === 'dependency';

    return {
      id: String(e.id),
      source: String(e.source),
      target: String(e.target),
      label: e.label || '',
      animated: e.animated || e.relationshipType === 'evolution',
      style: { stroke: edgeColor, strokeWidth: 2 },
      labelStyle: { fill: 'var(--color-ink-primary)', fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: 'var(--color-surface)', fillOpacity: 0.95 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 6,
      markerEnd: isDirected
        ? {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
            width: 16,
            height: 16,
          }
        : undefined,
      data: {
        label: e.label || '',
        relationshipType: e.relationshipType,
        color: edgeColor,
      },
    };
  });
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
  const [savedFeedback, setSavedFeedback] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Initialize once on mount with useMemo
  const initialNodes = useMemo(() => getInitialNodes(project), []);
  const initialEdges = useMemo(() => getInitialEdges(project), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Keep refs for unmount save
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  // Filter nodes by domain
  const visibleNodeIds = useMemo(() => {
    if (domainFilter === 'all') return new Set(nodes.map((n) => n.id));
    return new Set(
      nodes
        .filter((n) => (n.data as any)?.domain === domainFilter)
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
  const saveDiagram = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      const diagramNodes: WorldBibleDiagramNode[] = currentNodes.map((n) => ({
        id: n.id,
        position: n.position,
        data: {
          label: (n.data as any)?.label || '',
          domain: (n.data as any)?.domain || 'world-building',
          color: (n.data as any)?.color,
          description: (n.data as any)?.description,
          categoryId: (n.data as any)?.categoryId,
        },
      }));

      const diagramEdges: WorldBibleDiagramEdge[] = currentEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: (e.data as any)?.label || (e.label as string) || '',
        relationshipType: (e.data as any)?.relationshipType || 'related',
        color: (e.data as any)?.color,
        animated: e.animated,
      }));

      updateProject({
        worldBibleDiagram: { nodes: diagramNodes, edges: diagramEdges },
      });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    },
    [updateProject]
  );

  // Auto-save on unmount
  useEffect(() => {
    return () => {
      saveDiagram(nodesRef.current, edgesRef.current);
    };
  }, [saveDiagram]);

  // ---- Connection handler: open modal to name the relationship ----
  const onConnect = useCallback((params: Connection) => {
    setPendingConnection(params);
    setEdgeLabel('');
    setEdgeRelType('related');
    setShowEdgeModal(true);
  }, []);

  const handleConfirmEdge = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!pendingConnection) return;

      const relType = RELATIONSHIP_TYPES.find((r) => r.value === edgeRelType);
      const edgeColor = relType?.color || '#6B7280';
      const isDirected =
        edgeRelType === 'parent-child' ||
        edgeRelType === 'evolution' ||
        edgeRelType === 'dependency';

      const newEdge: Edge = {
        id: `edge-${uuidv4()}`,
        source: pendingConnection.source!,
        target: pendingConnection.target!,
        sourceHandle: pendingConnection.sourceHandle,
        targetHandle: pendingConnection.targetHandle,
        label: edgeLabel.trim(),
        animated: edgeRelType === 'evolution',
        style: { stroke: edgeColor, strokeWidth: 2 },
        labelStyle: { fill: 'var(--color-ink-primary)', fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: 'var(--color-surface)', fillOpacity: 0.95 },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
        markerEnd: isDirected
          ? {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
              width: 16,
              height: 16,
            }
          : undefined,
        data: {
          label: edgeLabel.trim(),
          relationshipType: edgeRelType,
          color: edgeColor,
        },
      };

      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);
      setShowEdgeModal(false);
      setPendingConnection(null);
      saveDiagram(nodes, updatedEdges);
    },
    [pendingConnection, edgeLabel, edgeRelType, edges, nodes, setEdges, saveDiagram]
  );

  // ---- Edit edge on double-click ----
  const onEdgeDoubleClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setEditingEdge(edge);
    const edgeData = edge.data as { label?: string; relationshipType?: string } | undefined;
    setEdgeLabel(edgeData?.label || (edge.label as string) || '');
    setEdgeRelType(edgeData?.relationshipType || 'related');
    setShowEdgeModal(true);
  }, []);

  const handleUpdateEdge = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingEdge) return;

      const relType = RELATIONSHIP_TYPES.find((r) => r.value === edgeRelType);
      const edgeColor = relType?.color || '#6B7280';
      const isDirected =
        edgeRelType === 'parent-child' ||
        edgeRelType === 'evolution' ||
        edgeRelType === 'dependency';

      const updatedEdges = edges.map((ed) =>
        ed.id === editingEdge.id
          ? {
              ...ed,
              label: edgeLabel.trim(),
              animated: edgeRelType === 'evolution',
              style: { stroke: edgeColor, strokeWidth: 2 },
              markerEnd: isDirected
                ? {
                    type: MarkerType.ArrowClosed,
                    color: edgeColor,
                    width: 16,
                    height: 16,
                  }
                : undefined,
              data: {
                label: edgeLabel.trim(),
                relationshipType: edgeRelType,
                color: edgeColor,
              },
            }
          : ed
      );

      setEdges(updatedEdges);
      setShowEdgeModal(false);
      setEditingEdge(null);
      saveDiagram(nodes, updatedEdges);
    },
    [editingEdge, edgeLabel, edgeRelType, edges, nodes, setEdges, saveDiagram]
  );

  const handleDeleteEdge = useCallback(() => {
    if (!editingEdge) return;
    const updatedEdges = edges.filter((ed) => ed.id !== editingEdge.id);
    setEdges(updatedEdges);
    setShowEdgeModal(false);
    setEditingEdge(null);
    saveDiagram(nodes, updatedEdges);
  }, [editingEdge, edges, nodes, setEdges, saveDiagram]);

  // ---- Add new concept node ----
  const handleAddNode = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newNodeLabel.trim()) return;

      const newNode: Node = {
        id: uuidv4(),
        type: 'concept',
        position: {
          x: 350 + Math.random() * 250,
          y: 250 + Math.random() * 200,
        },
        data: {
          label: newNodeLabel.trim(),
          domain: newNodeDomain,
          color: undefined,
          description: newNodeDescription.trim() || undefined,
          categoryId: undefined,
        },
      };

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setNewNodeLabel('');
      setNewNodeDescription('');
      setShowAddModal(false);
      saveDiagram(updatedNodes, edges);
    },
    [newNodeLabel, newNodeDomain, newNodeDescription, nodes, edges, setNodes, saveDiagram]
  );

  // ---- Sync categories into diagram (import missing categories as nodes) ----
  const handleSyncCategories = useCallback(() => {
    const categories = project.extractedCategories || [];
    const existingCatIds = new Set(
      nodes.map((n) => (n.data as any)?.categoryId).filter(Boolean)
    );

    const newCatNodes: Node[] = categories
      .filter((cat) => !existingCatIds.has(cat.id))
      .map((cat, index) => {
        const angle = (index / Math.max(categories.length, 1)) * 2 * Math.PI;
        const radius = 220;
        return {
          id: String(cat.id),
          type: 'concept' as const,
          position: {
            x: 450 + radius * Math.cos(angle) + Math.random() * 40,
            y: 350 + radius * Math.sin(angle) + Math.random() * 40,
          },
          data: {
            label: cat.name || 'Danh mục mới',
            domain: cat.domain || 'world-building',
            categoryId: cat.id,
          },
        };
      });

    if (newCatNodes.length > 0) {
      const updatedNodes = [...nodes, ...newCatNodes];
      setNodes(updatedNodes);
      saveDiagram(updatedNodes, edges);
    }
  }, [project.extractedCategories, nodes, edges, setNodes, saveDiagram]);

  // ---- Delete selected nodes ----
  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
    if (selectedNodeIds.size === 0) return;
    if (!confirm(`Xoá ${selectedNodeIds.size} nút đã chọn?`)) return;

    const updatedNodes = nodes.filter((n) => !selectedNodeIds.has(n.id));
    const updatedEdges = edges.filter(
      (e) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    saveDiagram(updatedNodes, updatedEdges);
  }, [nodes, edges, setNodes, setEdges, saveDiagram]);

  // ---- Rename node on double-click ----
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
    setEditingNodeLabel((node.data as any)?.label || '');
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, []);

  const handleSaveNodeLabel = useCallback(() => {
    if (!editingNodeId || !editingNodeLabel.trim()) {
      setEditingNodeId(null);
      return;
    }
    const updatedNodes = nodes.map((n) =>
      n.id === editingNodeId
        ? { ...n, data: { ...n.data, label: editingNodeLabel.trim() } }
        : n
    );
    setNodes(updatedNodes);
    setEditingNodeId(null);
    saveDiagram(updatedNodes, edges);
  }, [editingNodeId, editingNodeLabel, nodes, edges, setNodes, saveDiagram]);

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
            const freshNodes = getInitialNodes(project);
            const freshEdges = getInitialEdges(project);
            setNodes(freshNodes);
            setEdges(freshEdges);
            saveDiagram(freshNodes, freshEdges);
          }}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)]"
          title="Tự động sắp xếp lại layout ban đầu"
        >
          <RotateCcw size={14} />
        </button>

        {/* Save */}
        <button
          onClick={() => saveDiagram(nodes, edges)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
            savedFeedback
              ? 'bg-green-500/10 border-green-500 text-green-600 font-bold'
              : 'bg-[var(--color-canvas)] border-[var(--color-border)] hover:border-green-500 text-green-600'
          }`}
          title="Lưu sơ đồ ngay"
        >
          {savedFeedback ? <Check size={13} /> : <Save size={13} />}
          {savedFeedback ? 'Đã Lưu!' : 'Lưu'}
        </button>

        {/* Switch to Matrix Table View */}
        <button
          onClick={() =>
            openTab({
              type: 'category-matrix',
              title: 'Bảng Tổng Hợp Danh Mục',
            })
          }
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-xs font-medium text-[var(--color-ink-primary)] transition-all ml-auto"
          title="Xem dưới dạng bảng danh mục trích xuất"
        >
          <Table size={13} className="text-[var(--color-accent)]" />
          Xem Dạng Bảng
        </button>
      </div>

      {/* ---- Instruction hint (bottom-left) ---- */}
      <div className="absolute bottom-6 left-6 z-20 bg-[var(--color-surface)]/90 backdrop-blur-sm border border-[var(--color-border)] px-3 py-2 rounded-xl shadow-md text-[10px] text-[var(--color-ink-tertiary)] max-w-xs space-y-0.5">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--color-ink-secondary)] mb-0.5">
          <Link2 size={12} /> Hướng dẫn thao tác
        </div>
        <div>• <strong>Kéo thả</strong> để di chuyển vị trí nút</div>
        <div>• <strong>Kéo từ ⚫ chấm tròn</strong> trên nút sang nút khác để tạo liên kết</div>
        <div>• <strong>Nhấp đúp vào nút</strong> để đổi tên nhanh</div>
        <div>• <strong>Nhấp đúp vào đường nối</strong> để sửa hoặc xoá quan hệ</div>
        <div>• Chọn nút rồi nhấn <strong>Delete / Backspace</strong> để xoá</div>
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
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeDragStop={() => saveDiagram(nodes, edges)}
          fitView
          deleteKeyCode={['Delete', 'Backspace']}
          multiSelectionKeyCode="Shift"
        >
          <Controls className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-md" />
          <MiniMap
            nodeColor={(n: any) => {
              const d = n?.data?.domain;
              return (d && DOMAIN_CONFIG[d]?.color) || '#D97706';
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
