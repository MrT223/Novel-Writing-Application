import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Tab, TabType } from '@/types';

export interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Omit<Tab, 'id' | 'isDirty' | 'isPinned'> & { id?: string }) => void;
  closeTab: (id: string) => void;
  closeTabsByEntityId: (entityId: string) => void;
  closeTabsByEntityIds: (entityIds: string[]) => void;
  setActiveTab: (id: string) => void;
  closeOtherTabs: (id: string) => void;
  closeAllTabs: () => void;
  nextTab: () => void;
  prevTab: () => void;
  updateTab: (id: string, partial: Partial<Tab>) => void;
  pinTab: (id: string) => void;
  unpinTab: (id: string) => void;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (tabData) => {
    const { tabs } = get();
    // Kiểm tra xem tab có cùng type (hoặc cùng entityId nếu có) đã mở chưa
    const existing = tabs.find((t) => {
      if (tabData.entityId && t.entityId) {
        return t.entityId === tabData.entityId && t.type === tabData.type;
      }
      return t.type === tabData.type && !tabData.entityId && !t.entityId;
    });

    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const newTab: Tab = {
      id: tabData.id || uuidv4(),
      type: tabData.type,
      title: tabData.title,
      entityId: tabData.entityId,
      isDirty: false,
      isPinned: false,
    };

    set({
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    });
  },

  closeTab: (id: string) => {
    const { tabs, activeTabId } = get();
    const tabIndex = tabs.findIndex((t) => t.id === id);
    if (tabIndex === -1) return;

    const remainingTabs = tabs.filter((t) => t.id !== id);
    let nextActiveId = activeTabId;

    if (activeTabId === id) {
      if (remainingTabs.length > 0) {
        const nextIndex = Math.min(tabIndex, remainingTabs.length - 1);
        nextActiveId = remainingTabs[nextIndex].id;
      } else {
        nextActiveId = null;
      }
    }

    set({
      tabs: remainingTabs,
      activeTabId: nextActiveId,
    });
  },

  closeTabsByEntityId: (entityId: string) => {
    const { tabs, closeTab } = get();
    tabs.filter((t) => t.entityId === entityId).forEach((t) => closeTab(t.id));
  },

  closeTabsByEntityIds: (entityIds: string[]) => {
    const { tabs, closeTab } = get();
    tabs.filter((t) => t.entityId && entityIds.includes(t.entityId)).forEach((t) => closeTab(t.id));
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id });
  },

  closeOtherTabs: (id: string) => {
    const { tabs } = get();
    const target = tabs.find((t) => t.id === id);
    if (!target) return;
    set({
      tabs: tabs.filter((t) => t.id === id || t.isPinned),
      activeTabId: id,
    });
  },

  closeAllTabs: () => {
    const { tabs } = get();
    const pinned = tabs.filter((t) => t.isPinned);
    set({
      tabs: pinned,
      activeTabId: pinned.length > 0 ? pinned[0].id : null,
    });
  },

  nextTab: () => {
    const { tabs, activeTabId } = get();
    if (tabs.length <= 1 || !activeTabId) return;
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const nextIndex = (currentIndex + 1) % tabs.length;
    set({ activeTabId: tabs[nextIndex].id });
  },

  prevTab: () => {
    const { tabs, activeTabId } = get();
    if (tabs.length <= 1 || !activeTabId) return;
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    set({ activeTabId: tabs[prevIndex].id });
  },

  updateTab: (id: string, partial: Partial<Tab>) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, ...partial } : tab)),
    }));
  },

  pinTab: (id: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, isPinned: true } : tab)),
    }));
  },

  unpinTab: (id: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, isPinned: false } : tab)),
    }));
  },
}));

