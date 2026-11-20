import { create } from 'zustand';
import type { DrawingLayer, DrawingStroke, SearchResult } from '@/types';

export interface EditorState {
  activeSceneId: string | null;
  editorContent: string;
  wordCount: number;

  // Drawing Mode
  isDrawingMode: boolean;
  drawingLayers: DrawingLayer[];
  drawingColor: string;
  drawingWidth: number;
  drawingTool: 'pen' | 'eraser' | 'highlighter';

  // Modes
  isZenMode: boolean;
  isFocusMode: boolean;
  isTypewriterMode: boolean;

  // Actions
  setActiveScene: (id: string | null) => void;
  setContent: (content: string) => void;
  setWordCount: (count: number) => void;

  toggleDrawingMode: () => void;
  setDrawingMode: (active: boolean) => void;
  setDrawingTool: (tool: 'pen' | 'eraser' | 'highlighter') => void;
  setDrawingColor: (color: string) => void;
  setDrawingWidth: (width: number) => void;
  addStroke: (stroke: DrawingStroke) => void;
  clearDrawing: () => void;
  undoStroke: () => void;

  toggleZenMode: () => void;
  toggleFocusMode: () => void;
  toggleTypewriterMode: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  activeSceneId: null,
  editorContent: '',
  wordCount: 0,

  isDrawingMode: false,
  drawingLayers: [
    {
      id: 'default-layer',
      name: 'Layer 1',
      strokes: [],
      visible: true,
      opacity: 1,
    },
  ],
  drawingColor: '#D97706',
  drawingWidth: 3,
  drawingTool: 'pen',

  isZenMode: false,
  isFocusMode: false,
  isTypewriterMode: false,

  setActiveScene: (id) => set({ activeSceneId: id }),
  setContent: (editorContent) => set({ editorContent }),
  setWordCount: (wordCount) => set({ wordCount }),

  toggleDrawingMode: () => set((state) => ({ isDrawingMode: !state.isDrawingMode })),
  setDrawingMode: (active) => set({ isDrawingMode: active }),
  setDrawingTool: (drawingTool) => set({ drawingTool }),
  setDrawingColor: (drawingColor) => set({ drawingColor }),
  setDrawingWidth: (drawingWidth) => set({ drawingWidth }),

  addStroke: (stroke) => {
    set((state) => {
      const layers = [...state.drawingLayers];
      if (layers.length === 0) {
        layers.push({ id: 'layer-1', name: 'Layer 1', strokes: [stroke], visible: true, opacity: 1 });
      } else {
        const activeLayer = { ...layers[0] };
        activeLayer.strokes = [...activeLayer.strokes, stroke];
        layers[0] = activeLayer;
      }
      return { drawingLayers: layers };
    });
  },

  clearDrawing: () => {
    set((state) => ({
      drawingLayers: state.drawingLayers.map((l) => ({ ...l, strokes: [] })),
    }));
  },

  undoStroke: () => {
    set((state) => {
      const layers = [...state.drawingLayers];
      if (layers.length > 0 && layers[0].strokes.length > 0) {
        const activeLayer = { ...layers[0] };
        activeLayer.strokes = activeLayer.strokes.slice(0, -1);
        layers[0] = activeLayer;
      }
      return { drawingLayers: layers };
    });
  },

  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
  toggleTypewriterMode: () => set((state) => ({ isTypewriterMode: !state.isTypewriterMode })),
}));

