import React, { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useWorldBibleStore } from '@/stores/worldBibleStore';
import { Shield, Users, Plus, Trash2 } from 'lucide-react';

interface FactionEditorProps {
  factionId: string;
}

export const FactionEditor: React.FC<FactionEditorProps> = ({ factionId }) => {
  const { project } = useProjectStore();
  const { updateFaction } = useWorldBibleStore();

  const faction = project.factions.find((f) => f.id === factionId);

  if (!faction) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-ink-secondary)]">
        Không tìm thấy thế lực này.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto bg-[var(--color-surface)]">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1">
          <Shield size={14} /> Thế lực & Phân chia giai cấp
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={faction.name}
            onChange={(e) => updateFaction(faction.id, { name: e.target.value })}
            placeholder="Tên thế lực / Gia tộc / Tổ chức"
            className="text-3xl font-heading font-bold text-[var(--color-ink-primary)] bg-transparent border-b border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none flex-1"
          />
          <input
            type="color"
            value={faction.color || '#2563EB'}
            onChange={(e) => updateFaction(faction.id, { color: e.target.value })}
            className="w-8 h-8 rounded border-none cursor-pointer"
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-[var(--color-ink-secondary)]">Loại hình:</span>
          <select
            value={faction.type}
            onChange={(e) => updateFaction(faction.id, { type: e.target.value as any })}
            className="px-2.5 py-1 text-xs rounded bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-primary)] outline-none"
          >
            <option value="kingdom">Vương triều / Đế quốc</option>
            <option value="organization">Tổ chức ngầm</option>
            <option value="guild">Môn phái / Bang hội</option>
            <option value="class">Giai cấp xã hội</option>
            <option value="tribe">Bộ lạc / Bộ tộc</option>
            <option value="religion">Tôn giáo / Giáo phái</option>
            <option value="custom">Tuỳ biến khác</option>
          </select>
        </div>
      </div>

      {/* Tổng quan & Mô tả */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
          Mô tả & Tầm ảnh hưởng
        </label>
        <textarea
          rows={3}
          value={faction.description}
          onChange={(e) => updateFaction(faction.id, { description: e.target.value })}
          placeholder="Tôn chỉ hoạt động, địa bàn hoạt động, lịch sử thành lập..."
          className="w-full text-sm p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {/* Phân chia giai cấp & Cấu trúc thứ bậc */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
          Cấu trúc giai cấp & Thứ bậc nội bộ (Hierarchy)
        </label>
        <p className="text-xs text-[var(--color-ink-secondary)] mb-2">
          Quy định địa vị từ lãnh tụ tối cao tới tầng lớp nô dịch hoặc môn đồ ngoại môn.
        </p>
        <textarea
          rows={5}
          value={faction.hierarchy}
          onChange={(e) => updateFaction(faction.id, { hierarchy: e.target.value })}
          placeholder="VD: Cung Chủ -> Tả Hữu Sứ Giả -> Bát Đại Trưởng Lão -> Chân Truyền -> Đồ Chúng..."
          className="w-full text-sm p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)] font-body leading-relaxed"
        />
      </div>

      {/* Ghi chú bí mật */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
          Ghi chú nội bộ cốt truyện (Plot Notes)
        </label>
        <textarea
          rows={4}
          value={faction.notes}
          onChange={(e) => updateFaction(faction.id, { notes: e.target.value })}
          placeholder="Những âm mưu, bí mật nội bộ chỉ tác giả mới biết..."
          className="w-full text-sm p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>
    </div>
  );
};

