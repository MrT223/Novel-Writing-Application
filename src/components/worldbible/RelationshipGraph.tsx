import React, { useMemo, useCallback, useEffect, useState } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '@/stores/projectStore';
import { useTabStore } from '@/stores/tabStore';
import { useWorldBibleStore } from '@/stores/worldBibleStore';
import { Users, GitFork, Plus, RotateCcw, Info, Sparkles } from 'lucide-react';

interface CharacterNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  role: string;
  tags?: string[];
  color: string;
  abilities?: string[];
  onOpenProfile: (id: string, name: string) => void;
}

// Custom Node Component: Loại bỏ hoàn toàn wrapper viền xám mặc định của React Flow
const CharacterCustomNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as CharacterNodeData;
  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
        nodeData.onOpenProfile(nodeData.id, nodeData.name);
      }}
      className="group relative flex items-center gap-3 p-3 bg-[var(--color-surface)] border-2 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer min-w-[190px] max-w-[260px] select-none"
      style={{ borderColor: nodeData.color || 'var(--color-accent)' }}
      title="Nhấp đúp để mở hồ sơ nhân vật này"
    >
      {/* Invisible Handles for connecting edges */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[var(--color-accent)] opacity-40 group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[var(--color-accent)] opacity-40 group-hover:opacity-100"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-[var(--color-accent)] opacity-40 group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-[var(--color-accent)] opacity-40 group-hover:opacity-100"
      />

      {/* Avatar Circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-white text-base shadow-inner flex-shrink-0"
        style={{ backgroundColor: nodeData.color || '#D97706' }}
      >
        {nodeData.name ? nodeData.name.slice(0, 1) : '?'}
      </div>

      {/* Character Info */}
      <div className="flex flex-col text-left overflow-hidden flex-1 min-w-0">
        <span className="font-bold text-xs text-[var(--color-ink-primary)] truncate" title={nodeData.name}>
          {nodeData.name}
        </span>
        <span className="text-[10px] text-[var(--color-ink-secondary)] font-medium truncate">
          {nodeData.role === 'protagonist'
            ? 'Nhân vật chính'
            : nodeData.role === 'antagonist'
            ? 'Phản diện'
            : nodeData.role === 'supporting'
            ? 'Nhân vật phụ'
            : nodeData.role || 'Chưa phân vai'}
        </span>
        {/* Custom Tags */}
        {nodeData.tags && nodeData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {nodeData.tags.slice(0, 2).map((t, i) => (
              <span
                key={i}
                className="text-[8px] px-1 py-0.2 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold truncate max-w-[80px]"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
        {nodeData.abilities && nodeData.abilities.length > 0 && (
          <span
            className="text-[9px] text-[var(--color-accent)] font-semibold truncate mt-0.5"
            title={nodeData.abilities.join(', ')}
          >
            ⚡ {nodeData.abilities[0]} {nodeData.abilities.length > 1 ? `+${nodeData.abilities.length - 1}` : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export const RelationshipGraph: React.FC = () => {
  const { project } = useProjectStore();
  const { openTab } = useTabStore();
  const { addCharacter } = useWorldBibleStore();

  const [roleFilter, setRoleFilter] = useState<string>('all');

  const nodeTypes = useMemo(
    () => ({
      character: CharacterCustomNode,
    }),
    []
  );

  // Danh sách các vai trò thực tế có trong tác phẩm (Custom roles động)
  const allRoles = useMemo(() => {
    const roleSet = new Set<string>();
    project.characters.forEach((c) => {
      if (c.role && c.role.trim()) roleSet.add(c.role.trim());
    });
    return Array.from(roleSet);
  }, [project.characters]);

  // Lọc nhân vật theo vai trò nếu có chọn filter
  const filteredCharacters = useMemo(() => {
    if (roleFilter === 'all') return project.characters;
    return project.characters.filter((c) => c.role === roleFilter);
  }, [project.characters, roleFilter]);

  // Generate initial nodes from project characters
  const initialNodes: Node[] = useMemo(() => {
    const total = filteredCharacters.length || 1;
    return filteredCharacters.map((char, index) => {
      // Calculate circle layout with adequate radius
      const angle = (index / total) * 2 * Math.PI;
      const radius = Math.max(220, total * 40);
      const x = 450 + radius * Math.cos(angle);
      const y = 320 + radius * Math.sin(angle);

      return {
        id: char.id,
        type: 'character',
        position: { x, y },
        data: {
          id: char.id,
          name: char.name,
          role: char.role,
          tags: char.tags || [],
          color: char.color || '#D97706',
          abilities: char.abilities || [],
          onOpenProfile: (id: string, name: string) => {
            openTab({
              type: 'character',
              title: name,
              entityId: id,
            });
          },
        },
      };
    });
  }, [filteredCharacters, openTab]);

  // Generate edges from character relationships
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    filteredCharacters.forEach((char) => {
      char.relationships?.forEach((rel, rIdx) => {
        // Chỉ vẽ edge nếu cả 2 nhân vật đều có trong filtered
        const targetExists = filteredCharacters.some((c) => c.id === rel.targetCharacterId);
        if (!targetExists) return;

        // Ưu tiên màu sắc custom do người dùng tự chọn cho mối quan hệ
        const edgeColor =
          rel.color ||
          (rel.type === 'ally'
            ? '#16A34A'
            : rel.type === 'enemy'
            ? '#DC2626'
            : rel.type === 'family'
            ? '#2563EB'
            : rel.type === 'romantic'
            ? '#EC4899'
            : '#D97706');

        edges.push({
          id: `edge-${char.id}-${rel.targetCharacterId}-${rIdx}`,
          source: char.id,
          target: rel.targetCharacterId,
          label: rel.label || rel.type,
          animated: rel.type === 'ally' || rel.type === 'romantic',
          style: { stroke: edgeColor, strokeWidth: 2 },
          labelStyle: { fill: 'var(--color-ink-primary)', fontSize: 11, fontWeight: 600 },
          labelBgStyle: { fill: 'var(--color-surface)', fillOpacity: 0.95 },
        });
      });
    });
    return edges;
  }, [filteredCharacters]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Đồng bộ lại nodes và edges khi dữ liệu nhân vật trong project thay đổi
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full relative bg-[var(--color-canvas)] overflow-hidden">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 rounded-2xl shadow-xl text-[var(--color-ink-primary)]">
        <div className="flex items-center gap-2 px-2 font-bold text-xs border-r border-[var(--color-border)] pr-3">
          <GitFork size={16} className="text-purple-500" />
          <span>Sơ Đồ Mạng Lưới Nhân Vật</span>
          <span className="text-[10px] text-[var(--color-ink-tertiary)] font-normal">
            ({project.characters.length} nhân vật)
          </span>
        </div>

        {/* Lọc theo vai trò động (custom roles) */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-primary)] outline-none"
        >
          <option value="all">Tất cả vai trò</option>
          {allRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Thêm nhân vật mới */}
        <button
          onClick={() => {
            const c = addCharacter();
            openTab({ type: 'character', title: c.name, entityId: c.id });
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-white text-xs font-bold transition-all shadow-2xs"
        >
          <Plus size={13} /> Thêm Nhân Vật
        </button>

        {/* Nút reset layout */}
        <button
          onClick={() => setNodes(initialNodes)}
          className="p-1 hover:bg-[var(--color-surface-hover)] rounded-md text-[var(--color-ink-secondary)]"
          title="Tự động căn chỉnh lại vị trí các node"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Empty State khi chưa có nhân vật */}
      {project.characters.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <Users size={48} className="text-[var(--color-ink-tertiary)] opacity-40 mb-3" />
          <h3 className="font-heading text-lg font-bold text-[var(--color-ink-primary)]">
            Chưa có nhân vật nào trong tác phẩm
          </h3>
          <p className="text-xs text-[var(--color-ink-secondary)] max-w-sm mt-1 mb-4">
            Hãy bắt đầu tạo những nhân vật đầu tiên để xem mạng lưới mối quan hệ tương tác sinh động.
          </p>
          <button
            onClick={() => {
              const c = addCharacter();
              openTab({ type: 'character', title: c.name, entityId: c.id });
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus size={14} /> Tạo Nhân Vật Đầu Tiên
          </button>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-md" />
          <MiniMap
            nodeColor={(n) => '#D97706'}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-md"
          />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      )}
    </div>
  );
};
