/* ========================================================================
   TypeScript Types — Novel Writing Application
   ======================================================================== */

// ---- Theme ----
export type Theme = 'light' | 'dark' | 'sepia';

export interface WorldLoreArticle {
  id: string;
  title: string;
  category: 'history' | 'cosmology' | 'religion' | 'artifact' | 'culture' | 'race' | 'custom';
  categoryLabel?: string;
  content: string; // Rich text / TipTap
  tags: string[];
  relatedEntityIds: string[];
  customAttributes?: CustomAttribute[];
  createdAt: string;
  updatedAt: string;
}

// ---- Cấu trúc Danh mục phân loại trích xuất từ văn bản (Entity Extraction) ----
export interface ExtractedDetail {
  id: string;
  label: string; // Tên nội dung do người dùng tự đặt: "Công thức", "Phương thức", "Nguyên liệu", "Hậu quả"...
  content: string; // Nội dung đoạn trích xuất bôi đen
  addedAt: string;
}

export interface ExtractedCategoryItem {
  id: string;
  name: string; // Tên danh mục (ví dụ: Ma dược Phục Linh, Hắc Long Bang, Bí cảnh Cổ Tháp...)
  domain: 'power-system' | 'world-building' | 'faction' | 'plot';
  details: ExtractedDetail[]; // Danh sách nội dung không giới hạn
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Văn bản thuần cho từng phân khu World-Building
export interface PureTextDomain {
  id: string;
  title: string;
  domain: 'power-system' | 'world-building' | 'faction' | 'plot';
  content: string; // TipTap Rich Text / thuần văn bản
  updatedAt: string;
}

// ---- Tab System ----
export type TabType =
  | 'chapter'
  | 'character'
  | 'power-system'
  | 'world-building'
  | 'faction'
  | 'location'
  | 'lore'
  | 'plot'
  | 'category-matrix'
  | 'relationship-graph'
  | 'timeline'
  | 'world-bible'
  | 'diagram'
  | 'notes';

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  entityId?: string;
  isDirty: boolean;
  isPinned: boolean;
}

// ---- Project ----
export interface Project {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  createdAt: string;
  updatedAt: string;
  wordCountGoal: number;
  chapters: Chapter[];
  characters: Character[];
  // Dạng thuần văn bản cho từng phân hệ
  pureTextDomains?: {
    powerSystem: string;
    worldBuilding: string;
    faction: string;
    plot: string;
  };
  // Dữ liệu danh mục đã trích xuất để hiển thị trực quan dạng bảng
  extractedCategories?: ExtractedCategoryItem[];
  // Các mảng giữ nguyên non-optional
  powerSystems: PowerSystem[];
  factions: Faction[];
  locations: Location[];
  loreArticles?: WorldLoreArticle[];
  timelineEvents: TimelineEvent[];
  crossLinks: CrossLinkEntry[];
  notes: Note[];
}

// ---- Chapter & Scene ----
export interface Chapter {
  id: string;
  title: string;
  order: number;
  scenes: Scene[];
  synopsis: string;
  status: 'draft' | 'revision' | 'final';
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  content: string;       // TipTap HTML/JSON
  drawingStrokes?: DrawingStroke[]; // Lưu trữ nét vẽ riêng biệt của từng phân cảnh
  synopsis: string;
  pov: string;           // Point of view character id
  location: string;      // Location id
  timelineEventId?: string;
  wordCount: number;
  status: 'draft' | 'revision' | 'final';
}

// ---- Character ----
export interface Character {
  id: string;
  name: string;
  aliases: string[];
  role: string;          // Vai trò tự do: 'Nhân vật chính', 'Phản diện', 'Sư phụ', 'Linh vật', hoặc tự gõ tùy ý
  tags?: string[];       // Danh sách nhãn/tag tự do (VD: Kiếm tu, Chuyển sinh, Ẩn thế cao nhân...)
  faction?: string;      // Faction id
  description: string;
  appearance: string;
  personality: string;
  backstory: string;
  goals: string;
  abilities: string[];   // Power system references
  relationships: CharacterRelationship[];
  notes: string;
  avatar?: string;       // base64 or url
  color: string;         // tag color in timeline/graph
  createdAt: string;
  updatedAt: string;
}

export interface CharacterRelationship {
  targetCharacterId: string;
  type?: string;         // e.g., "ally", "enemy", "custom"
  label: string;         // Nhãn mối quan hệ tự do (VD: "Sư đồ", "Kẻ thù truyền kiếp", "Nợ máu", "Đạo lữ"...)
  color?: string;        // Màu sắc đường nối tự do trên sơ đồ
  description: string;
}

export interface CustomAttribute {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'number' | 'tag' | 'link';
}

export interface CustomSection {
  id: string;
  title: string;
  content: string; // Rich text / markdown / TipTap HTML
  collapsed?: boolean;
}

export interface PowerProperty {
  id: string;
  name: string; // VD: "Nguyên lí", "Năng lượng tiêu hao", "Hậu quả phản phệ", "Cấm kỵ", "Thời gian duy trì" (tự do đặt)
  content: string; // Nội dung đoạn trích hoặc diễn giải
}

export interface PowerSystem {
  id: string;
  name: string;
  description?: string;
  // Các thuộc tính/mục con do tác giả tự do đặt tên và gán nội dung
  properties: PowerProperty[];
  // Soạn thảo tự do toàn văn nếu muốn
  freeformContent: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Faction / Class ----
export interface Faction {
  id: string;
  name: string;
  type: 'kingdom' | 'organization' | 'class' | 'tribe' | 'guild' | 'religion' | 'custom';
  description: string;
  hierarchy: string;     // Rich text
  territory?: string;    // Location id
  allies: string[];      // Other faction ids
  enemies: string[];
  members: string[];     // Character ids
  notes: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Location ----
export interface Location {
  id: string;
  name: string;
  type: 'continent' | 'country' | 'city' | 'village' | 'dungeon' | 'landmark' | 'realm' | 'custom';
  parentLocationId?: string;
  description: string;
  climate: string;
  culture: string;
  significance: string;
  controlledBy?: string; // Faction id
  notes: string;
  coordinates?: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
}

// ---- Timeline ----
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;          // In-world date/era string
  order: number;         // Numeric for ordering
  era?: string;
  type: 'historical' | 'plot' | 'character' | 'world' | 'custom';
  relatedChapterId?: string;
  relatedCharacterIds: string[];
  relatedLocationId?: string;
  color: string;
  createdAt: string;
}

// ---- Cross-Link ----
export interface CrossLinkEntry {
  id: string;
  term: string;          // The keyword/phrase to detect
  targetType: TabType;
  targetId: string;      // The entity id to navigate to
  description?: string;  // Tooltip preview
}

// ---- Notes ----
export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'plot' | 'research' | 'idea' | 'todo';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ---- Diagram ----
export interface DiagramData {
  id: string;
  title: string;
  type: 'relationship' | 'hierarchy' | 'flowchart' | 'custom';
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    entityId?: string;
    entityType?: TabType;
    color?: string;
    description?: string;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, string>;
}

// ---- Drawing ----
export interface DrawingStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser' | 'highlighter';
}

export interface DrawingLayer {
  id: string;
  name: string;
  strokes: DrawingStroke[];
  visible: boolean;
  opacity: number;
}

// ---- File / Export ----
export type ExportFormat = 'json' | 'markdown' | 'txt' | 'html';

export interface FileOperationResult {
  success: boolean;
  message: string;
  filePath?: string;
}

// ---- Sidebar ----
export type SidebarSection = 'chapters' | 'characters' | 'powers' | 'factions' | 'locations' | 'notes';

// ---- App State ----
export interface AppSettings {
  theme: Theme;
  fontSize: number;
  editorWidth: 'narrow' | 'medium' | 'wide' | 'full';
  showSidebar: boolean;
  showTimeline: boolean;
  showStatusBar: boolean;
  showToolbar: boolean;
  zenMode: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // ms
  spellCheck: boolean;
  typewriterMode: boolean;  // keep cursor centered
  focusMode: boolean;       // dim non-active paragraphs
  wordCountGoalDaily: number;
}

// ---- Keyboard shortcut ----
export interface ShortcutDef {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: string;         // action identifier
  category: 'file' | 'edit' | 'view' | 'navigate' | 'format';
}

// ---- Search ----
export interface SearchResult {
  type: TabType;
  entityId: string;
  title: string;
  snippet: string;
  matchPositions: number[];
}

// ---- Statistics ----
export interface WritingStats {
  totalWordCount: number;
  todayWordCount: number;
  chapterWordCounts: { chapterId: string; count: number }[];
  writingSessions: WritingSession[];
  averageWordsPerDay: number;
  currentStreak: number;
}

export interface WritingSession {
  date: string;
  wordCount: number;
  duration: number; // minutes
}

