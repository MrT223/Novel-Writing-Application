import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Character,
  PowerSystem,
  Faction,
  Location,
  CrossLinkEntry,
  Note,
  SearchResult,
  TabType,
} from '@/types';
import { useProjectStore } from './projectStore';

export interface WorldBibleState {
  // Queries
  getCharacters: () => Character[];
  getPowerSystems: () => PowerSystem[];
  getFactions: () => Faction[];
  getLocations: () => Location[];
  getCrossLinks: () => CrossLinkEntry[];
  getNotes: () => Note[];

  // Character CRUD
  addCharacter: (name?: string) => Character;
  updateCharacter: (id: string, partial: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;

  // Power System CRUD
  addPowerSystem: (name?: string) => PowerSystem;
  updatePowerSystem: (id: string, partial: Partial<PowerSystem>) => void;
  deletePowerSystem: (id: string) => void;

  // Faction CRUD
  addFaction: (name?: string) => Faction;
  updateFaction: (id: string, partial: Partial<Faction>) => void;
  deleteFaction: (id: string) => void;

  // Location CRUD
  addLocation: (name?: string) => Location;
  updateLocation: (id: string, partial: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  // CrossLink Management
  addCrossLink: (term: string, targetType: TabType, targetId: string, description?: string) => CrossLinkEntry;
  removeCrossLink: (id: string) => void;
  syncCrossLinksFromEntities: () => void;

  // Search across all entities
  searchEntities: (query: string) => SearchResult[];
}

export const useWorldBibleStore = create<WorldBibleState>((set, get) => ({
  getCharacters: () => useProjectStore.getState().project.characters || [],
  getPowerSystems: () => useProjectStore.getState().project.powerSystems || [],
  getFactions: () => useProjectStore.getState().project.factions || [],
  getLocations: () => useProjectStore.getState().project.locations || [],
  getCrossLinks: () => useProjectStore.getState().project.crossLinks || [],
  getNotes: () => useProjectStore.getState().project.notes || [],

  // Character
  addCharacter: (name = 'Nhân vật mới') => {
    const newChar: Character = {
      id: uuidv4(),
      name,
      aliases: [],
      role: 'supporting',
      description: '',
      appearance: '',
      personality: '',
      backstory: '',
      goals: '',
      abilities: [],
      relationships: [],
      notes: '',
      color: '#D97706',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projectStore = useProjectStore.getState();
    const characters = [...projectStore.project.characters, newChar];
    projectStore.updateProject({ characters });

    // Auto-create cross link entry
    get().addCrossLink(newChar.name, 'character', newChar.id, `Hồ sơ nhân vật: ${newChar.name}`);
    return newChar;
  },

  updateCharacter: (id, partial) => {
    const projectStore = useProjectStore.getState();
    const oldChar = projectStore.project.characters.find((c) => c.id === id);
    const characters = projectStore.project.characters.map((c) =>
      c.id === id ? { ...c, ...partial, updatedAt: new Date().toISOString() } : c
    );
    projectStore.updateProject({ characters });

    // Update crosslink term if name changed
    if (partial.name && oldChar && partial.name !== oldChar.name) {
      const crossLinks = projectStore.project.crossLinks.map((cl) =>
        cl.targetId === id ? { ...cl, term: partial.name!, description: `Hồ sơ nhân vật: ${partial.name}` } : cl
      );
      projectStore.updateProject({ crossLinks });
    }
  },

  deleteCharacter: (id) => {
    const projectStore = useProjectStore.getState();
    const characters = projectStore.project.characters.filter((c) => c.id !== id);
    const crossLinks = projectStore.project.crossLinks.filter((cl) => cl.targetId !== id);
    projectStore.updateProject({ characters, crossLinks });
  },

  // Power System
  addPowerSystem: (name = 'Hệ thống sức mạnh mới') => {
    const newPs: PowerSystem = {
      id: uuidv4(),
      name,
      description: '',
      freeformContent: '',
      properties: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projectStore = useProjectStore.getState();
    const powerSystems = [...projectStore.project.powerSystems, newPs];
    projectStore.updateProject({ powerSystems });

    get().addCrossLink(newPs.name, 'power-system', newPs.id, `Hệ thống sức mạnh: ${newPs.name}`);
    return newPs;
  },

  updatePowerSystem: (id, partial) => {
    const projectStore = useProjectStore.getState();
    const powerSystems = projectStore.project.powerSystems.map((ps) =>
      ps.id === id ? { ...ps, ...partial, updatedAt: new Date().toISOString() } : ps
    );
    projectStore.updateProject({ powerSystems });
  },

  deletePowerSystem: (id) => {
    const projectStore = useProjectStore.getState();
    const powerSystems = projectStore.project.powerSystems.filter((ps) => ps.id !== id);
    const crossLinks = projectStore.project.crossLinks.filter((cl) => cl.targetId !== id);
    projectStore.updateProject({ powerSystems, crossLinks });
  },

  // Faction
  addFaction: (name = 'Thế lực / Giai cấp mới') => {
    const newFaction: Faction = {
      id: uuidv4(),
      name,
      type: 'organization',
      description: '',
      hierarchy: '',
      allies: [],
      enemies: [],
      members: [],
      notes: '',
      color: '#2563EB',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projectStore = useProjectStore.getState();
    const factions = [...projectStore.project.factions, newFaction];
    projectStore.updateProject({ factions });

    get().addCrossLink(newFaction.name, 'faction', newFaction.id, `Thế lực: ${newFaction.name}`);
    return newFaction;
  },

  updateFaction: (id, partial) => {
    const projectStore = useProjectStore.getState();
    const factions = projectStore.project.factions.map((f) =>
      f.id === id ? { ...f, ...partial, updatedAt: new Date().toISOString() } : f
    );
    projectStore.updateProject({ factions });
  },

  deleteFaction: (id) => {
    const projectStore = useProjectStore.getState();
    const factions = projectStore.project.factions.filter((f) => f.id !== id);
    const crossLinks = projectStore.project.crossLinks.filter((cl) => cl.targetId !== id);
    projectStore.updateProject({ factions, crossLinks });
  },

  // Location
  addLocation: (name = 'Địa điểm mới') => {
    const newLoc: Location = {
      id: uuidv4(),
      name,
      type: 'city',
      description: '',
      climate: '',
      culture: '',
      significance: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projectStore = useProjectStore.getState();
    const locations = [...projectStore.project.locations, newLoc];
    projectStore.updateProject({ locations });

    get().addCrossLink(newLoc.name, 'location', newLoc.id, `Địa điểm: ${newLoc.name}`);
    return newLoc;
  },

  updateLocation: (id, partial) => {
    const projectStore = useProjectStore.getState();
    const locations = projectStore.project.locations.map((l) =>
      l.id === id ? { ...l, ...partial, updatedAt: new Date().toISOString() } : l
    );
    projectStore.updateProject({ locations });
  },

  deleteLocation: (id) => {
    const projectStore = useProjectStore.getState();
    const locations = projectStore.project.locations.filter((l) => l.id !== id);
    const crossLinks = projectStore.project.crossLinks.filter((cl) => cl.targetId !== id);
    projectStore.updateProject({ locations, crossLinks });
  },

  // CrossLinks
  addCrossLink: (term, targetType, targetId, description) => {
    const projectStore = useProjectStore.getState();
    const existing = projectStore.project.crossLinks.find(
      (cl) => cl.term.toLowerCase() === term.toLowerCase()
    );
    if (existing) return existing;

    const newLink: CrossLinkEntry = {
      id: uuidv4(),
      term: term.trim(),
      targetType,
      targetId,
      description,
    };

    const crossLinks = [...projectStore.project.crossLinks, newLink];
    projectStore.updateProject({ crossLinks });
    return newLink;
  },

  removeCrossLink: (id) => {
    const projectStore = useProjectStore.getState();
    const crossLinks = projectStore.project.crossLinks.filter((cl) => cl.id !== id);
    projectStore.updateProject({ crossLinks });
  },

  syncCrossLinksFromEntities: () => {
    const projectStore = useProjectStore.getState();
    const p = projectStore.project;
    const links: CrossLinkEntry[] = [];

    p.characters.forEach((c) => {
      links.push({ id: uuidv4(), term: c.name, targetType: 'character', targetId: c.id, description: c.role });
      c.aliases.forEach((alias) => {
        if (alias.trim()) {
          links.push({ id: uuidv4(), term: alias, targetType: 'character', targetId: c.id, description: `${c.name} (${alias})` });
        }
      });
    });

    p.powerSystems.forEach((ps) => {
      links.push({ id: uuidv4(), term: ps.name, targetType: 'power-system', targetId: ps.id, description: 'Hệ thống năng lực' });
      ps.properties?.forEach((prop) => {
        if (prop.name.trim()) {
          links.push({ id: uuidv4(), term: prop.name, targetType: 'power-system', targetId: ps.id, description: `${ps.name} - ${prop.name}` });
        }
      });
    });

    p.factions.forEach((f) => {
      links.push({ id: uuidv4(), term: f.name, targetType: 'faction', targetId: f.id, description: `Thế lực: ${f.name}` });
    });

    p.locations.forEach((l) => {
      links.push({ id: uuidv4(), term: l.name, targetType: 'location', targetId: l.id, description: `Địa danh: ${l.name}` });
    });

    projectStore.updateProject({ crossLinks: links });
  },

  searchEntities: (query: string): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const p = useProjectStore.getState().project;
    const results: SearchResult[] = [];

    // Search characters
    p.characters.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({
          type: 'character',
          entityId: c.id,
          title: c.name,
          snippet: c.description || c.personality || 'Hồ sơ nhân vật',
          matchPositions: [],
        });
      }
    });

    // Search chapters & scenes
    p.chapters.forEach((ch) => {
      if (ch.title.toLowerCase().includes(q) || ch.synopsis.toLowerCase().includes(q)) {
        results.push({
          type: 'chapter',
          entityId: ch.id,
          title: ch.title,
          snippet: ch.synopsis || 'Chương truyện',
          matchPositions: [],
        });
      }
      ch.scenes.forEach((s) => {
        if (s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)) {
          results.push({
            type: 'chapter',
            entityId: s.id,
            title: `${ch.title} - ${s.title}`,
            snippet: s.synopsis || s.content.replace(/<[^>]*>/g, '').slice(0, 100),
            matchPositions: [],
          });
        }
      });
    });

    // Search power systems
    p.powerSystems.forEach((ps) => {
      if (ps.name.toLowerCase().includes(q) || (ps.description && ps.description.toLowerCase().includes(q))) {
        results.push({
          type: 'power-system',
          entityId: ps.id,
          title: ps.name,
          snippet: ps.description || ps.freeformContent?.slice(0, 100) || 'Hệ thống sức mạnh',
          matchPositions: [],
        });
      }
    });

    // Search factions
    p.factions.forEach((f) => {
      if (f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) {
        results.push({
          type: 'faction',
          entityId: f.id,
          title: f.name,
          snippet: f.description || 'Thế lực',
          matchPositions: [],
        });
      }
    });

    // Search locations
    p.locations.forEach((l) => {
      if (l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)) {
        results.push({
          type: 'location',
          entityId: l.id,
          title: l.name,
          snippet: l.description || 'Địa điểm',
          matchPositions: [],
        });
      }
    });

    return results;
  },
}));

