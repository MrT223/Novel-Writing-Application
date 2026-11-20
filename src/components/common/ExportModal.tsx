import React, { useState, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTabStore } from '@/stores/tabStore';
import {
  Download,
  Upload,
  FileText,
  FileCode,
  Globe,
  Database,
  Check,
  X,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { exportProject, exportChapter, importProject } from '@/utils/fileOperations';
import type { ExportFormat, Chapter } from '@/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChapter?: Chapter | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  currentChapter,
}) => {
  const { project, updateProject, loadProjectsList } = useProjectStore();
  const { closeAllTabs } = useTabStore();
  const [activeTab, setActiveTab] = useState<'export-all' | 'export-chapter' | 'import'>('export-all');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportAll = (format: ExportFormat) => {
    try {
      exportProject(project, format);
      setExportSuccess(`Đã xuất toàn bộ tác phẩm thành công dưới dạng .${format}!`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCurrentChapter = (format: ExportFormat) => {
    if (!currentChapter) return;
    try {
      exportChapter(currentChapter, format);
      setExportSuccess(`Đã xuất chương "${currentChapter.title}" thành công dưới dạng .${format}!`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      const imported = await importProject(file);
      if (confirm(`Bạn có muốn nạp dữ liệu tác phẩm "${imported.title}" vào ứng dụng không?`)) {
        closeAllTabs();
        updateProject(imported);
        loadProjectsList();
        setExportSuccess(`Đã nhập dữ liệu tác phẩm "${imported.title}" thành công!`);
        setTimeout(() => {
          setExportSuccess(null);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setImportError(err.message || 'File sao lưu không hợp lệ hoặc bị lỗi định dạng.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-[var(--color-ink-primary)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[var(--color-border)] bg-[var(--color-sidebar-bg)]">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-[var(--color-accent)]" />
            <h2 className="font-heading font-bold text-base">
              Xuất Bản Thảo & Sao Lưu Dữ Liệu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)] hover:bg-[var(--color-surface-hover)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-[var(--color-border)] px-6 pt-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('export-all')}
            className={`pb-2.5 transition-all border-b-2 ${
              activeTab === 'export-all'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                : 'border-transparent text-[var(--color-ink-secondary)] hover:text-[var(--color-ink-primary)]'
            }`}
          >
            Xuất Cả Tác Phẩm
          </button>
          {currentChapter && (
            <button
              onClick={() => setActiveTab('export-chapter')}
              className={`pb-2.5 transition-all border-b-2 ${
                activeTab === 'export-chapter'
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                  : 'border-transparent text-[var(--color-ink-secondary)] hover:text-[var(--color-ink-primary)]'
              }`}
            >
              Xuất Chương Hiện Tại
            </button>
          )}
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2.5 transition-all border-b-2 ${
              activeTab === 'import'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                : 'border-transparent text-[var(--color-ink-secondary)] hover:text-[var(--color-ink-primary)]'
            }`}
          >
            Khôi Phục / Nhập Bản Sao Lưu
          </button>
        </div>

        {/* Notification Toast */}
        {exportSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check size={16} className="text-emerald-500 flex-shrink-0" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {importError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'export-all' && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--color-ink-secondary)] leading-relaxed">
                Chọn định dạng bạn muốn xuất toàn bộ nội dung của tác phẩm{' '}
                <strong className="text-[var(--color-ink-primary)] font-heading">"{project.title}"</strong> (bao gồm {project.chapters.length} chương):
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Plain text */}
                <button
                  onClick={() => handleExportAll('txt')}
                  className="flex flex-col items-start p-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all group text-left"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText size={18} className="text-amber-500" />
                    <span className="font-heading font-bold text-xs">Văn Bản Thuần (.txt)</span>
                  </div>
                  <span className="text-[11px] text-[var(--color-ink-secondary)] line-clamp-2">
                    Chuẩn UTF-8 không định dạng, hoàn hảo để copy đăng Webnovel, Wattpad.
                  </span>
                </button>

                {/* Markdown */}
                <button
                  onClick={() => handleExportAll('markdown')}
                  className="flex flex-col items-start p-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all group text-left"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileCode size={18} className="text-blue-500" />
                    <span className="font-heading font-bold text-xs">Markdown (.md)</span>
                  </div>
                  <span className="text-[11px] text-[var(--color-ink-secondary)] line-clamp-2">
                    Giữ cấu trúc H1/H2, in đậm, in nghiêng, trích dẫn chuẩn cho lập trình/Obsidian.
                  </span>
                </button>

                {/* HTML */}
                <button
                  onClick={() => handleExportAll('html')}
                  className="flex flex-col items-start p-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all group text-left"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Globe size={18} className="text-emerald-500" />
                    <span className="font-heading font-bold text-xs">Trang Web Sách (.html)</span>
                  </div>
                  <span className="text-[11px] text-[var(--color-ink-secondary)] line-clamp-2">
                    Định dạng trang sách cổ điển, có thể mở đọc ngay hoặc in ấn lưu trữ PDF.
                  </span>
                </button>

                {/* Backup JSON */}
                <button
                  onClick={() => handleExportAll('json')}
                  className="flex flex-col items-start p-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all group text-left"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database size={18} className="text-purple-500" />
                    <span className="font-heading font-bold text-xs">Sao Lưu Đầy Đủ (.json)</span>
                  </div>
                  <span className="text-[11px] text-[var(--color-ink-secondary)] line-clamp-2">
                    Lưu toàn bộ: cốt truyện, nhân vật, sơ đồ quan hệ, timeline để khôi phục sau này.
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export-chapter' && currentChapter && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--color-ink-secondary)] leading-relaxed">
                Đang chọn chương:{' '}
                <strong className="text-[var(--color-ink-primary)] font-heading">
                  "{currentChapter.title}"
                </strong>{' '}
                ({currentChapter.scenes?.length || 0} hồi/phân cảnh). Chọn định dạng xuất:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExportCurrentChapter('txt')}
                  className="flex flex-col items-start p-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all group text-left"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText size={18} className="text-amber-500" />
                    <span className="font-heading font-bold text-xs">Văn Bản Thuần (.txt)</span>
                  </div>
                  <span className="text-[11px] text-[var(--color-ink-secondary)]">
                    Tải về 1 chương để đăng nhanh hoặc chỉnh sửa riêng.
                  </span>
                </button>

                <button
                  onClick={() => handleExportCurrentChapter('markdown')}
                  className="flex flex-col items-start p-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all group text-left"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileCode size={18} className="text-blue-500" />
                    <span className="font-heading font-bold text-xs">Markdown (.md)</span>
                  </div>
                  <span className="text-[11px] text-[var(--color-ink-secondary)]">
                    Xuất chương kèm định dạng Markdown đầy đủ.
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] mb-2">
                <Upload size={28} />
              </div>

              <div>
                <h3 className="font-heading font-bold text-sm text-[var(--color-ink-primary)]">
                  Nạp Lại Tác Phẩm Từ File Sao Lưu (.json)
                </h3>
                <p className="text-xs text-[var(--color-ink-secondary)] max-w-sm mx-auto mt-1">
                  Chọn file sao lưu dự phòng (.json) đã xuất trước đây để nạp lại đầy đủ bản thảo, nhân vật, sơ đồ quan hệ và timeline.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-white font-semibold text-xs hover:bg-[var(--color-accent-hover)] transition-all shadow-md inline-flex items-center gap-2"
              >
                <Upload size={15} /> Chọn File Sao Lưu (.json)
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-[var(--color-border)] bg-[var(--color-sidebar-bg)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)] transition-colors"
          >
            Đóng Hộp Thoại
          </button>
        </div>
      </div>
    </div>
  );
};
