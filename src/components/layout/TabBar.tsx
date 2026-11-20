import React, { useRef } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { useProjectStore } from '@/stores/projectStore';
import {
  BookOpen,
  User,
  Zap,
  Shield,
  MapPin,
  GitFork,
  FileText,
  X,
  Plus,
} from 'lucide-react';
import type { TabType } from '@/types';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, openTab } = useTabStore();
  const { project, addScene, addChapter } = useProjectStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleNewTab = () => {
    if (project.chapters.length > 0) {
      const activeTab = tabs.find((t) => t.id === activeTabId);
      let targetChapter = project.chapters[0];
      if (activeTab?.type === 'chapter') {
        const found = project.chapters.find(
          (ch) => ch.id === activeTab.entityId || ch.scenes?.some((s) => s.id === activeTab.entityId)
        );
        if (found) targetChapter = found;
      }
      const s = addScene(targetChapter.id);
      openTab({ type: 'chapter', title: s.title, entityId: s.id });
    } else {
      const ch = addChapter();
      openTab({ type: 'chapter', title: ch.title, entityId: ch.id });
    }
  };

  const getIcon = (type: TabType) => {
    switch (type) {
      case 'chapter':
        return <BookOpen size={14} className="text-[var(--color-accent)]" />;
      case 'character':
        return <User size={14} className="text-blue-500" />;
      case 'power-system':
        return <Zap size={14} className="text-amber-500" />;
      case 'faction':
        return <Shield size={14} className="text-red-500" />;
      case 'location':
        return <MapPin size={14} className="text-emerald-500" />;
      case 'relationship-graph':
        return <GitFork size={14} className="text-purple-500" />;
      default:
        return <FileText size={14} className="text-stone-400" />;
    }
  };

  return (
    <div className="flex items-center h-10 border-b border-[var(--color-border)] bg-[var(--color-sidebar-bg)] select-none px-2 overflow-hidden">
      {/* Tabs Container */}
      <div
        ref={scrollRef}
        onWheel={(e) => {
          if (scrollRef.current && e.deltaY !== 0) {
            scrollRef.current.scrollLeft += e.deltaY;
          }
        }}
        className="flex items-center gap-1 overflow-x-auto overflow-y-hidden flex-1 no-scrollbar h-full"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 h-8 text-xs rounded-t-lg transition-all cursor-pointer border-t border-l border-r border-transparent ${
                isActive
                  ? 'bg-[var(--color-surface)] border-[var(--color-border)] font-semibold text-[var(--color-ink-primary)] shadow-2xs'
                  : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {getIcon(tab.type)}
              <span className="truncate max-w-[130px]">{tab.title}</span>

              {/* Dirty indicator */}
              {tab.isDirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
              )}

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* New Tab Button */}
      <button
        onClick={handleNewTab}
        className="p-1.5 rounded-md hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] transition-colors ml-1"
        title="Tạo thêm phân cảnh mới (Tab mới)"
      >
        <Plus size={15} />
      </button>
    </div>
  );
};

