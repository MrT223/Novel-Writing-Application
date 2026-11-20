import { useEffect } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore } from '@/stores/editorStore';

export function useKeyboardShortcuts() {
  const { nextTab, prevTab, closeTab, activeTabId, openTab } = useTabStore();
  const { toggleSidebar, toggleTimeline, toggleZenMode } = useSettingsStore();
  const { addChapter, markClean } = useProjectStore();
  const { toggleDrawingMode } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not interrupt standard inputs if typing normal text
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      // Ctrl + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        markClean();
        return;
      }

      // Ctrl + \: Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Ctrl + J: Toggle Timeline
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleTimeline();
        return;
      }

      // F11: Zen mode toggle
      if (e.key === 'F11') {
        e.preventDefault();
        toggleZenMode();
        return;
      }

      // Ctrl + N: New Chapter
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        const ch = addChapter();
        openTab({
          type: 'chapter',
          title: ch.title,
          entityId: ch.id,
        });
        return;
      }

      // Ctrl + W: Close active tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w' && !e.shiftKey) {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
        return;
      }

      // Ctrl + Tab / Ctrl + Shift + Tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          prevTab();
        } else {
          nextTab();
        }
        return;
      }

      // Ctrl + Shift + C: Open Characters
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        openTab({
          type: 'world-bible',
          title: 'World Bible & Hồ Sơ',
        });
        return;
      }

      // Ctrl + Shift + G: Open Relationship Graph
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        openTab({
          type: 'relationship-graph',
          title: 'Sơ Đồ Quan Hệ Nhân Vật',
        });
        return;
      }
    };

    // Mouse button 4 (Back button / auxiliary) toggle drawing mode
    const handleMouseUp = (e: MouseEvent) => {
      // Mouse button 3 is MB4 in JS MouseEvent (0: left, 1: middle, 2: right, 3: back/mb4, 4: forward/mb5)
      if (e.button === 3) {
        e.preventDefault();
        toggleDrawingMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    nextTab,
    prevTab,
    closeTab,
    activeTabId,
    openTab,
    toggleSidebar,
    toggleTimeline,
    toggleZenMode,
    addChapter,
    markClean,
    toggleDrawingMode,
  ]);
}

