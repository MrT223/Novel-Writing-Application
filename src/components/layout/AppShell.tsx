import React, { useEffect } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProjectStore } from '@/stores/projectStore';
import { TabBar } from './TabBar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { TimelineBar } from './TimelineBar';
import { NovelEditor } from '@/components/editor/NovelEditor';
import { CharacterEditor } from '@/components/worldbible/CharacterEditor';
import { WorldBiblePanel } from '@/components/worldbible/WorldBiblePanel';
import { RelationshipGraph } from '@/components/worldbible/RelationshipGraph';
import { PureDomainEditor } from '@/components/editor/PureDomainEditor';
import { CategoryMatrixView } from '@/components/worldbible/CategoryMatrixView';
import { WorldBibleDiagram } from '@/components/worldbible/WorldBibleDiagram';

export const AppShell: React.FC = () => {
  const { tabs, activeTabId, openTab } = useTabStore();
  const { settings } = useSettingsStore();
  const { project } = useProjectStore();

  // If no tab is open initially, open the first chapter or World Bible
  useEffect(() => {
    if (tabs.length === 0) {
      if (project.chapters.length > 0) {
        const firstScene = project.chapters[0].scenes[0];
        openTab({
          type: 'chapter',
          title: firstScene ? firstScene.title : project.chapters[0].title,
          entityId: firstScene ? firstScene.id : project.chapters[0].id,
        });
      } else {
        openTab({
          type: 'world-bible',
          title: 'World Bible',
        });
      }
    }
  }, [tabs.length, project.chapters, openTab]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Render main content area according to active tab type
  const renderContent = () => {
    if (!activeTab) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-[var(--color-ink-secondary)]">
          <p className="font-heading text-lg">Không có tài liệu nào đang mở.</p>
          <p className="text-xs text-[var(--color-ink-tertiary)] mt-1">
            Chọn một chương hoặc hồ sơ ở thanh bên trái để bắt đầu.
          </p>
        </div>
      );
    }

    switch (activeTab.type) {
      case 'chapter':
        return <NovelEditor sceneId={activeTab.entityId} />;
      case 'character':
        return <CharacterEditor characterId={activeTab.entityId || ''} />;
      case 'power-system':
        return <PureDomainEditor domain="power-system" />;
      case 'world-building':
        return <PureDomainEditor domain="world-building" />;
      case 'faction':
        return <PureDomainEditor domain="faction" />;
      case 'plot':
        return <PureDomainEditor domain="plot" />;
      case 'category-matrix':
        return <CategoryMatrixView />;
      case 'world-bible-diagram':
        return <WorldBibleDiagram />;
      case 'relationship-graph':
        return <RelationshipGraph />;
      case 'world-bible':
      default:
        return <WorldBiblePanel />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-canvas)] text-[var(--color-ink-primary)]">
      {/* Left Sidebar (Hidden in Zen Mode) */}
      {!settings.zenMode && settings.showSidebar && <Sidebar />}

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Tab Bar (Hidden in Zen Mode) */}
        {!settings.zenMode && <TabBar />}

        {/* Content Viewport */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {renderContent()}
        </main>

        {/* Bottom Status Bar (Hidden in Zen Mode) */}
        {!settings.zenMode && settings.showStatusBar && <StatusBar />}

        {/* Bottom Horizontal Timeline Bar (Hidden in Zen Mode) */}
        {!settings.zenMode && <TimelineBar />}
      </div>
    </div>
  );
};

