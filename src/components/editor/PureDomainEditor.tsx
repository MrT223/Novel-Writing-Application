import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Color from '@tiptap/extension-color';
import { CustomTextStyle } from './extensions/customTextStyle';
import { CustomBulletList } from './extensions/customBulletList';
import { CustomTable } from './extensions/customTable';

import { useProjectStore } from '@/stores/projectStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTabStore } from '@/stores/tabStore';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import {
  Zap,
  Globe,
  Shield,
  BookOpen,
  Plus,
  Layers,
  Sparkles,
  Table as TableIcon,
  Check,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { ExtractedCategoryItem, ExtractedDetail } from '@/types';

interface PureDomainEditorProps {
  domain: 'power-system' | 'world-building' | 'faction' | 'plot';
}

export const PureDomainEditor: React.FC<PureDomainEditorProps> = ({ domain }) => {
  const { project, updateProject } = useProjectStore();
  const { settings } = useSettingsStore();
  const { openTab } = useTabStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Lấy tiêu đề và mô tả theo domain
  const getDomainInfo = () => {
    switch (domain) {
      case 'power-system':
        return {
          title: 'Hệ Thống Sức Mạnh',
          subtitle: 'Soạn thảo tự do toàn bộ quy tắc, công thức ma dược, cảnh giới, hạn chế, logic vận hành.',
          fieldKey: 'powerSystem' as const,
          color: 'var(--color-accent)',
          icon: <Zap size={18} className="text-amber-500" />,
        };
      case 'world-building':
        return {
          title: 'World Building & Bối Cảnh Thế Giới',
          subtitle: 'Soạn thảo tự do địa lý, thần thoại, cổ vật, chủng tộc, phong tục, cấu trúc thế giới.',
          fieldKey: 'worldBuilding' as const,
          color: '#2563EB',
          icon: <Globe size={18} className="text-blue-500" />,
        };
      case 'faction':
        return {
          title: 'Thế Lực, Bang Phái & Giai Cấp',
          subtitle: 'Soạn thảo tự do các vương triều, tổ chức ngầm, giáo phái, cấu trúc giai cấp xã hội.',
          fieldKey: 'faction' as const,
          color: '#DC2626',
          icon: <Shield size={18} className="text-red-500" />,
        };
      default:
        return {
          title: 'Cốt Truyện & Đại Cương Tuyến Tính',
          subtitle: 'Soạn thảo tự do dòng sự kiện, đại cương hồi chương, bước ngoặt, nút thắt cao trào.',
          fieldKey: 'plot' as const,
          color: '#9333EA',
          icon: <BookOpen size={18} className="text-purple-500" />,
        };
    }
  };

  const domainInfo = getDomainInfo();
  const rawContent = project.pureTextDomains?.[domainInfo.fieldKey] || '<p></p>';

  // Context Menu khi bôi đen text
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    selectedText: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    selectedText: '',
  });

  // Modal thêm nội dung vào danh mục sẵn có
  const [showAddToModal, setShowAddToModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [customDetailLabel, setCustomDetailLabel] = useState('Công thức');

  // Danh sách các danh mục thuộc riêng domain này
  const domainCategories = (project.extractedCategories || []).filter(
    (c) => c.domain === domain
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: { color: 'var(--color-accent)' },
        bulletList: false,
      }),
      CustomBulletList,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Soạn thảo tự do mọi thông tin theo dòng cảm hứng của bạn tại đây...',
      }),
      Link.configure({ openOnClick: false }),
      CustomTable.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CustomTextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Typography,
    ],
    content: rawContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const currentDomains = project.pureTextDomains || {
        powerSystem: '',
        worldBuilding: '',
        faction: '',
        plot: '',
      };
      updateProject({
        pureTextDomains: {
          ...currentDomains,
          [domainInfo.fieldKey]: html,
        },
      });
    },
  });

  // Tự động đồng bộ nội dung từ store khi chuyển tab hoặc tải lại
  useEffect(() => {
    if (editor) {
      const currentText = project.pureTextDomains?.[domainInfo.fieldKey] || '<p></p>';
      if (editor.getHTML() !== currentText) {
        editor.commands.setContent(currentText);
      }
    }
  }, [domain, editor, project.pureTextDomains]);

  // Bắt sự kiện chuột phải khi bôi đen text
  const handleContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';

    if (text) {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: Math.min(e.clientX, window.innerWidth - 260),
        y: Math.min(e.clientY, window.innerHeight - 280),
        selectedText: text,
      });
    } else {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  // 1. Tạo Danh Mục Mới từ đoạn bôi đen làm tên danh mục
  const handleCreateNewCategory = () => {
    const categoryName = contextMenu.selectedText;
    const newCat: ExtractedCategoryItem = {
      id: uuidv4(),
      name: categoryName,
      domain: domain,
      details: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentCategories = project.extractedCategories || [];
    // Chỉ cập nhật extractedCategories, tuyệt đối KHÔNG đụng đến pureTextDomains
    updateProject({
      extractedCategories: [...currentCategories, newCat],
    });

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // 2. Mở modal thêm đoạn bôi đen vào danh mục sẵn có
  const handleOpenAddToExisting = () => {
    if (domainCategories.length === 0) {
      handleCreateNewCategory();
      return;
    }
    setSelectedCategoryId(domainCategories[0].id);
    setShowAddToModal(true);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // 3. Xác nhận gán nội dung vào danh mục với nhãn tự do
  const handleConfirmAddToCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !customDetailLabel.trim()) return;

    const newDetail: ExtractedDetail = {
      id: uuidv4(),
      label: customDetailLabel.trim(),
      content: contextMenu.selectedText,
      addedAt: new Date().toISOString(),
    };

    const updatedCategories = (project.extractedCategories || []).map((cat) => {
      if (cat.id !== selectedCategoryId) return cat;
      return {
        ...cat,
        details: [...cat.details, newDetail],
        updatedAt: new Date().toISOString(),
      };
    });

    // Chỉ cập nhật extractedCategories, bảo toàn nguyên vẹn 100% văn bản đang soạn
    updateProject({ extractedCategories: updatedCategories });
    setShowAddToModal(false);
  };

  // Đóng context menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div
      className="flex flex-col flex-1 h-full overflow-hidden relative bg-[var(--color-surface)]"
      onContextMenu={handleContextMenu}
    >
      {/* Editor Toolbar */}
      {settings.showToolbar && <EditorToolbar editor={editor} />}

      {/* Editor Content Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-8 flex justify-center relative cursor-text select-text"
      >
        <div className="w-full max-w-[800px] pb-32">
          {/* Header Banner */}
          <div className="mb-8 pb-4 border-b border-[var(--color-border)] select-none flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {domainInfo.icon}
                <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-accent)]">
                  {domainInfo.title}
                </span>
              </div>
              <p className="text-xs text-[var(--color-ink-secondary)]">
                {domainInfo.subtitle}
              </p>
            </div>

            {/* Nút xem bảng tổng hợp dữ liệu trích xuất của riêng mục này */}
            <button
              onClick={() =>
                openTab({
                  type: 'category-matrix',
                  title: `Bảng Dữ Liệu: ${domainInfo.title}`,
                })
              }
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-xs font-semibold text-[var(--color-ink-primary)] hover:border-[var(--color-accent)] flex items-center gap-1.5 shadow-2xs"
              title="Xem bảng trực quan các danh mục đã trích xuất"
            >
              <TableIcon size={14} className="text-[var(--color-accent)]" />
              <span>Xem Dạng Bảng ({domainCategories.length})</span>
            </button>
          </div>

          {/* TipTap Editor Surface */}
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Context Menu khi bôi đen */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl p-1.5 min-w-[260px] text-xs text-[var(--color-ink-primary)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] border-b border-[var(--color-border)] mb-1 truncate">
            Trích xuất: "{contextMenu.selectedText}"
          </div>

          {/* 1. Tạo thành danh mục mới */}
          <button
            onClick={handleCreateNewCategory}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-left font-medium transition-colors"
          >
            <Plus size={14} className="text-[var(--color-accent)]" />
            <span>Tạo thành Danh Mục Mới (Tiêu đề)</span>
          </button>

          {/* 2. Thêm vào danh mục sẵn có */}
          <button
            onClick={handleOpenAddToExisting}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-left font-medium transition-colors"
          >
            <Layers size={14} className="text-blue-500" />
            <span>Thêm vào Danh Mục Sẵn Có...</span>
          </button>
        </div>
      )}

      {/* Modal Thêm vào Danh mục sẵn có với nhãn tùy biến */}
      {showAddToModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleConfirmAddToCategory}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md p-6 text-[var(--color-ink-primary)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="font-heading font-bold text-base flex items-center gap-2">
                <Layers size={16} className="text-[var(--color-accent)]" />
                Thêm Nội Dung Vào Danh Mục
              </h3>
              <button
                type="button"
                onClick={() => setShowAddToModal(false)}
                className="text-xs text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
              >
                Hủy
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Chọn danh mục sẵn có:
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none"
              >
                {domainCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.details.length} mục)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Nhãn phân loại nội dung (Tác giả tự do đặt):
              </label>
              <input
                type="text"
                value={customDetailLabel}
                onChange={(e) => setCustomDetailLabel(e.target.value)}
                placeholder="VD: Công thức, Phương thức, Nguyên liệu, Tác dụng phụ, Yêu cầu..."
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Đoạn trích dẫn:
              </label>
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-xs text-[var(--color-ink-secondary)] max-h-32 overflow-y-auto italic font-body">
                "{contextMenu.selectedText}"
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddToModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)]"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Xác Nhận Thêm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

