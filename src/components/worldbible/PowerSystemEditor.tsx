import React, { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useWorldBibleStore } from '@/stores/worldBibleStore';
import {
  Zap,
  Plus,
  Trash2,
  Edit2,
  Check,
  FileText,
  Sparkles,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { PowerProperty } from '@/types';

interface PowerSystemEditorProps {
  powerSystemId: string;
}

export const PowerSystemEditor: React.FC<PowerSystemEditorProps> = ({ powerSystemId }) => {
  const { project, updateProject } = useProjectStore();

  const ps = project.powerSystems.find((p) => p.id === powerSystemId);

  const [newPropName, setNewPropName] = useState('');
  const [newPropContent, setNewPropContent] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(ps?.name || '');

  if (!ps) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-ink-secondary)]">
        Không tìm thấy mục sức mạnh này.
      </div>
    );
  }

  const handleUpdatePs = (partial: Partial<typeof ps>) => {
    const updatedList = project.powerSystems.map((item) =>
      item.id === ps.id ? { ...item, ...partial, updatedAt: new Date().toISOString() } : item
    );
    updateProject({ powerSystems: updatedList });

    // Cập nhật crossLinks nếu đổi tên
    if (partial.name) {
      const updatedLinks = project.crossLinks.map((cl) =>
        cl.targetId === ps.id ? { ...cl, term: partial.name!, description: `Sức mạnh: ${partial.name}` } : cl
      );
      updateProject({ crossLinks: updatedLinks });
    }
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      handleUpdatePs({ name: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  // Thêm mục con tùy ý
  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName.trim()) return;

    const newProp: PowerProperty = {
      id: uuidv4(),
      name: newPropName.trim(),
      content: newPropContent.trim(),
    };

    const currentProps = ps.properties || [];
    handleUpdatePs({
      properties: [...currentProps, newProp],
    });

    setNewPropName('');
    setNewPropContent('');
  };

  const handleUpdateProperty = (propId: string, partial: Partial<PowerProperty>) => {
    const updated = (ps.properties || []).map((p) =>
      p.id === propId ? { ...p, ...partial } : p
    );
    handleUpdatePs({ properties: updated });
  };

  const handleDeleteProperty = (propId: string) => {
    const updated = (ps.properties || []).filter((p) => p.id !== propId);
    handleUpdatePs({ properties: updated });
  };

  return (
    <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto bg-[var(--color-surface)]">
      {/* Tiêu đề sức mạnh (Tự do sửa) */}
      <div className="mb-6 pb-6 border-b border-[var(--color-border)]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-2 block flex items-center gap-1.5">
          <Zap size={14} /> Tên Năng Lực / Hệ Thống Sức Mạnh
        </span>

        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              autoFocus
              className="text-3xl font-heading font-bold text-[var(--color-ink-primary)] bg-[var(--color-canvas)] border border-[var(--color-accent)] rounded-lg px-2 py-1 outline-none w-full"
            />
            <button
              onClick={handleSaveTitle}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold"
            >
              Lưu
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setTempTitle(ps.name);
              setIsEditingTitle(true);
            }}
            title="Nhấp để sửa tiêu đề sức mạnh"
          >
            <h1 className="text-3xl font-heading font-bold text-[var(--color-ink-primary)]">
              {ps.name}
            </h1>
            <Edit2 size={16} className="opacity-0 group-hover:opacity-100 text-[var(--color-ink-tertiary)] transition-opacity" />
          </div>
        )}
      </div>

      {/* Soạn thảo tổng quan tự do */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
          Mô tả & Khái niệm tự do (Freeform Concept)
        </label>
        <textarea
          rows={5}
          value={ps.freeformContent || ''}
          onChange={(e) => handleUpdatePs({ freeformContent: e.target.value })}
          placeholder="Tự do diễn giải ý tưởng, bản chất, gốc tích của sức mạnh này..."
          className="w-full text-sm p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)] leading-relaxed font-body"
        />
      </div>

      {/* Danh sách các đoạn văn bản / Mục con do tác giả tự đặt tên */}
      <div className="mb-10 space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-[var(--color-accent)]" />
            Các thuộc tính & Mục chi tiết (Tác giả tự đặt tên)
          </label>
          <span className="text-[11px] text-[var(--color-ink-tertiary)]">
            {(ps.properties || []).length} mục
          </span>
        </div>

        {/* Render danh sách mục con */}
        <div className="space-y-4">
          {(ps.properties || []).map((prop) => (
            <div
              key={prop.id}
              className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--color-border)]">
                {/* Tên mục con có thể chỉnh sửa trực tiếp */}
                <input
                  type="text"
                  value={prop.name}
                  onChange={(e) => handleUpdateProperty(prop.id, { name: e.target.value })}
                  placeholder="Tên mục (VD: Nguyên lí, Năng lượng tiêu hao...)"
                  className="font-heading font-bold text-sm bg-transparent border-b border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none text-[var(--color-ink-primary)] px-1"
                />

                <button
                  onClick={() => handleDeleteProperty(prop.id)}
                  className="text-xs text-[var(--color-destructive)] opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
                  title="Xoá mục này"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Nội dung mục con */}
              <textarea
                rows={3}
                value={prop.content}
                onChange={(e) => handleUpdateProperty(prop.id, { content: e.target.value })}
                placeholder={`Nội dung chi tiết cho mục "${prop.name}"...`}
                className="w-full text-xs p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)] font-body leading-relaxed"
              />
            </div>
          ))}
        </div>

        {/* Form thêm mục con mới tự do */}
        <form
          onSubmit={handleAddProperty}
          className="p-4 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-sidebar-bg)] space-y-3"
        >
          <span className="text-xs font-semibold text-[var(--color-ink-primary)] block">
            + Thêm mục nội dung mới cho sức mạnh này
          </span>

          <input
            type="text"
            value={newPropName}
            onChange={(e) => setNewPropName(e.target.value)}
            placeholder="Tên mục tự đặt (Ví dụ: Nguyên lí vận hành, Năng lượng tiêu hao, Phạm vi ảnh hưởng, Cấm kỵ...)"
            className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
          />

          <textarea
            rows={2}
            value={newPropContent}
            onChange={(e) => setNewPropContent(e.target.value)}
            placeholder="Nội dung diễn giải chi tiết cho mục này..."
            className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)] font-body"
          />

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} /> Thêm Mục Này
          </button>
        </form>
      </div>
    </div>
  );
};
