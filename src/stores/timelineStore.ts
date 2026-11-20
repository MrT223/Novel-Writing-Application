import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { TimelineEvent } from '@/types';
import { useProjectStore } from './projectStore';

export interface TimelineState {
  events: TimelineEvent[];
  selectedEventId: string | null;
  zoomLevel: number;
  scrollPosition: number;

  selectEvent: (id: string | null) => void;
  setZoom: (level: number) => void;
  setScroll: (pos: number) => void;

  addEvent: (eventData?: Partial<TimelineEvent>) => TimelineEvent;
  updateEvent: (id: string, partial: Partial<TimelineEvent>) => void;
  deleteEvent: (id: string) => void;
  reorderEvents: (eventIds: string[]) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  events: [],
  selectedEventId: null,
  zoomLevel: 1,
  scrollPosition: 0,

  selectEvent: (id) => set({ selectedEventId: id }),
  setZoom: (level) => set({ zoomLevel: Math.max(0.5, Math.min(2.5, level)) }),
  setScroll: (pos) => set({ scrollPosition: pos }),

  addEvent: (eventData = {}) => {
    const projectStore = useProjectStore.getState();
    const currentEvents = projectStore.project.timelineEvents || [];

    const newEv: TimelineEvent = {
      id: uuidv4(),
      title: eventData.title || 'Sự kiện mới',
      description: eventData.description || '',
      date: eventData.date || 'Niên đại chưa rõ',
      order: currentEvents.length + 1,
      era: eventData.era || 'Kỷ nguyên hiện tại',
      type: eventData.type || 'plot',
      relatedCharacterIds: eventData.relatedCharacterIds || [],
      color: eventData.color || '#D97706',
      createdAt: new Date().toISOString(),
    };

    const updatedEvents = [...currentEvents, newEv];
    projectStore.updateProject({ timelineEvents: updatedEvents });
    return newEv;
  },

  updateEvent: (id, partial) => {
    const projectStore = useProjectStore.getState();
    const currentEvents = projectStore.project.timelineEvents || [];
    const updatedEvents = currentEvents.map((ev) => (ev.id === id ? { ...ev, ...partial } : ev));
    projectStore.updateProject({ timelineEvents: updatedEvents });
  },

  deleteEvent: (id) => {
    const projectStore = useProjectStore.getState();
    const currentEvents = projectStore.project.timelineEvents || [];
    const updatedEvents = currentEvents.filter((ev) => ev.id !== id);
    projectStore.updateProject({ timelineEvents: updatedEvents });
    if (get().selectedEventId === id) {
      set({ selectedEventId: null });
    }
  },

  reorderEvents: (eventIds) => {
    const projectStore = useProjectStore.getState();
    const currentEvents = projectStore.project.timelineEvents || [];
    const evMap = new Map(currentEvents.map((e) => [e.id, e]));

    const updatedEvents = eventIds
      .map((id, index) => {
        const ev = evMap.get(id);
        return ev ? { ...ev, order: index + 1 } : null;
      })
      .filter((ev): ev is TimelineEvent => ev !== null);

    projectStore.updateProject({ timelineEvents: updatedEvents });
  },
}));

