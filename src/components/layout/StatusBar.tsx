import React, { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore } from '@/stores/editorStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  Check,
  Moon,
  Sun,
  Coffee,
  Edit2,
  Clock,
  Maximize2,
  Minimize2,
  Save,
  Target,
} from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { project, updateProject, isDirty, lastSaved, markClean } = useProjectStore();
  const { wordCount } = useEditorStore();
  const { settings, setTheme, toggleTimeline, toggleZenMode } = useSettingsStore();
  const [showSaveNotice, setShowSaveNotice] = useState(false);

  // Total project word count
  const totalWords = project.chapters.reduce(
    (total, ch) => total + (ch.scenes ? ch.scenes.reduce((cTotal, s) => cTotal + (s.wordCount || 0), 0) : 0),
    0
  );

  const goal = project.wordCountGoal || 50000;
  const progressPercent = Math.min(100, Math.round((totalWords / goal) * 100));

  const handleManualSave = () => {
    markClean();
    setShowSaveNotice(true);
    setTimeout(() => setShowSaveNotice(false), 2000);
  };

  const handleChangeGoal = () => {
    const newGoal = prompt('Nhập mục tiêu số từ mới cho toàn bộ tác phẩm:', String(goal));
    if (newGoal && !isNaN(Number(newGoal)) && Number(newGoal) > 0) {
      updateProject({ wordCountGoal: Number(newGoal) });
    }
  };

  return (
    <footer className="h-7 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-3 text-[11px] select-none text-[var(--color-ink-secondary)] relative z-20">
      {/* Cụm thống kê số từ & Mục tiêu (Có thể tương tác) */}
      <div className="flex items-center gap-3">
        {/* Số từ phân cảnh hiện tại */}
        <span title="Số từ trong phân cảnh đang mở">
          Phân cảnh:{' '}
          <strong className="text-[var(--color-ink-primary)] font-mono">{wordCount}</strong> từ
        </span>

        <span className="text-[var(--color-border)]">•</span>

        {/* Tổng số từ toàn bộ tác phẩm */}
        <span title="Tổng số từ của tất cả các chương hồi đã viết">
          Toàn bộ bản thảo:{' '}
          <strong className="text-[var(--color-ink-primary)] font-mono">{totalWords}</strong> từ
        </span>

        <span className="text-[var(--color-border)]">•</span>

        {/* Mục tiêu số từ (Bấm vào để đổi mục tiêu) */}
        <button
          onClick={handleChangeGoal}
          className="flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors group cursor-pointer"
          title="Nhấp để thay đổi mục tiêu số lượng từ của tác phẩm"
        >
          <Target size={11} className="text-[var(--color-accent)]" />
          <span>
            Mục tiêu:{' '}
            <strong className="text-[var(--color-accent)] font-mono">{goal.toLocaleString()}</strong> từ
          </span>
          <span className="text-[10px] text-[var(--color-ink-tertiary)] font-mono">
            ({progressPercent}%)
          </span>
          <Edit2 size={10} className="opacity-0 group-hover:opacity-100 text-[var(--color-accent)]" />
        </button>

        {/* Thanh tiến độ mini */}
        <div
          className="w-16 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden hidden sm:block"
          title={`Đã hoàn thành ${progressPercent}% mục tiêu`}
        >
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Trạng thái lưu, Chuyển theme, và Phím tắt công cụ */}
      <div className="flex items-center gap-3">
        {/* Trạng thái lưu (Bấm vào để lưu ngay) */}
        <button
          onClick={handleManualSave}
          className="flex items-center gap-1 hover:text-[var(--color-ink-primary)] transition-colors cursor-pointer"
          title="Nhấp để lưu dữ liệu ngay lập tức"
        >
          {isDirty ? (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Đang cập nhật...
            </span>
          ) : showSaveNotice ? (
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <Save size={11} /> Đã lưu thành công!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Check size={12} /> Đã lưu an toàn
            </span>
          )}
        </button>

        <span className="text-[var(--color-border)]">•</span>

        {/* Bật/Tắt Timeline nhanh */}
        <button
          onClick={toggleTimeline}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer ${
            settings.showTimeline
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold'
              : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]'
          }`}
          title="Bật / Tắt Dòng thời gian lịch sử (Timeline - Ctrl+J)"
        >
          <Clock size={12} />
          <span className="hidden md:inline text-[10px]">Timeline</span>
        </button>

        {/* Bật/Tắt Zen Mode (Toàn màn hình tập trung) */}
        <button
          onClick={toggleZenMode}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer ${
            settings.zenMode
              ? 'bg-[var(--color-accent)] text-white font-semibold'
              : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]'
          }`}
          title="Chế độ viết tập trung (Zen Mode - Ẩn mọi xao nhãng)"
        >
          {settings.zenMode ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          <span className="hidden md:inline text-[10px]">Zen</span>
        </button>

        <span className="text-[var(--color-border)]">•</span>

        {/* Bộ chuyển đổi 3 Chủ đề (Theme Switcher) với phản hồi rõ ràng */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)]">
          <button
            onClick={() => setTheme('light')}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              settings.theme === 'light'
                ? 'bg-[var(--color-surface)] text-amber-600 shadow-2xs font-bold'
                : 'text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]'
            }`}
            title="Chủ đề Giấy ấm (Warm Paper / Sáng)"
          >
            <Sun size={12} />
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              settings.theme === 'dark'
                ? 'bg-[var(--color-surface)] text-amber-500 shadow-2xs font-bold'
                : 'text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]'
            }`}
            title="Chủ đề Đêm tối dịu mắt (Dark Mode / Viết đêm)"
          >
            <Moon size={12} />
          </button>

          <button
            onClick={() => setTheme('sepia')}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              settings.theme === 'sepia'
                ? 'bg-[var(--color-surface)] text-amber-700 shadow-2xs font-bold'
                : 'text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]'
            }`}
            title="Chủ đề Trang sách cổ (Sepia Parchment)"
          >
            <Coffee size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
};
