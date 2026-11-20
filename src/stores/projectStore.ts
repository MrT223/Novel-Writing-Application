import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Project, Chapter, Scene } from '@/types';
import { createDefaultProject } from '@/utils/constants';

export interface ProjectSummary {
  id: string;
  title: string;
  author: string;
  updatedAt: string;
}

export interface ProjectState {
  project: Project;
  projectsList: ProjectSummary[];
  isLoaded: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;

  // Multi-project Actions
  loadProjectsList: () => ProjectSummary[];
  switchProject: (projectId: string) => void;
  createNewProject: (title?: string, author?: string) => Project;
  deleteProject: (projectId: string) => void;

  // Current Project Actions
  updateProject: (partial: Partial<Project>) => void;
  markDirty: () => void;
  markClean: () => void;

  // Chapter CRUD
  addChapter: (title?: string) => Chapter;
  updateChapter: (id: string, partial: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  reorderChapters: (chapterIds: string[]) => void;

  // Scene CRUD
  addScene: (chapterId: string, title?: string) => Scene;
  updateScene: (sceneId: string, partial: Partial<Scene>) => void;
  deleteScene: (sceneId: string) => void;
  reorderScenes: (chapterId: string, sceneIds: string[]) => void;
}

const STORAGE_PREFIX = 'novel_project_';
const LIST_STORAGE_KEY = 'novel_projects_index';
const ACTIVE_PROJECT_ID_KEY = 'novel_active_project_id';

const getStoredProjectsList = (): ProjectSummary[] => {
  try {
    const raw = localStorage.getItem(LIST_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

const saveProjectsList = (list: ProjectSummary[]) => {
  try {
    localStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

const getStoredProjectById = (id: string): Project | null => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return null;
};

const saveProjectToStorage = (p: Project) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${p.id}`, JSON.stringify(p));
    // Cập nhật vào danh sách index
    const list = getStoredProjectsList();
    const existingIndex = list.findIndex((item) => item.id === p.id);
    const summary: ProjectSummary = {
      id: p.id,
      title: p.title,
      author: p.author,
      updatedAt: p.updatedAt,
    };
    if (existingIndex >= 0) {
      list[existingIndex] = summary;
    } else {
      list.push(summary);
    }
    saveProjectsList(list);
    localStorage.setItem(ACTIVE_PROJECT_ID_KEY, p.id);
  } catch (e) {
    console.error(e);
  }
};

const initInitialProject = (): { project: Project; list: ProjectSummary[] } => {
  let list = getStoredProjectsList();
  const activeId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);

  if (activeId) {
    const found = getStoredProjectById(activeId);
    if (found) return { project: found, list };
  }

  if (list.length > 0) {
    const found = getStoredProjectById(list[0].id);
    if (found) return { project: found, list };
  }

  // Khởi tạo một tiểu thuyết trống hoàn toàn
  const defaultP = createDefaultProject();
  defaultP.title = 'Tiểu Thuyết Mới';
  defaultP.author = 'Tác giả';
  defaultP.synopsis = '';

  saveProjectToStorage(defaultP);
  list = getStoredProjectsList();
  return { project: defaultP, list };
};

export const useProjectStore = create<ProjectState>((set, get) => {
  const { project: initialProject, list: initialList } = initInitialProject();

  const persist = (updated: Project) => {
    saveProjectToStorage(updated);
    set({ project: updated, projectsList: getStoredProjectsList() });
  };

  return {
    project: initialProject,
    projectsList: initialList,
    isLoaded: true,
    isSaving: false,
    lastSaved: new Date(),
    isDirty: false,

    loadProjectsList: () => {
      const list = getStoredProjectsList();
      set({ projectsList: list });
      return list;
    },

    switchProject: (projectId: string) => {
      const p = getStoredProjectById(projectId);
      if (p) {
        localStorage.setItem(ACTIVE_PROJECT_ID_KEY, p.id);
        set({ project: p, isDirty: false, lastSaved: new Date() });
      }
    },

    createNewProject: (title = 'Tác Phẩm Mới', author = 'Tác giả') => {
      const p = createDefaultProject();
      p.id = uuidv4();
      p.title = title;
      p.author = author;
      const ch1Id = uuidv4();
      const sc1Id = uuidv4();
      p.chapters = [
        {
          id: ch1Id,
          title: 'Chương 1',
          order: 1,
          synopsis: '',
          status: 'draft',
          wordCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scenes: [
            {
              id: sc1Id,
              chapterId: ch1Id,
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
      ];
      persist(p);
      return p;
    },

    deleteProject: (projectId: string) => {
      const { projectsList, project } = get();
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${projectId}`);
        const updatedList = projectsList.filter((item) => item.id !== projectId);
        saveProjectsList(updatedList);
        set({ projectsList: updatedList });

        // Nếu xoá project đang active, chuyển sang project khác hoặc tạo mới
        if (project.id === projectId) {
          if (updatedList.length > 0) {
            get().switchProject(updatedList[0].id);
          } else {
            get().createNewProject('Tiểu Thuyết Mới');
          }
        }
      } catch (e) {
        console.error(e);
      }
    },

    updateProject: (partial) => {
      const updated = { ...get().project, ...partial, updatedAt: new Date().toISOString() };
      set({ project: updated, isDirty: true });
      persist(updated);
    },

    markDirty: () => set({ isDirty: true }),
    markClean: () => set({ isDirty: false, lastSaved: new Date() }),

    // Chapter Operations
    addChapter: (title = 'Chương mới') => {
      const { project } = get();
      const newChapter: Chapter = {
        id: uuidv4(),
        title,
        order: project.chapters.length + 1,
        scenes: [],
        synopsis: '',
        status: 'draft',
        wordCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedChapters = [...project.chapters, newChapter];
      const updated = { ...project, chapters: updatedChapters, updatedAt: new Date().toISOString() };
      persist(updated);
      return newChapter;
    },

    updateChapter: (id, partial) => {
      const { project } = get();
      const updatedChapters = project.chapters.map((ch) =>
        ch.id === id ? { ...ch, ...partial, updatedAt: new Date().toISOString() } : ch
      );
      const updated = { ...project, chapters: updatedChapters, updatedAt: new Date().toISOString() };
      persist(updated);
    },

    deleteChapter: (id) => {
      const { project } = get();
      let updatedChapters = project.chapters.filter((ch) => ch.id !== id);
      if (updatedChapters.length === 0) {
        const newChId = uuidv4();
        const newScId = uuidv4();
        updatedChapters = [
          {
            id: newChId,
            title: 'Chương 1',
            order: 1,
            scenes: [
              {
                id: newScId,
                chapterId: newChId,
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
            synopsis: '',
            status: 'draft',
            wordCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
      const updated = { ...project, chapters: updatedChapters, updatedAt: new Date().toISOString() };
      persist(updated);
    },

    reorderChapters: (chapterIds) => {
      const { project } = get();
      const chapterMap = new Map(project.chapters.map((ch) => [ch.id, ch]));
      const updatedChapters = chapterIds
        .map((id, index) => {
          const ch = chapterMap.get(id);
          return ch ? { ...ch, order: index + 1 } : null;
        })
        .filter((ch): ch is Chapter => ch !== null);

      const updated = { ...project, chapters: updatedChapters, updatedAt: new Date().toISOString() };
      persist(updated);
    },

    // Scene Operations
    addScene: (chapterId, title = 'Phân cảnh mới') => {
      const { project } = get();
      const chapter = project.chapters.find((ch) => ch.id === chapterId);
      if (!chapter) throw new Error('Chapter not found');

      const newScene: Scene = {
        id: uuidv4(),
        chapterId,
        title,
        order: chapter.scenes.length + 1,
        content: '<p></p>',
        drawingStrokes: [],
        synopsis: '',
        pov: '',
        location: '',
        wordCount: 0,
        status: 'draft',
      };

      const updatedChapters = project.chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            scenes: [...ch.scenes, newScene],
            updatedAt: new Date().toISOString(),
          };
        }
        return ch;
      });

      const updated = { ...project, chapters: updatedChapters, updatedAt: new Date().toISOString() };
      persist(updated);
      return newScene;
    },

    updateScene: (sceneId, partial) => {
      const { project } = get();

      const updatedChapters = project.chapters.map((ch) => {
        const sceneIndex = ch.scenes.findIndex((s) => s.id === sceneId);
        if (sceneIndex === -1) return ch;

        const updatedScenes = [...ch.scenes];
        const oldScene = updatedScenes[sceneIndex];
        const newScene = { ...oldScene, ...partial };
        updatedScenes[sceneIndex] = newScene;

        const chapterWordCount = updatedScenes.reduce((sum, s) => sum + (s.wordCount || 0), 0);

        return {
          ...ch,
          scenes: updatedScenes,
          wordCount: chapterWordCount,
          updatedAt: new Date().toISOString(),
        };
      });

      const updated = { ...project, chapters: updatedChapters, updatedAt: new Date().toISOString() };
      persist(updated);
    },

    deleteScene: (sceneId) => {
      const { project } = get();
      const updatedChapters = project.chapters.map((ch) => {
        const filtered = ch.scenes.filter((s) => s.id !== sceneId);
        if (filtered.length === ch.scenes.length) return ch;

        const chapterWordCount = filtered.reduce((sum, s) => sum + (s.wordCount || 0), 0);
        return {
          ...ch,
          scenes: filtered,
          wordCount: chapterWordCount,
          updatedAt: new Date().toISOString(),
        };
      });

      const updated = { ...project, chapters: updatedChapters, updatedAt: new Date().toISOString() };
      persist(updated);
    },

    reorderScenes: (chapterId, sceneIds) => {
      const { project } = get();
      const updatedChapters = project.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const sceneMap = new Map(ch.scenes.map((s) => [s.id, s]));
        const updatedScenes = sceneIds
          .map((id, index) => {
            const s = sceneMap.get(id);
            return s ? { ...s, order: index + 1 } : null;
          })
          .filter((s): s is Scene => s !== null);

        return { ...ch, scenes: updatedScenes, updatedAt: new Date().toISOString() };
      });

      const updated = { ...project, chapters: updatedChapters, updatedAt: new Date().toISOString() };
      persist(updated);
    },
  };
});
