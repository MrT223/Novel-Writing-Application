import React, { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTabStore } from '@/stores/tabStore';
import {
  Zap,
  Globe,
  Shield,
  BookOpen,
  Plus,
  Trash2,
  Table,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Search,
  Network,
} from 'lucide-react';
import type { ExtractedCategoryItem } from '@/types';

interface CategoryMatrixViewProps {
  initialDomain?: 'all' | 'power-system' | 'world-building' | 'faction' | 'plot';
}

export const CategoryMatrixView: React.FC<CategoryMatrixViewProps> = ({
  initialDomain = 'all',
}) => {
  const { project, updateProject } = useProjectStore();
  const { openTab } = useTabStore();

  const [filterDomain, setFilterDomain] = useState<string>(initialDomain);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const categories = project.extractedCategories || [];

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = categories.filter((item) => {
    const matchesDomain = filterDomain === 'all' || item.domain === filterDomain;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.some(
        (d) =>
          d.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesDomain && matchesSearch;
  });

  const getDomainBadge = (domain: string) => {
    switch (domain) {
      case 'power-system':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
            <Zap size={11} /> Hệ Thống Sức Mạnh
          </span>
        );
      case 'world-building':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
            <Globe size={11} /> World Building
          </span>
        );
      case 'faction':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1">
            <Shield size={11} /> Thế Lực / Bang Phái
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center gap-1">
            <BookOpen size={11} /> Cốt Truyện / Tuyến Tính
          </span>
        );
    }
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Bạn có chắc muốn xoá danh mục này?')) {
      const updated = categories.filter((c) => c.id !== id);
      updateProject({ extractedCategories: updated });
    }
  };

  const handleDeleteDetail = (itemId: string, detailId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id !== itemId) return cat;
      return {
        ...cat,
        details: cat.details.filter((d) => d.id !== detailId),
      };
    });
    updateProject({ extractedCategories: updated });
  };

  return (
    <div className="h-full overflow-y-auto p-8 max-w-6xl mx-auto bg-[var(--color-surface)]">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--color-border)] mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1">
            <Table size={16} /> Bảng Dữ Liệu Trực Quan Hóa (Matrix View)
          </div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-ink-primary)]">
            Tổng Hợp Danh Mục & Thuộc Tính Trích Xuất
          </h1>
          <p className="text-xs text-[var(--color-ink-secondary)] mt-1">
            Tất cả các danh mục và thuộc tính (công thức, nguyên liệu, năng lượng tiêu hao...) được bạn bôi đen trích xuất từ văn bản.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-xs text-[var(--color-ink-primary)]">
            <Search size={14} className="text-[var(--color-ink-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên danh mục, nội dung..."
              className="bg-transparent outline-none w-44 text-xs"
            />
          </div>

          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="text-xs p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none"
          >
            <option value="all">Tất cả phân khu</option>
            <option value="power-system">Hệ Thống Sức Mạnh</option>
            <option value="world-building">World Building</option>
            <option value="faction">Thế Lực / Bang Phái</option>
            <option value="plot">Cốt Truyện</option>
          </select>

          {/* Nút chuyển nhanh sang Sơ đồ khái niệm kéo thả */}
          <button
            onClick={() =>
              openTab({
                type: 'world-bible-diagram',
                title: 'Sơ Đồ Khái Niệm Bối Cảnh',
              })
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors shadow-2xs whitespace-nowrap"
            title="Mở sơ đồ khái niệm kéo thả"
          >
            <Network size={14} />
            <span>Xem Dạng Sơ Đồ</span>
          </button>
        </div>
      </div>

      {/* Grid Cards / Table Presentation */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl">
          <Layers size={36} className="text-[var(--color-ink-tertiary)] mx-auto mb-2 opacity-50" />
          <h3 className="font-heading font-semibold text-base text-[var(--color-ink-primary)]">
            Chưa có danh mục nào được trích xuất
          </h3>
          <p className="text-xs text-[var(--color-ink-secondary)] mt-1 max-w-md mx-auto">
            Khi bạn soạn thảo trong các mục <strong>Hệ Thống Sức Mạnh</strong>, <strong>World Building</strong>, <strong>Thế Lực</strong> hoặc <strong>Cốt Truyện</strong>, hãy bôi đen một đoạn văn bản và nhấp chuột phải để tạo danh mục hoặc thêm nội dung!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((item) => {
            const isExpanded = expandedItems[item.id] !== false; // default expanded
            return (
              <div
                key={item.id}
                className="border border-[var(--color-border)] rounded-xl bg-[var(--color-canvas)] shadow-2xs overflow-hidden"
              >
                {/* Item Header */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="flex items-center justify-between p-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] cursor-pointer select-none hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-[var(--color-ink-secondary)]" />
                    ) : (
                      <ChevronRight size={16} className="text-[var(--color-ink-secondary)]" />
                    )}
                    <h3 className="font-heading font-bold text-base text-[var(--color-ink-primary)]">
                      {item.name}
                    </h3>
                    {getDomainBadge(item.domain)}
                    <span className="text-[11px] text-[var(--color-ink-tertiary)]">
                      ({item.details.length} mục nội dung)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[var(--color-destructive)] hover:text-white text-[var(--color-ink-tertiary)] transition-colors"
                      title="Xoá danh mục này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Details Table view */}
                {isExpanded && (
                  <div className="p-4">
                    {item.details.length === 0 ? (
                      <div className="text-xs text-[var(--color-ink-tertiary)] italic py-2">
                        Chưa có nội dung chi tiết. Hãy bôi đen thêm đoạn văn bản và thêm vào danh mục này.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--color-border)] text-[11px] uppercase tracking-wider text-[var(--color-ink-tertiary)]">
                              <th className="py-2 px-3 w-48">Phân Loại / Tiêu Đề Mục</th>
                              <th className="py-2 px-3">Trích Dẫn Nội Dung Diễn Giải</th>
                              <th className="py-2 px-3 w-28 text-right">Thời Gian</th>
                              <th className="py-2 px-2 w-10 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border)] text-xs">
                            {item.details.map((detail) => (
                              <tr
                                key={detail.id}
                                className="hover:bg-[var(--color-surface)] transition-colors group"
                              >
                                <td className="py-3 px-3 font-semibold text-[var(--color-accent)] align-top">
                                  {detail.label}
                                </td>
                                <td className="py-3 px-3 text-[var(--color-ink-primary)] font-body leading-relaxed whitespace-pre-wrap align-top">
                                  {detail.content}
                                </td>
                                <td className="py-3 px-3 text-[10px] text-[var(--color-ink-tertiary)] font-mono text-right align-top">
                                  {new Date(detail.addedAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-2 text-center align-top">
                                  <button
                                    onClick={() => handleDeleteDetail(item.id, detail.id)}
                                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-[var(--color-destructive)] text-[var(--color-ink-tertiary)] transition-opacity"
                                    title="Xoá mục này"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

