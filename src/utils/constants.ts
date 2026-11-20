// ========================================================================
// Constants — Novel Writing Application
// ========================================================================

import type { AppSettings, Project, ShortcutDef } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ---- Keyboard Shortcuts ----
export const SHORTCUTS: ShortcutDef[] = [
  // File
  { key: 's', ctrl: true, description: 'Save project', action: 'save', category: 'file' },
  { key: 'n', ctrl: true, description: 'New chapter', action: 'newChapter', category: 'file' },
  { key: 'e', ctrl: true, shift: true, description: 'Export project', action: 'export', category: 'file' },

  // Edit
  { key: 'z', ctrl: true, description: 'Undo', action: 'undo', category: 'edit' },
  { key: 'z', ctrl: true, shift: true, description: 'Redo', action: 'redo', category: 'edit' },
  { key: 'f', ctrl: true, description: 'Find in scene', action: 'find', category: 'edit' },
  { key: 'f', ctrl: true, shift: true, description: 'Global search', action: 'globalSearch', category: 'edit' },

  // View
  { key: '\\', ctrl: true, description: 'Toggle sidebar', action: 'toggleSidebar', category: 'view' },
  { key: 'j', ctrl: true, description: 'Toggle timeline', action: 'toggleTimeline', category: 'view' },
  { key: 'F11', description: 'Toggle zen mode', action: 'toggleZenMode', category: 'view' },
  { key: 'F5', description: 'Toggle read mode', action: 'toggleReadMode', category: 'view' },

  // Navigate
  { key: 't', ctrl: true, description: 'New tab', action: 'newTab', category: 'navigate' },
  { key: 'w', ctrl: true, description: 'Close tab', action: 'closeTab', category: 'navigate' },
  { key: 'Tab', ctrl: true, description: 'Next tab', action: 'nextTab', category: 'navigate' },
  { key: 'Tab', ctrl: true, shift: true, description: 'Previous tab', action: 'prevTab', category: 'navigate' },
  { key: 'c', ctrl: true, shift: true, description: 'Open character panel', action: 'openCharacterPanel', category: 'navigate' },
  { key: 'w', ctrl: true, shift: true, description: 'Open world bible', action: 'openWorldBible', category: 'navigate' },

  // Format
  { key: 'b', ctrl: true, description: 'Bold', action: 'bold', category: 'format' },
  { key: 'i', ctrl: true, description: 'Italic', action: 'italic', category: 'format' },
  { key: 'u', ctrl: true, description: 'Underline', action: 'underline', category: 'format' },
];

// ---- Default Settings ----
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  fontSize: 17,
  editorWidth: 'medium',
  showSidebar: true,
  showTimeline: false,
  showStatusBar: true,
  showToolbar: true,
  zenMode: false,
  autoSave: true,
  autoSaveInterval: 5000,
  spellCheck: true,
  typewriterMode: false,
  focusMode: false,
  wordCountGoalDaily: 1000,
};

// ---- Default Project ----
export const createDefaultProject = (): Project => ({
  id: uuidv4(),
  title: 'Tiểu Thuyết Mới',
  author: 'Tác giả',
  synopsis: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  wordCountGoal: 50000,
  chapters: [
    {
      id: uuidv4(),
      title: 'Chương 1',
      order: 1,
      synopsis: '',
      status: 'draft',
      wordCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes: [
        {
          id: uuidv4(),
          chapterId: '',
          title: 'Hồi 1',
          order: 1,
          content: '<p></p>',
          drawingStrokes: [],
          synopsis: '',
          pov: '',
          location: '',
          wordCount: 0,
          status: 'draft',
        },
      ],
    },
  ],
  characters: [],
  pureTextDomains: {
    powerSystem: '<p></p>',
    worldBuilding: '<p></p>',
    faction: '<p></p>',
    plot: '<p></p>',
  },
  extractedCategories: [],
  powerSystems: [],
  factions: [],
  locations: [],
  timelineEvents: [],
  crossLinks: [],
  notes: [],
});

export const DEFAULT_PROJECT: Project = createDefaultProject();

// ---- Chapter Colors ----
export const CHAPTER_COLORS: string[] = [
  'var(--color-chapter-1)',
  'var(--color-chapter-2)',
  'var(--color-chapter-3)',
  'var(--color-chapter-4)',
  'var(--color-chapter-5)',
  'var(--color-chapter-6)',
];

// ---- Relationship Types ----
export const RELATIONSHIP_TYPES: Record<string, string> = {
  ally: 'Ally',
  enemy: 'Enemy',
  family: 'Family',
  romantic: 'Romantic',
  mentor: 'Mentor',
  rival: 'Rival',
  neutral: 'Neutral',
  custom: 'Custom',
};

// ---- Entity Icons (Lucide icon names) ----
export const ENTITY_ICONS: Record<string, string> = {
  chapter: 'book-open',
  character: 'user',
  'power-system': 'zap',
  faction: 'shield',
  location: 'map-pin',
  'relationship-graph': 'git-branch',
  timeline: 'clock',
  'world-bible': 'globe',
  diagram: 'workflow',
  notes: 'sticky-note',
};
