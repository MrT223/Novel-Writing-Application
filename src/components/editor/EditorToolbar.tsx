import React, { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Table as TableIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  PenTool,
  Maximize2,
  Eye,
  Type,
  Link2,
  Unlink,
  RemoveFormatting,
  Palette,
  Highlighter,
  ChevronDown,
  Rows,
  Columns,
  Trash2,
  Plus,
  Combine,
  Split,
  Code,
  Indent,
  X,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useSettingsStore } from '@/stores/settingsStore';

interface EditorToolbarProps {
  editor: Editor | null;
}

const TEXT_COLORS = [
  { name: 'Mặc định', color: '' },
  { name: 'Đen Mực', color: '#0F172A' },
  { name: 'Đỏ Thẫm', color: '#DC2626' },
  { name: 'Cam Lửa', color: '#EA580C' },
  { name: 'Hổ Phách', color: '#D97706' },
  { name: 'Xanh Lục', color: '#16A34A' },
  { name: 'Xanh Lam', color: '#2563EB' },
  { name: 'Tím Hoàng Gia', color: '#9333EA' },
  { name: 'Hồng Phấn', color: '#DB2777' },
  { name: 'Xám Trầm', color: '#64748B' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Vàng Dạ Quang', color: '#FEF08A' },
  { name: 'Xanh Lá Tươi', color: '#BBF7D0' },
  { name: 'Xanh Biển Dịu', color: '#BFDBFE' },
  { name: 'Hồng Ngọt Ngào', color: '#FBCFE8' },
  { name: 'Tím Mộng Mơ', color: '#DDD6FE' },
  { name: 'Cam Nhạt', color: '#FED7AA' },
];

const FONT_FAMILIES = [
  { label: 'Phông mặc định', value: '' },
  { label: 'Serif (Tiểu thuyết)', value: "'Merriweather', 'Lora', 'Georgia', serif" },
  { label: 'Sans-Serif (Hiện đại)', value: "'Inter', -apple-system, sans-serif" },
  { label: 'Monospace (Máy chữ)', value: "'JetBrains Mono', Courier, monospace" },
];

const FONT_SIZES = [
  { label: '13px (Nhỏ)', value: '13px' },
  { label: '14px (Gọn)', value: '14px' },
  { label: '16px (Chuẩn)', value: '16px' },
  { label: '18px (Vừa)', value: '18px' },
  { label: '20px (Lớn)', value: '20px' },
  { label: '24px (Tiêu đề phụ)', value: '24px' },
  { label: '28px (Tiêu đề lớn)', value: '28px' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const { toggleDrawingMode, isDrawingMode } = useEditorStore();
  const { toggleZenMode, toggleFocusMode, toggleTypewriterMode, settings } = useSettingsStore();

  // Popover States
  const [showTableModal, setShowTableModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Fixed Anchor Coordinates for popovers (never clipped by overflow!)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const tableBtnRef = useRef<HTMLButtonElement>(null);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const highlightBtnRef = useRef<HTMLButtonElement>(null);
  const linkBtnRef = useRef<HTMLButtonElement>(null);

  // Table Grid Picker Hover State (like MS Word: hover on grid)
  const [gridRows, setGridRows] = useState(3);
  const [gridCols, setGridCols] = useState(3);
  const [hoverGridRows, setHoverGridRows] = useState(3);
  const [hoverGridCols, setHoverGridCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);

  // Close popovers on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.fixed') &&
        !tableBtnRef.current?.contains(target) &&
        !colorBtnRef.current?.contains(target) &&
        !highlightBtnRef.current?.contains(target) &&
        !linkBtnRef.current?.contains(target)
      ) {
        setShowTableModal(false);
        setShowColorPicker(false);
        setShowHighlightPicker(false);
        setShowLinkModal(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTableModal(false);
        setShowColorPicker(false);
        setShowHighlightPicker(false);
        setShowLinkModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!editor) return null;

  const btnClass = (isActive: boolean) =>
    `p-1.5 rounded-md transition-colors text-xs font-medium flex items-center justify-center cursor-pointer ${
      isActive
        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-hover)] font-semibold'
        : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink-primary)]'
    }`;

  const insertSceneBreak = () => {
    editor.chain().focus().insertContent('<p class="scene-break">* * *</p>').run();
  };

  const handleCreateCustomTable = (rows: number, cols: number, hasHeader: boolean) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: Math.max(1, rows), cols: Math.max(1, cols), withHeaderRow: hasHeader })
      .run();
    setShowTableModal(false);
  };

  const toggleTablePopover = () => {
    if (!showTableModal && tableBtnRef.current) {
      const rect = tableBtnRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 6,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - 300)),
      });
    }
    setShowTableModal(!showTableModal);
    setShowColorPicker(false);
    setShowHighlightPicker(false);
    setShowLinkModal(false);
  };

  const toggleColorPopover = () => {
    if (!showColorPicker && colorBtnRef.current) {
      const rect = colorBtnRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 6,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - 220)),
      });
    }
    setShowColorPicker(!showColorPicker);
    setShowTableModal(false);
    setShowHighlightPicker(false);
    setShowLinkModal(false);
  };

  const toggleHighlightPopover = () => {
    if (!showHighlightPicker && highlightBtnRef.current) {
      const rect = highlightBtnRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 6,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - 200)),
      });
    }
    setShowHighlightPicker(!showHighlightPicker);
    setShowTableModal(false);
    setShowColorPicker(false);
    setShowLinkModal(false);
  };

  const toggleLinkPopover = () => {
    if (!showLinkModal && linkBtnRef.current) {
      const rect = linkBtnRef.current.getBoundingClientRect();
      const currentLink = editor.getAttributes('link').href || '';
      setLinkUrl(currentLink);
      setPopoverPos({
        top: rect.bottom + 6,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - 320)),
      });
    }
    setShowLinkModal(!showLinkModal);
    setShowTableModal(false);
    setShowColorPicker(false);
    setShowHighlightPicker(false);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
    }
    setShowLinkModal(false);
  };

  const handleIndent = () => {
    editor.chain().focus().insertContent('&nbsp;&nbsp;&nbsp;&nbsp;').run();
  };

  const isInsideTable = editor.isActive('table');

  return (
    <>
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-toolbar-bg)] select-none overflow-x-auto text-[var(--color-ink-primary)] text-xs relative z-20">
        {/* 1. Hoàn tác / Làm lại */}
        <div className="flex items-center">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={btnClass(false)}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={btnClass(false)}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* 2. Phông chữ & Cỡ chữ (Chuẩn Word) */}
        <div className="flex items-center gap-1">
          {/* Phông chữ */}
          <select
            onChange={(e) => {
              const font = e.target.value;
              if (font) {
                editor.chain().focus().setMark('textStyle', { fontFamily: font }).run();
              } else {
                editor.chain().focus().unsetMark('textStyle').run();
              }
            }}
            className="text-xs py-1 px-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-primary)] outline-none hover:border-[var(--color-accent)] cursor-pointer"
            title="Chọn phông chữ"
          >
            {FONT_FAMILIES.map((f, i) => (
              <option key={i} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Cỡ chữ */}
          <select
            onChange={(e) => {
              const sz = e.target.value;
              if (sz) {
                editor.chain().focus().setMark('textStyle', { fontSize: sz }).run();
              } else {
                editor.chain().focus().unsetMark('textStyle').run();
              }
            }}
            defaultValue="16px"
            className="text-xs py-1 px-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-primary)] outline-none hover:border-[var(--color-accent)] cursor-pointer"
            title="Chọn kích cỡ chữ"
          >
            {FONT_SIZES.map((s, i) => (
              <option key={i} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* 3. Định dạng văn bản: Đậm, Nghiêng, Gạch chân, Gạch ngang, Code */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btnClass(editor.isActive('bold'))}
            title="In đậm (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btnClass(editor.isActive('italic'))}
            title="In nghiêng (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={btnClass(editor.isActive('underline'))}
            title="Gạch chân (Ctrl+U)"
          >
            <UnderlineIcon size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btnClass(editor.isActive('strike'))}
            title="Gạch ngang chữ"
          >
            <Strikethrough size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={btnClass(editor.isActive('code'))}
            title="Chữ mã code"
          >
            <Code size={15} />
          </button>

          {/* Xoá định dạng */}
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className={btnClass(false)}
            title="Xoá toàn bộ định dạng về chữ gốc"
          >
            <RemoveFormatting size={15} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* 4. Màu chữ & Màu Highlight dạ quang */}
        <div className="flex items-center gap-1">
          {/* Chọn màu chữ */}
          <button
            ref={colorBtnRef}
            onClick={toggleColorPopover}
            className={`${btnClass(false)} relative`}
            title="Màu chữ (Font Color)"
          >
            <Palette size={15} />
            <span
              className="w-2.5 h-1 rounded-full absolute bottom-1 right-1"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
          </button>

          {/* Chọn màu Highlight */}
          <button
            ref={highlightBtnRef}
            onClick={toggleHighlightPopover}
            className={`${btnClass(editor.isActive('highlight'))} relative`}
            title="Tô màu dạ quang (Highlight)"
          >
            <Highlighter size={15} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* 5. Tiêu đề H1, H2, H3, Thường */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={btnClass(editor.isActive('paragraph'))}
            title="Văn bản thông thường"
          >
            <Pilcrow size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={btnClass(editor.isActive('heading', { level: 1 }))}
            title="Tiêu đề 1 (H1)"
          >
            <Heading1 size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={btnClass(editor.isActive('heading', { level: 2 }))}
            title="Tiêu đề 2 (H2)"
          >
            <Heading2 size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={btnClass(editor.isActive('heading', { level: 3 }))}
            title="Tiêu đề 3 (H3)"
          >
            <Heading3 size={15} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* 6. Căn lề văn bản (Trái, Giữa, Phải, Đều 2 bên) */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={btnClass(editor.isActive({ textAlign: 'left' }))}
            title="Canh trái"
          >
            <AlignLeft size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={btnClass(editor.isActive({ textAlign: 'center' }))}
            title="Canh giữa"
          >
            <AlignCenter size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={btnClass(editor.isActive({ textAlign: 'right' }))}
            title="Canh phải"
          >
            <AlignRight size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={btnClass(editor.isActive({ textAlign: 'justify' }))}
            title="Canh đều hai bên (Justify)"
          >
            <AlignJustify size={15} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* 7. Danh sách, Thụt lề, Trích dẫn, Liên kết */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnClass(editor.isActive('bulletList'))}
            title="Danh sách dấu chấm"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btnClass(editor.isActive('orderedList'))}
            title="Danh sách đánh số"
          >
            <ListOrdered size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={btnClass(editor.isActive('taskList'))}
            title="Danh sách việc cần làm (Todo Checkbox)"
          >
            <ListTodo size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={btnClass(editor.isActive('blockquote'))}
            title="Đoạn văn trích dẫn"
          >
            <Quote size={15} />
          </button>
          <button
            onClick={handleIndent}
            className={btnClass(false)}
            title="Thụt đầu dòng đoạn văn"
          >
            <Indent size={15} />
          </button>

          {/* Chèn Link */}
          <button
            ref={linkBtnRef}
            onClick={toggleLinkPopover}
            className={btnClass(editor.isActive('link'))}
            title="Chèn hoặc chỉnh sửa liên kết web (Link)"
          >
            <Link2 size={15} />
          </button>

          {/* Dấu ngắt cảnh (* * *) */}
          <button
            onClick={insertSceneBreak}
            className={btnClass(false)}
            title="Chèn dấu ngắt cảnh (* * *)"
          >
            <Minus size={15} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* 8. BẢNG (TABLE) CHUYÊN NGHIỆP NHƯ MICROSOFT WORD */}
        <div className="flex items-center gap-1">
          {/* Nút Tạo Bảng với Lưới Chọn Kích Thước Chuẩn Word */}
          <button
            ref={tableBtnRef}
            onClick={toggleTablePopover}
            className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              showTableModal
                ? 'bg-[var(--color-accent)] text-white'
                : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-primary)] border border-[var(--color-border)]'
            }`}
            title="Chèn bảng biểu với số dòng & số cột tùy chọn (như Word)"
          >
            <TableIcon size={14} className="text-amber-500" />
            <span>Bảng</span>
            <ChevronDown size={11} />
          </button>

          {/* CÔNG CỤ NGỮ CẢNH: Khi con trỏ đang nằm trong bảng, hiện nút thao tác bảng */}
          {isInsideTable && (
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 p-0.5 px-1.5 rounded-lg text-amber-700 dark:text-amber-400 font-semibold text-xs animate-in fade-in">
              <span className="text-[10px] uppercase tracking-wider hidden md:inline">Bảng:</span>

              {/* Thêm hàng */}
              <button
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="p-1 hover:bg-amber-500/20 rounded cursor-pointer"
                title="Thêm 1 hàng phía TRÊN con trỏ"
              >
                <Rows size={13} className="rotate-180" />
              </button>
              <button
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="p-1 hover:bg-amber-500/20 rounded cursor-pointer"
                title="Thêm 1 hàng phía DƯỚI con trỏ"
              >
                <Rows size={13} />
              </button>
              <button
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="p-1 hover:bg-red-500/20 text-red-500 rounded cursor-pointer"
                title="Xoá hàng này"
              >
                <Trash2 size={13} />
              </button>

              <span className="text-amber-500/40">|</span>

              {/* Thêm cột */}
              <button
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="p-1 hover:bg-amber-500/20 rounded cursor-pointer"
                title="Thêm 1 cột bên TRÁI con trỏ"
              >
                <Columns size={13} className="-scale-x-100" />
              </button>
              <button
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="p-1 hover:bg-amber-500/20 rounded cursor-pointer"
                title="Thêm 1 cột bên PHẢI con trỏ"
              >
                <Columns size={13} />
              </button>
              <button
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="p-1 hover:bg-red-500/20 text-red-500 rounded cursor-pointer"
                title="Xoá cột này"
              >
                <Trash2 size={13} />
              </button>

              <span className="text-amber-500/40">|</span>

              {/* Gộp ô / Tách ô */}
              <button
                onClick={() => editor.chain().focus().mergeCells().run()}
                className="p-1 hover:bg-amber-500/20 rounded cursor-pointer"
                title="Gộp các ô đã bôi đen (Merge cells)"
              >
                <Combine size={13} />
              </button>
              <button
                onClick={() => editor.chain().focus().splitCell().run()}
                className="p-1 hover:bg-amber-500/20 rounded cursor-pointer"
                title="Tách ô đã gộp (Split cell)"
              >
                <Split size={13} />
              </button>

              <span className="text-amber-500/40">|</span>

              {/* Xoá cả bảng */}
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xoá toàn bộ bảng này?')) {
                    editor.chain().focus().deleteTable().run();
                  }
                }}
                className="p-1 px-1.5 text-xs text-red-600 hover:bg-red-500/20 rounded flex items-center gap-1 cursor-pointer"
                title="Xoá toàn bộ bảng"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline text-[10px]">Xoá Bảng</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* 9. Chế độ xem & Tập trung (Typewriter, Focus, Drawing, Zen) */}
        <div className="flex items-center gap-1 border-l border-[var(--color-border)] pl-2">
          <button
            onClick={toggleTypewriterMode}
            className={btnClass(settings.typewriterMode)}
            title="Chế độ máy đánh chữ (Cuộn giữ con trỏ ở giữa)"
          >
            <Type size={15} />
          </button>
          <button
            onClick={toggleFocusMode}
            className={btnClass(settings.focusMode)}
            title="Chế độ tiêu điểm (Làm mờ đoạn văn khác)"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={toggleDrawingMode}
            className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDrawingMode
                ? 'bg-[var(--color-accent)] text-white font-bold'
                : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)]'
            }`}
            title="Bật/Tắt chế độ vẽ tay ghi chú trên bản thảo (Chuột MB4)"
          >
            <PenTool size={14} />
            <span className="hidden sm:inline">Vẽ tay (MB4)</span>
          </button>
          <button
            onClick={toggleZenMode}
            className={btnClass(settings.zenMode)}
            title="Chế độ toàn màn hình tĩnh tâm (F11)"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* ========================================================================
          POPOVERS RENDERED AS FIXED (NEVER CLIPPED BY OVERFLOW CONTAINERS)
          ======================================================================== */}

      {/* 1. Popover Bảng (Table Grid & Custom Input) */}
      {showTableModal && (
        <div
          className="fixed p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl z-50 w-72 animate-in fade-in zoom-in-95 duration-100 text-[var(--color-ink-primary)] select-none"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-border)]">
            <span className="text-xs font-bold text-[var(--color-ink-primary)] flex items-center gap-1.5">
              <TableIcon size={14} className="text-[var(--color-accent)]" />
              Chèn Bảng Biểu
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-[var(--color-accent)]">
                {hoverGridCols} cột x {hoverGridRows} hàng
              </span>
              <button
                onClick={() => setShowTableModal(false)}
                className="p-0.5 rounded text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Lưới chọn nhanh chuột (8 cột x 6 hàng) */}
          <div className="mb-3">
            <span className="text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] block mb-1.5">
              Di chuột chọn nhanh lưới ô:
            </span>
            <div
              className="grid grid-cols-8 gap-1 p-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]"
              onMouseLeave={() => {
                setHoverGridRows(gridRows);
                setHoverGridCols(gridCols);
              }}
            >
              {Array.from({ length: 6 }).map((_, rIndex) =>
                Array.from({ length: 8 }).map((_, cIndex) => {
                  const row = rIndex + 1;
                  const col = cIndex + 1;
                  const isSelected = row <= hoverGridRows && col <= hoverGridCols;
                  return (
                    <div
                      key={`${rIndex}-${cIndex}`}
                      onMouseEnter={() => {
                        setHoverGridRows(row);
                        setHoverGridCols(col);
                      }}
                      onClick={() => handleCreateCustomTable(row, col, withHeaderRow)}
                      className={`w-5 h-5 rounded-sm border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--color-accent)] border-[var(--color-accent-hover)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
                      }`}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Hoặc Nhập thủ công số hàng và cột */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[var(--color-ink-secondary)] block font-semibold mb-0.5">
                  Số cột:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={gridCols}
                  onChange={(e) => {
                    const v = Math.max(1, parseInt(e.target.value) || 1);
                    setGridCols(v);
                    setHoverGridCols(v);
                  }}
                  className="w-full p-1 rounded border border-[var(--color-border)] bg-[var(--color-canvas)] text-center font-bold text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-ink-secondary)] block font-semibold mb-0.5">
                  Số hàng:
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={gridRows}
                  onChange={(e) => {
                    const v = Math.max(1, parseInt(e.target.value) || 1);
                    setGridRows(v);
                    setHoverGridRows(v);
                  }}
                  className="w-full p-1 rounded border border-[var(--color-border)] bg-[var(--color-canvas)] text-center font-bold text-xs outline-none"
                />
              </div>
            </div>

            {/* Toggle Hàng Tiêu Đề */}
            <label className="flex items-center gap-2 text-[11px] text-[var(--color-ink-secondary)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={withHeaderRow}
                onChange={(e) => setWithHeaderRow(e.target.checked)}
                className="rounded text-[var(--color-accent)]"
              />
              <span>Có hàng tiêu đề (Header row)</span>
            </label>

            <button
              onClick={() => handleCreateCustomTable(gridRows, gridCols, withHeaderRow)}
              className="w-full py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm cursor-pointer"
            >
              Tạo Bảng {gridCols} cột x {gridRows} hàng
            </button>
          </div>
        </div>
      )}

      {/* 2. Popover Màu Chữ */}
      {showColorPicker && (
        <div
          className="fixed p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 w-48 animate-in fade-in zoom-in-95 duration-100 text-[var(--color-ink-primary)]"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[var(--color-border)]">
            <span className="text-[10px] font-bold uppercase text-[var(--color-ink-tertiary)]">
              Màu Chữ
            </span>
            <button
              onClick={() => setShowColorPicker(false)}
              className="text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
            >
              <X size={12} />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {TEXT_COLORS.filter((c) => c.color).map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  editor.chain().focus().setColor(c.color).run();
                  setShowColorPicker(false);
                }}
                className="w-6 h-6 rounded-md border border-[var(--color-border)] hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
          </div>
          <button
            onClick={() => {
              editor.chain().focus().unsetColor().run();
              setShowColorPicker(false);
            }}
            className="w-full py-1 text-[11px] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-hover)] rounded border border-[var(--color-border)] cursor-pointer"
          >
            Mặc định
          </button>
        </div>
      )}

      {/* 3. Popover Màu Highlight */}
      {showHighlightPicker && (
        <div
          className="fixed p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 w-44 animate-in fade-in zoom-in-95 duration-100 text-[var(--color-ink-primary)]"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[var(--color-border)]">
            <span className="text-[10px] font-bold uppercase text-[var(--color-ink-tertiary)]">
              Màu Dạ Quang
            </span>
            <button
              onClick={() => setShowHighlightPicker(false)}
              className="text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
            >
              <X size={12} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {HIGHLIGHT_COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  editor.chain().focus().toggleHighlight({ color: c.color }).run();
                  setShowHighlightPicker(false);
                }}
                className="w-full h-6 rounded-md border border-[var(--color-border)] hover:scale-105 transition-transform cursor-pointer"
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
          </div>
          <button
            onClick={() => {
              editor.chain().focus().unsetHighlight().run();
              setShowHighlightPicker(false);
            }}
            className="w-full py-1 text-[11px] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-hover)] rounded border border-[var(--color-border)] cursor-pointer"
          >
            Bỏ tô màu
          </button>
        </div>
      )}

      {/* 4. Popover Chèn Link */}
      {showLinkModal && (
        <form
          onSubmit={handleApplyLink}
          className="fixed p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 w-72 space-y-2 animate-in fade-in zoom-in-95 duration-100 text-[var(--color-ink-primary)]"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="flex items-center justify-between pb-1 border-b border-[var(--color-border)]">
            <span className="text-[10px] font-bold uppercase text-[var(--color-ink-tertiary)] block">
              Chèn Liên Kết Web
            </span>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
            >
              <X size={12} />
            </button>
          </div>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
            className="w-full text-xs p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex items-center justify-between pt-1">
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setShowLinkModal(false);
                }}
                className="text-[11px] text-[var(--color-destructive)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Unlink size={12} /> Gỡ link
              </button>
            )}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-2 py-1 text-[11px] rounded hover:bg-[var(--color-surface-hover)] cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 text-[11px] font-bold rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  );
};
