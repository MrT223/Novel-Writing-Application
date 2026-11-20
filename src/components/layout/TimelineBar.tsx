import React, { useRef, useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTimelineStore } from '@/stores/timelineStore';
import { useTabStore } from '@/stores/tabStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  X,
  Trash2,
  Calendar,
  FileText,
  Tag,
} from 'lucide-react';

const PRESET_COLORS = ['#D97706', '#DC2626', '#2563EB', '#059669', '#7C3AED', '#EA580C'];

export const TimelineBar: React.FC = () => {
  const { project } = useProjectStore();
  const {
    addEvent,
    selectedEventId,
    selectEvent,
    updateEvent,
    deleteEvent,
    zoomLevel,
    setZoom,
  } = useTimelineStore();
  const { openTab } = useTabStore();
  const { settings, toggleTimeline } = useSettingsStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const events = project.timelineEvents || [];
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  if (!settings.showTimeline) {
    return (
      <div className="h-7 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-3 select-none">
        <button
          onClick={toggleTimeline}
          className="flex items-center gap-1.5 text-xs text-[var(--color-ink-secondary)] hover:text-[var(--color-ink-primary)] font-medium"
        >
          <Clock size={13} className="text-[var(--color-accent)]" />
          <span>Mở Dòng Thời Gian Lịch Sử Thế Giới (Timeline - Ctrl+J)</span>
          <ChevronUp size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="h-36 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col select-none relative z-30">
      {/* Floating Edit Popover - Hiển thị nổi bên trên TimelineBar, không bị tràn hoặc cắt bởi overflow */}
      {selectedEvent && (
        <div className="absolute bottom-full left-8 mb-2 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-border)]">
            <span className="text-xs font-bold text-[var(--color-ink-primary)] flex items-center gap-1.5">
              <Clock size={13} className="text-[var(--color-accent)]" />
              Chi Tiết Mốc Thời Gian
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn xoá mốc sự kiện "${selectedEvent.title}"?`)) {
                    deleteEvent(selectedEvent.id);
                  }
                }}
                className="p-1 rounded text-[var(--color-destructive)] hover:bg-[var(--color-destructive)] hover:text-white transition-colors"
                title="Xoá mốc sự kiện này"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={() => selectEvent(null)}
                className="p-1 rounded text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
                title="Đóng hộp thoại"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {/* Tên sự kiện */}
            <div>
              <label className="text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] block mb-0.5">
                Tên Mốc Biến Cố
              </label>
              <input
                type="text"
                value={selectedEvent.title}
                onChange={(e) => updateEvent(selectedEvent.id, { title: e.target.value })}
                placeholder="VD: Trận chiến Vạn Hồn Sơn..."
                className="w-full px-2 py-1 rounded bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-primary)] font-semibold outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            {/* Niên đại / Thời gian */}
            <div>
              <label className="text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] block mb-0.5">
                Thời Điểm / Niên Đại
              </label>
              <input
                type="text"
                value={selectedEvent.date}
                onChange={(e) => updateEvent(selectedEvent.id, { date: e.target.value })}
                placeholder="VD: Năm Thiên Lịch 1024, Kỷ nguyên thứ 3..."
                className="w-full px-2 py-1 rounded bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-primary)] font-mono outline-none focus:border-[var(--color-accent)] text-[11px]"
              />
            </div>

            {/* Mô tả sự kiện */}
            <div>
              <label className="text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] block mb-0.5">
                Tóm Tắt Diễn Biến
              </label>
              <textarea
                value={selectedEvent.description || ''}
                onChange={(e) => updateEvent(selectedEvent.id, { description: e.target.value })}
                placeholder="Mô tả tóm tắt sự kiện, nhân vật tham gia, kết quả biến cố..."
                rows={2}
                className="w-full px-2 py-1 rounded bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)] text-[11px] resize-none"
              />
            </div>

            {/* Chọn màu sắc node */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[var(--color-ink-tertiary)]">Màu mốc:</span>
              <div className="flex items-center gap-1.5">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => updateEvent(selectedEvent.id, { color: col })}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      selectedEvent.color === col ? 'scale-125 ring-2 ring-offset-1 ring-[var(--color-accent)]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="h-7 border-b border-[var(--color-border)] flex items-center justify-between px-3 text-xs bg-[var(--color-surface)]">
        <div className="flex items-center gap-2 font-semibold text-[var(--color-ink-primary)]">
          <Clock size={14} className="text-[var(--color-accent)]" />
          <span>Dòng Thời Gian Lịch Sử & Sự Kiện (World Building Timeline)</span>
          <span className="text-[10px] text-[var(--color-ink-tertiary)] font-normal">
            ({events.length} mốc)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-r border-[var(--color-border)] pr-2">
            <button
              onClick={() => setZoom(zoomLevel - 0.2)}
              className="p-1 hover:bg-[var(--color-surface-hover)] rounded text-[var(--color-ink-secondary)]"
              title="Thu nhỏ"
            >
              <ZoomOut size={13} />
            </button>
            <span
              onClick={() => setZoom(1)}
              className="text-[10px] font-mono text-[var(--color-ink-tertiary)] w-8 text-center cursor-pointer hover:text-[var(--color-accent)]"
              title="Nhấp để reset 100%"
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoom(zoomLevel + 0.2)}
              className="p-1 hover:bg-[var(--color-surface-hover)] rounded text-[var(--color-ink-secondary)]"
              title="Phóng to"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Add Event */}
          <button
            onClick={() => {
              const ev = addEvent({
                title: 'Biến cố mới',
                date: 'Niên đại chưa rõ',
                description: '',
              });
              selectEvent(ev.id);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:opacity-90"
          >
            <Plus size={12} /> Thêm mốc
          </button>

          {/* Collapse */}
          <button
            onClick={toggleTimeline}
            className="p-1 hover:bg-[var(--color-surface-hover)] rounded text-[var(--color-ink-secondary)]"
            title="Thu gọn timeline (Ctrl+J)"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Horizontal Timeline Track */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto relative flex items-center px-8"
      >
        {/* The horizontal line */}
        <div className="absolute left-0 right-0 h-0.5 bg-[var(--color-border)] top-1/2 -translate-y-1/2" />

        {/* Empty state when no events */}
        {events.length === 0 && (
          <div className="w-full text-center text-xs text-[var(--color-ink-tertiary)] italic relative z-10">
            Chưa có mốc thời gian nào — Bấm <span className="text-[var(--color-accent)] font-semibold">+ Thêm mốc</span> để bắt đầu tạo niên biểu lịch sử thế giới.
          </div>
        )}

        {/* Nodes Container */}
        {events.length > 0 && (
          <div
            className="flex items-center gap-16 min-w-max relative z-10 py-2"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'left center' }}
          >
            {events.map((ev) => {
              const isSelected = ev.id === selectedEventId;
              return (
                <div
                  key={ev.id}
                  onClick={() => selectEvent(isSelected ? null : ev.id)}
                  className="flex flex-col items-center cursor-pointer group relative py-1"
                >
                  {/* Era / Date label on top */}
                  <span className="text-[10px] text-[var(--color-ink-tertiary)] font-mono mb-1 truncate max-w-[120px]">
                    {ev.date}
                  </span>

                  {/* Node Circle */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-[var(--color-surface)] ${
                      isSelected
                        ? 'scale-125 border-[var(--color-accent)] ring-4 ring-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] group-hover:scale-110 group-hover:border-[var(--color-accent)]'
                    }`}
                    style={{ borderColor: ev.color || 'var(--color-accent)' }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ev.color || 'var(--color-accent)' }}
                    />
                  </div>

                  {/* Event Title Below */}
                  <span className={`text-xs font-semibold mt-1.5 truncate max-w-[140px] text-center ${
                    isSelected ? 'text-[var(--color-accent)] underline' : 'text-[var(--color-ink-primary)]'
                  }`}>
                    {ev.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

