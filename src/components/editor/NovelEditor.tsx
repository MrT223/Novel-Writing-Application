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

import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore } from '@/stores/editorStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTabStore } from '@/stores/tabStore';
import type { Scene, Chapter } from '@/types';
import { EditorToolbar } from './EditorToolbar';
import { DrawingCanvas } from './DrawingCanvas';
import { FocusModeExtension } from './extensions/focusModeExtension';
import { CustomBulletList } from './extensions/customBulletList';
import { CustomTable } from './extensions/customTable';
import { ExportModal } from '@/components/common/ExportModal';
import {
  Zap,
  Plus,
  BookOpen,
  User,
  Shield,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Trash2,
  Edit2,
  Download,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface NovelEditorProps {
  sceneId?: string;
  chapterId?: string;
}

export const NovelEditor: React.FC<NovelEditorProps> = ({ sceneId, chapterId }) => {
  const { project, updateScene, updateProject, updateChapter, deleteChapter, deleteScene, addScene } = useProjectStore();
  const { setWordCount } = useEditorStore();
  const { settings } = useSettingsStore();
  const { openTab, closeTabsByEntityId, closeTabsByEntityIds } = useTabStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Find target scene and chapter
  let targetScene: Scene | null = null;
  let targetChapter: Chapter | null = null;

  for (const ch of project.chapters) {
    if (chapterId && ch.id === chapterId) {
      targetChapter = ch;
    }
    const found = ch.scenes?.find((s) => s.id === sceneId);
    if (found) {
      targetScene = found;
      targetChapter = ch;
      break;
    }
  }

  if (!targetScene && project.chapters.length > 0 && project.chapters[0].scenes.length > 0) {
    targetChapter = project.chapters[0];
    targetScene = targetChapter.scenes[0];
  }

  // Edit Scene/Chapter Title State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const handleSaveTitle = () => {
    if (tempTitle.trim() && targetScene) {
      updateScene(targetScene.id, { title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };
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

  // Modal thêm thuộc tính vào sức mạnh có sẵn
  const [showAddToPowerModal, setShowAddToPowerModal] = useState(false);
  const [selectedPowerId, setSelectedPowerId] = useState('');
  const [customPropertyName, setCustomPropertyName] = useState('Nguyên lí');
  const [showExportModal, setShowExportModal] = useState(false);

  // Typewriter Mode helper function to keep cursor vertically centered
  const centerCursor = (ed: any) => {
    if (!settings.typewriterMode || !scrollContainerRef.current) return;
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container || !ed?.view?.coordsAtPos) return;
      try {
        const { from } = ed.state.selection;
        const cursorCoords = ed.view.coordsAtPos(from);
        const containerRect = container.getBoundingClientRect();
        const targetY = containerRect.top + containerRect.height / 2;
        const diff = cursorCoords.top - targetY;
        if (Math.abs(diff) > 20) {
          container.scrollTop += diff;
        }
      } catch (e) {
        // Safe catch if editor unmounted
      }
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: { color: 'var(--color-accent)' },
        bulletList: false, // Tắt inputRule tự động chuyển '- ' thành danh sách
      }),
      CustomBulletList,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Bắt đầu đặt bút viết nên huyền thoại của bạn...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--color-crosslink)] underline hover:text-[var(--color-crosslink-hover)] cursor-pointer',
        },
      }),
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
      FocusModeExtension,
    ],
    content: targetScene?.content || '<p></p>',
    onSelectionUpdate: ({ editor }) => {
      centerCursor(editor);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);

      if (targetScene) {
        updateScene(targetScene.id, {
          content: html,
          wordCount: words,
        });
      }

      centerCursor(editor);
    },
  });

  useEffect(() => {
    if (editor && targetScene) {
      if (editor.getHTML() !== targetScene.content) {
        editor.commands.setContent(targetScene.content || '<p></p>');
      }
    }
  }, [targetScene?.id, editor]);

  // Handle Right Click khi bôi đen văn bản
  const handleContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';

    if (text) {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: Math.min(e.clientX, window.innerWidth - 260),
        y: Math.min(e.clientY, window.innerHeight - 300),
        selectedText: text,
      });
    } else {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  // 1. Tạo sức mạnh mới từ đoạn bôi đen làm Tiêu đề
  const handleCreatePowerAsTitle = () => {
    const title = contextMenu.selectedText;
    const newPs = {
      id: uuidv4(),
      name: title,
      properties: [],
      freeformContent: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPowers = [...project.powerSystems, newPs];
    const newLink = {
      id: uuidv4(),
      term: title,
      targetType: 'power-system' as const,
      targetId: newPs.id,
      description: `Hệ thống sức mạnh: ${title}`,
    };

    updateProject({
      powerSystems: updatedPowers,
      crossLinks: [...project.crossLinks, newLink],
    });

    openTab({
      type: 'power-system',
      title: title,
      entityId: newPs.id,
    });

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // 2. Mở popup thêm đoạn văn bản làm nội dung cho 1 sức mạnh đã có
  const handleOpenAddPropertyModal = () => {
    if (project.powerSystems.length === 0) {
      handleCreatePowerAsTitle();
      return;
    }
    setSelectedPowerId(project.powerSystems[0].id);
    setShowAddToPowerModal(true);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Thực hiện thêm đoạn bôi đen làm thuộc tính (nguyên lí, tiêu hao...)
  const handleConfirmAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPowerId || !customPropertyName.trim()) return;

    const targetPs = project.powerSystems.find((p) => p.id === selectedPowerId);
    if (!targetPs) return;

    const newProp = {
      id: uuidv4(),
      name: customPropertyName.trim(),
      content: contextMenu.selectedText,
    };

    const updatedPowers = project.powerSystems.map((p) =>
      p.id === selectedPowerId
        ? {
            ...p,
            properties: [...(p.properties || []), newProp],
            updatedAt: new Date().toISOString(),
          }
        : p
    );

    updateProject({ powerSystems: updatedPowers });
    setShowAddToPowerModal(false);

    openTab({
      type: 'power-system',
      title: targetPs.name,
      entityId: targetPs.id,
    });
  };

  // 3. Tạo nhân vật từ đoạn bôi đen
  const handleCreateCharacter = () => {
    const name = contextMenu.selectedText;
    const newChar = {
      id: uuidv4(),
      name,
      aliases: [],
      role: 'supporting' as const,
      description: '',
      appearance: '',
      personality: '',
      backstory: '',
      goals: '',
      abilities: [],
      relationships: [],
      notes: '',
      color: '#D97706',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedChars = [...project.characters, newChar];
    const newLink = {
      id: uuidv4(),
      term: name,
      targetType: 'character' as const,
      targetId: newChar.id,
      description: `Nhân vật: ${name}`,
    };

    updateProject({
      characters: updatedChars,
      crossLinks: [...project.crossLinks, newLink],
    });

    openTab({
      type: 'character',
      title: name,
      entityId: newChar.id,
    });

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Close context menu on outside click
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

      {/* Editor Content Area (Scroll Container) */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-6 py-8 flex justify-center relative cursor-text select-text ${
          settings.typewriterMode ? 'typewriter-mode-active' : ''
        }`}
        style={{
          paddingTop: settings.typewriterMode ? '38vh' : undefined,
          paddingBottom: settings.typewriterMode ? '48vh' : undefined,
        }}
      >
        {/* Drawing Overlay */}
        <DrawingCanvas sceneId={targetScene?.id} scrollContainerRef={scrollContainerRef} />

        <div className="w-full max-w-[760px] pb-32 relative z-20">
          {targetChapter && targetScene && (
            <div className="mb-8 pb-4 border-b border-[var(--color-border)] select-none">
              {/* Chapter Header with Action Buttons */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                    {targetChapter.title}
                  </span>
                  <button
                    onClick={() => {
                      const newTitle = prompt('Đổi tên chương:', targetChapter.title);
                      if (newTitle && newTitle.trim()) {
                        updateChapter(targetChapter.id, { title: newTitle.trim() });
                      }
                    }}
                    className="p-1 text-[var(--color-ink-tertiary)] hover:text-[var(--color-accent)] rounded opacity-60 hover:opacity-100"
                    title="Đổi tên chương này"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => {
                      const s = addScene(targetChapter.id);
                      openTab({ type: 'chapter', title: s.title, entityId: s.id });
                    }}
                    className="p-1 text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] rounded opacity-80 hover:opacity-100 flex items-center gap-1 text-[11px] font-medium"
                    title="Thêm hồi mới vào chương này"
                  >
                    <Plus size={12} /> Thêm hồi
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút Xuất Bản Thảo Chương Này */}
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="p-1 px-2 text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] rounded text-[11px] font-medium flex items-center gap-1 transition-all"
                    title="Xuất chương này hoặc cả tác phẩm ra file TXT, MD, HTML, JSON"
                  >
                    <Download size={12} /> Xuất bản thảo
                  </button>

                  {/* Nút xoá chương */}
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xoá toàn bộ chương "${targetChapter.title}" và các hồi bên trong?`)) {
                        const sceneIds = targetChapter.scenes ? targetChapter.scenes.map((s) => s.id) : [];
                        closeTabsByEntityIds([targetChapter.id, ...sceneIds]);
                        deleteChapter(targetChapter.id);
                      }
                    }}
                    className="p-1 text-[var(--color-destructive)] hover:bg-[var(--color-destructive)] hover:text-white rounded text-[11px] font-medium flex items-center gap-1 opacity-60 hover:opacity-100 transition-all"
                    title="Xoá chương này"
                  >
                    <Trash2 size={12} /> Xoá chương
                  </button>
                </div>
              </div>

              {/* Scene Title with Inline Edit and Delete Scene Button */}
              {isEditingTitle ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="text-2xl font-heading font-bold px-2 py-0.5 rounded bg-[var(--color-canvas)] border border-[var(--color-accent)] outline-none w-full text-[var(--color-ink-primary)]"
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-3 py-1 bg-[var(--color-accent)] text-white text-xs font-bold rounded-lg"
                  >
                    Lưu
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => {
                      setTempTitle(targetScene.title);
                      setIsEditingTitle(true);
                    }}
                    title="Nhấp để đổi tên phân cảnh này"
                  >
                    <h1 className="text-3xl font-heading font-bold text-[var(--color-ink-primary)]">
                      {targetScene.title}
                    </h1>
                    <span className="p-1 text-[var(--color-ink-tertiary)] group-hover:text-[var(--color-accent)]">
                      <Edit2 size={16} />
                    </span>
                  </div>

                  {/* Nút xoá hồi / phân cảnh này */}
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xoá phân cảnh "${targetScene.title}"?`)) {
                        closeTabsByEntityId(targetScene.id);
                        deleteScene(targetScene.id);
                      }
                    }}
                    className="py-1 px-2 text-[var(--color-destructive)] border border-dashed border-[var(--color-destructive)] hover:bg-[var(--color-destructive)] hover:text-white rounded-md text-[11px] font-medium flex items-center gap-1 opacity-70 hover:opacity-100 transition-all"
                    title="Xoá phân cảnh/hồi này"
                  >
                    <Trash2 size={13} /> Xoá hồi này
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TipTap Surface */}
          <EditorContent
            editor={editor}
            className={settings.focusMode ? 'focus-mode-active' : ''}
          />
        </div>
      </div>

      {/* Custom Context Menu khi bôi đen text */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl p-1.5 min-w-[240px] text-xs text-[var(--color-ink-primary)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] border-b border-[var(--color-border)] mb-1 truncate">
            Đã chọn: "{contextMenu.selectedText}"
          </div>

          {/* Option 1: Biến thành Tiêu đề sức mạnh */}
          <button
            onClick={handleCreatePowerAsTitle}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-left font-medium transition-colors"
          >
            <Zap size={14} className="text-[var(--color-accent)]" />
            <span>Tạo tên Hệ Thống Sức Mạnh mới</span>
          </button>

          {/* Option 2: Thêm làm nội dung cho sức mạnh đã có */}
          <button
            onClick={handleOpenAddPropertyModal}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-left font-medium transition-colors"
          >
            <Layers size={14} className="text-blue-500" />
            <span>Thêm làm nội dung cho Sức Mạnh đã có...</span>
          </button>

          <div className="my-1 border-t border-[var(--color-border)]" />

          {/* Option 3: Tạo nhân vật mới */}
          <button
            onClick={handleCreateCharacter}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-left font-medium transition-colors"
          >
            <User size={14} className="text-emerald-500" />
            <span>Tạo Hồ Sơ Nhân Vật mới</span>
          </button>
        </div>
      )}

      {/* Modal chọn gắn nội dung vào mục sức mạnh */}
      {showAddToPowerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleConfirmAddProperty}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md p-6 text-[var(--color-ink-primary)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="font-heading font-bold text-base flex items-center gap-2">
                <Zap size={16} className="text-[var(--color-accent)]" />
                Gán Đoạn Văn Vào Hệ Thống Sức Mạnh
              </h3>
              <button
                type="button"
                onClick={() => setShowAddToPowerModal(false)}
                className="text-xs text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
              >
                Hủy
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Chọn Hệ Thống Sức Mạnh nhận nội dung:
              </label>
              <select
                value={selectedPowerId}
                onChange={(e) => setSelectedPowerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none"
              >
                {project.powerSystems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Tên tiêu đề mục (Tự do đặt tên):
              </label>
              <input
                type="text"
                value={customPropertyName}
                onChange={(e) => setCustomPropertyName(e.target.value)}
                placeholder="VD: Nguyên lí, Năng lượng tiêu hao, Cấm kỵ..."
                className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] mb-1">
                Đoạn trích nội dung đã bôi đen:
              </label>
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-xs text-[var(--color-ink-secondary)] max-h-32 overflow-y-auto italic font-body">
                "{contextMenu.selectedText}"
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddToPowerModal(false)}
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

      {/* Export & Backup Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        currentChapter={targetChapter}
      />
    </div>
  );
};
