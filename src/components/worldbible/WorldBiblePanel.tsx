import React from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTabStore } from '@/stores/tabStore';
import { useWorldBibleStore } from '@/stores/worldBibleStore';
import {
  Users,
  Zap,
  Shield,
  MapPin,
  GitFork,
  Link,
  Plus,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const WorldBiblePanel: React.FC = () => {
  const { project } = useProjectStore();
  const { openTab } = useTabStore();
  const { addCharacter, addPowerSystem, addFaction, addLocation } = useWorldBibleStore();

  return (
    <div className="h-full overflow-y-auto p-8 max-w-5xl mx-auto bg-[var(--color-surface)]">
      {/* Hero Header */}
      <div className="mb-10 text-center pb-8 border-b border-[var(--color-border)]">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-2 inline-block">
          Hồ Sơ Thiết Lập Cốt Truyện (World Bible)
        </span>
        <h1 className="text-4xl font-heading font-bold text-[var(--color-ink-primary)]">
          {project.title || 'Thế Giới Tiểu Thuyết'}
        </h1>
        <p className="text-sm text-[var(--color-ink-secondary)] mt-2 max-w-xl mx-auto">
          Toàn bộ quy tắc, nhân vật, hệ thống sức mạnh, phân chia giai cấp và mạng lưới liên kết chéo của tác phẩm.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() =>
              openTab({
                type: 'relationship-graph',
                title: 'Sơ Đồ Quan Hệ Nhân Vật',
              })
            }
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-2 shadow-sm"
          >
            <GitFork size={15} /> Mở Sơ Đồ Mạng Lưới Quan Hệ
          </button>
        </div>
      </div>

      {/* Grid Danh mục */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Nhân vật */}
        <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[var(--color-accent)]" />
              <h2 className="font-heading font-bold text-lg text-[var(--color-ink-primary)]">
                Nhân Vật ({project.characters?.length || 0})
              </h2>
            </div>
            <button
              onClick={() => {
                const c = addCharacter();
                openTab({ type: 'character', title: c.name, entityId: c.id });
              }}
              className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] text-[var(--color-accent)] text-xs flex items-center gap-1 font-medium"
            >
              <Plus size={14} /> Thêm mới
            </button>
          </div>

          <div className="space-y-2">
            {project.characters?.slice(0, 5).map((c) => (
              <div
                key={c.id}
                onClick={() => openTab({ type: 'character', title: c.name, entityId: c.id })}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: c.color || '#D97706' }}
                  >
                    {c.name.slice(0, 1)}
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-ink-primary)]">
                    {c.name}
                  </span>
                </div>
                <ArrowRight size={13} className="text-[var(--color-ink-tertiary)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Hệ thống sức mạnh */}
        <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[var(--color-accent)]" />
              <h2 className="font-heading font-bold text-lg text-[var(--color-ink-primary)]">
                Hệ Thống Sức Mạnh ({project.powerSystems?.length || 0})
              </h2>
            </div>
            <button
              onClick={() => {
                const ps = addPowerSystem();
                openTab({ type: 'power-system', title: ps.name, entityId: ps.id });
              }}
              className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] text-[var(--color-accent)] text-xs flex items-center gap-1 font-medium"
            >
              <Plus size={14} /> Thêm mới
            </button>
          </div>

          <div className="space-y-2">
            {project.powerSystems?.slice(0, 5).map((ps) => (
              <div
                key={ps.id}
                onClick={() => openTab({ type: 'power-system', title: ps.name, entityId: ps.id })}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer transition-all"
              >
                <span className="text-xs font-semibold text-[var(--color-ink-primary)]">
                  {ps.name}
                </span>
                <ArrowRight size={13} className="text-[var(--color-ink-tertiary)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Thế lực & Giai cấp */}
        <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[var(--color-accent)]" />
              <h2 className="font-heading font-bold text-lg text-[var(--color-ink-primary)]">
                Thế Lực & Giai Cấp ({project.factions?.length || 0})
              </h2>
            </div>
            <button
              onClick={() => {
                const f = addFaction();
                openTab({ type: 'faction', title: f.name, entityId: f.id });
              }}
              className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] text-[var(--color-accent)] text-xs flex items-center gap-1 font-medium"
            >
              <Plus size={14} /> Thêm mới
            </button>
          </div>

          <div className="space-y-2">
            {project.factions?.slice(0, 5).map((f) => (
              <div
                key={f.id}
                onClick={() => openTab({ type: 'faction', title: f.name, entityId: f.id })}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer transition-all"
              >
                <span className="text-xs font-semibold text-[var(--color-ink-primary)]">
                  {f.name}
                </span>
                <ArrowRight size={13} className="text-[var(--color-ink-tertiary)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Địa danh / Bản đồ */}
        <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[var(--color-accent)]" />
              <h2 className="font-heading font-bold text-lg text-[var(--color-ink-primary)]">
                Địa Danh & Lãnh Thổ ({project.locations?.length || 0})
              </h2>
            </div>
            <button
              onClick={() => {
                const l = addLocation();
                openTab({ type: 'location', title: l.name, entityId: l.id });
              }}
              className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] text-[var(--color-accent)] text-xs flex items-center gap-1 font-medium"
            >
              <Plus size={14} /> Thêm mới
            </button>
          </div>

          <div className="space-y-2">
            {project.locations?.slice(0, 5).map((l) => (
              <div
                key={l.id}
                onClick={() => openTab({ type: 'location', title: l.name, entityId: l.id })}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer transition-all"
              >
                <span className="text-xs font-semibold text-[var(--color-ink-primary)]">
                  {l.name}
                </span>
                <ArrowRight size={13} className="text-[var(--color-ink-tertiary)]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mạng lưới Liên Kết Chéo (Cross-Links Table) */}
      <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]">
        <div className="flex items-center gap-2 mb-3">
          <Link size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-heading font-bold text-lg text-[var(--color-ink-primary)]">
            Mạng Lưới Từ Khóa Liên Kết Chéo ({project.crossLinks?.length || 0})
          </h2>
        </div>
        <p className="text-xs text-[var(--color-ink-secondary)] mb-4">
          Khi các từ khóa này xuất hiện trong trình soạn thảo, bạn có thể giữ <strong>Ctrl + Chuột trái</strong> để nhảy thẳng tới hồ sơ tương ứng.
        </p>

        <div className="flex flex-wrap gap-2">
          {project.crossLinks?.map((cl) => (
            <span
              key={cl.id}
              onClick={() => openTab({ type: cl.targetType, title: cl.term, entityId: cl.targetId })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer transition-colors shadow-2xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
              {cl.term}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

