import React, { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTabStore } from '@/stores/tabStore';
import { useWorldBibleStore } from '@/stores/worldBibleStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  BookOpen,
  Users,
  Zap,
  Shield,
  MapPin,
  GitFork,
  FilePlus,
  Plus,
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  FolderPlus,
  Compass,
  Library,
  Trash2,
  Edit2,
  Check,
  Table,
  Globe,
  Download,
  Upload,
  Network,
} from 'lucide-react';
import { ExportModal } from '@/components/common/ExportModal';

export const Sidebar: React.FC = () => {
  const {
    project,
    projectsList,
    switchProject,
    createNewProject,
    deleteProject,
    updateProject,
    addChapter,
    updateChapter,
    deleteChapter,
    addScene,
    updateScene,
    deleteScene,
  } = useProjectStore();

  const { openTab, closeAllTabs, closeTabsByEntityId, closeTabsByEntityIds } = useTabStore();
  const { addCharacter, addPowerSystem, addFaction, addLocation, searchEntities } = useWorldBibleStore();
  const { settings, toggleTheme } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    chapters: false,
    characters: false,
    powers: false,
    factions: false,
    locations: false,
    lore: false,
  });

  const toggleSection = (sec: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      updateProject({ title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const searchResults = searchQuery.trim() ? searchEntities(searchQuery) : [];

  return (
    <aside className="w-72 h-full flex flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar-bg)] select-none">
      {/* Brand Header & Multi-project switch */}
      <div className="p-3.5 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-1">
          {/* Tên tác phẩm cho phép nhấp đúp hoặc bấm icon để sửa trực tiếp */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1 mr-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="w-full text-sm font-heading font-bold px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-accent)] outline-none text-[var(--color-ink-primary)]"
              />
              <button onClick={handleSaveTitle} className="text-[var(--color-accent)] p-1">
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 flex-1 cursor-pointer group truncate mr-2"
              onClick={() => {
                setTempTitle(project.title);
                setIsEditingTitle(true);
              }}
              title="Nhấp để đổi tên tác phẩm"
            >
              <h1 className="font-heading font-bold text-base text-[var(--color-ink-primary)] truncate">
                {project.title || 'Tiểu Thuyết Chưa Đặt Tên'}
              </h1>
              <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-[var(--color-ink-tertiary)] flex-shrink-0" />
            </div>
          )}

          {/* Nút quản lý tác phẩm & đổi theme */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowExportModal(true)}
              className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] transition-colors"
              title="Xuất bản thảo (.txt, .md, .html) hoặc Sao lưu / Nạp dữ liệu (.json)"
            >
              <Download size={15} />
            </button>
            <button
              onClick={() => setShowProjectModal(true)}
              className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-accent)]"
              title="Danh sách tác phẩm khác / Thêm tiểu thuyết mới"
            >
              <Library size={16} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)]"
              title={`Đổi chủ đề (Hiện tại: ${settings.theme})`}
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        <span className="text-[10px] text-[var(--color-ink-tertiary)] uppercase tracking-wider block">
          Tác giả: {project.author || 'Chưa đặt'}
        </span>
      </div>

      {/* Modal Quản Lý Nhiều Tác Phẩm */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md p-6 text-[var(--color-ink-primary)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Library size={18} className="text-[var(--color-accent)]" />
                <h2 className="font-heading font-bold text-lg">Kho Tác Phẩm Của Bạn</h2>
              </div>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-xs text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-5 pr-1">
              {projectsList.map((p) => {
                const isCurrent = p.id === project.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isCurrent) {
                        closeAllTabs();
                        switchProject(p.id);
                        setShowProjectModal(false);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <div>
                      <div className="text-sm text-[var(--color-ink-primary)]">{p.title}</div>
                      <div className="text-[10px] text-[var(--color-ink-secondary)]">
                        {p.author || 'Tác giả'} • Cập nhật: {new Date(p.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white">
                          Đang viết
                        </span>
                      )}
                      {projectsList.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Bạn chắc chắn muốn xoá vĩnh viễn tác phẩm "${p.title}"?`)) {
                              deleteProject(p.id);
                            }
                          }}
                          className="p-1 hover:text-[var(--color-destructive)] text-[var(--color-ink-tertiary)]"
                          title="Xoá tác phẩm này"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => {
                  setShowProjectModal(false);
                  setShowExportModal(true);
                }}
                className="text-[11px] text-[var(--color-accent)] hover:underline flex items-center gap-1 font-medium"
              >
                <Download size={12} /> Xuất & Sao lưu (.txt, .md, .json)
              </button>
              <button
                onClick={() => {
                  if (confirm('BẠN CÓ CHẮC CHẮN MUỐN XOÁ SẠCH TOÀN BỘ DỮ LIỆU ĐỂ BẮT ĐẦU DỰ ÁN MỚI?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="text-[11px] text-[var(--color-destructive)] hover:underline flex items-center gap-1 font-medium"
              >
                <Trash2 size={12} /> Xoá sạch (Reset)
              </button>
            </div>

            <button
              onClick={() => {
                const name = prompt('Nhập tên tác phẩm mới:');
                if (name && name.trim()) {
                  closeAllTabs();
                  createNewProject(name.trim());
                  setShowProjectModal(false);
                }
              }}
              className="w-full py-2.5 rounded-xl bg-[var(--color-accent)] text-white font-semibold text-xs hover:bg-[var(--color-accent-hover)] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus size={16} /> Tạo Thêm Tác Phẩm Mới
            </button>
          </div>
        </div>
      )}

      {/* Global Search Bar */}
      <div className="p-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-primary)] text-xs">
          <Search size={14} className="text-[var(--color-ink-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhân vật, hồi, chương..."
            className="w-full bg-transparent outline-none text-xs"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] px-2">
            Kết quả tìm kiếm ({searchResults.length})
          </span>
          {searchResults.map((r, i) => (
            <div
              key={i}
              onClick={() => {
                openTab({ type: r.type, title: r.title, entityId: r.entityId });
                setSearchQuery('');
              }}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] cursor-pointer text-xs"
            >
              <div className="font-semibold text-[var(--color-ink-primary)]">{r.title}</div>
              <div className="text-[11px] text-[var(--color-ink-tertiary)] truncate">{r.snippet}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Navigation List */}
      {!searchQuery.trim() && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Section: Bảng Tra Cứu Trực Quan */}
          <div
            onClick={() =>
              openTab({
                type: 'category-matrix',
                title: 'Bảng Tổng Hợp Danh Mục',
              })
            }
            className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-primary)] font-semibold text-xs cursor-pointer hover:border-[var(--color-accent)] transition-all shadow-2xs"
          >
            <Table size={15} className="text-[var(--color-accent)]" />
            <span>Bảng Dữ Liệu Trực Quan Hóa</span>
          </div>

          {/* Nút mở Sơ đồ khái niệm bối cảnh */}
          <div
            onClick={() =>
              openTab({
                type: 'world-bible-diagram',
                title: 'Sơ Đồ Khái Niệm Bối Cảnh',
              })
            }
            className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-primary)] font-semibold text-xs cursor-pointer hover:border-[var(--color-accent)] transition-all shadow-2xs"
          >
            <Network size={15} className="text-purple-500" />
            <span>Sơ Đồ Khái Niệm Bối Cảnh</span>
          </div>

          {/* Section: Thiết Lập Bối Cảnh (Hệ thống sức mạnh, World Building, Thế lực, Cốt truyện) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--color-ink-tertiary)] uppercase px-1">
              Thiết Lập Bối Cảnh
            </span>

            <div
              onClick={() =>
                openTab({
                  type: 'power-system',
                  title: 'Hệ Thống Sức Mạnh',
                })
              }
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[var(--color-surface-hover)] cursor-pointer text-xs font-medium text-[var(--color-ink-primary)]"
            >
              <Zap size={14} className="text-amber-500" />
              <span>Hệ Thống Sức Mạnh</span>
            </div>

            <div
              onClick={() =>
                openTab({
                  type: 'world-building',
                  title: 'World Building & Bối Cảnh',
                })
              }
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[var(--color-surface-hover)] cursor-pointer text-xs font-medium text-[var(--color-ink-primary)]"
            >
              <Globe size={14} className="text-blue-500" />
              <span>World Building & Bối Cảnh</span>
            </div>

            <div
              onClick={() =>
                openTab({
                  type: 'faction',
                  title: 'Thế Lực & Giai Cấp',
                })
              }
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[var(--color-surface-hover)] cursor-pointer text-xs font-medium text-[var(--color-ink-primary)]"
            >
              <Shield size={14} className="text-red-500" />
              <span>Thế Lực, Bang Phái & Giai Cấp</span>
            </div>

            <div
              onClick={() =>
                openTab({
                  type: 'plot',
                  title: 'Cốt Truyện & Tuyến Tính',
                })
              }
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[var(--color-surface-hover)] cursor-pointer text-xs font-medium text-[var(--color-ink-primary)]"
            >
              <BookOpen size={14} className="text-purple-500" />
              <span>Cốt Truyện & Tuyến Tính</span>
            </div>
          </div>

          {/* Section: Chương & Hồi */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[var(--color-ink-secondary)] px-1 mb-1.5">
              <button
                onClick={() => toggleSection('chapters')}
                className="flex items-center gap-1.5 hover:text-[var(--color-ink-primary)]"
              >
                {collapsedSections.chapters ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                <BookOpen size={14} />
                <span>Bản Thảo Chương Hồi</span>
              </button>
              <button
                onClick={() => {
                  const ch = addChapter();
                  openTab({ type: 'chapter', title: ch.title, entityId: ch.id });
                }}
                className="p-1 hover:bg-[var(--color-surface-hover)] rounded text-[var(--color-accent)]"
                title="Thêm chương mới"
              >
                <Plus size={14} />
              </button>
            </div>

            {!collapsedSections.chapters && (
              <div className="pl-2 space-y-1">
                {project.chapters?.map((ch) => (
                  <div key={ch.id} className="space-y-0.5">
                    {/* Hàng Tiêu Đề Chương */}
                    <div
                      onClick={() => openTab({ type: 'chapter', title: ch.title, entityId: ch.id })}
                      className="flex items-center justify-between p-1.5 rounded-md hover:bg-[var(--color-surface-hover)] text-xs font-medium text-[var(--color-ink-primary)] cursor-pointer group"
                    >
                      <span className="truncate font-semibold">{ch.title}</span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        {/* Đổi tên chương */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTitle = prompt('Nhập tên mới cho chương này:', ch.title);
                            if (newTitle && newTitle.trim()) {
                              updateChapter(ch.id, { title: newTitle.trim() });
                            }
                          }}
                          className="p-1 rounded text-[var(--color-ink-tertiary)] hover:text-[var(--color-accent)] opacity-70 hover:opacity-100"
                          title="Đổi tên chương"
                        >
                          <Edit2 size={12} />
                        </button>

                        {/* Thêm phân cảnh */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const s = addScene(ch.id);
                            openTab({ type: 'chapter', title: s.title, entityId: s.id });
                          }}
                          className="p-1 rounded text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                          title="Thêm phân cảnh"
                        >
                          <Plus size={12} />
                        </button>

                        {/* Xoá chương (cho phép xoá bất kỳ chương nào) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Bạn có chắc muốn xoá chương "${ch.title}" và toàn bộ các hồi bên trong?`)) {
                              const sceneIds = ch.scenes ? ch.scenes.map((s) => s.id) : [];
                              closeTabsByEntityIds([ch.id, ...sceneIds]);
                              deleteChapter(ch.id);
                            }
                          }}
                          className="p-1 rounded text-[var(--color-ink-tertiary)] hover:text-[var(--color-destructive)] opacity-70 hover:opacity-100"
                          title="Xoá chương này"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Danh sách phân cảnh (Scenes / Hồi) */}
                    <div className="pl-3 space-y-0.5 border-l border-[var(--color-border)] ml-2">
                      {ch.scenes?.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => openTab({ type: 'chapter', title: s.title, entityId: s.id })}
                          className="p-1 rounded text-[11px] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink-primary)] hover:bg-[var(--color-surface-hover)] cursor-pointer truncate flex items-center justify-between group"
                        >
                          <span className="truncate">{s.title}</span>
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                            {/* Đổi tên hồi */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newTitle = prompt('Nhập tên mới cho phân cảnh/hồi này:', s.title);
                                if (newTitle && newTitle.trim()) {
                                  updateScene(s.id, { title: newTitle.trim() });
                                }
                              }}
                              className="p-0.5 text-[var(--color-ink-tertiary)] hover:text-[var(--color-accent)]"
                              title="Đổi tên hồi này"
                            >
                              <Edit2 size={11} />
                            </button>

                            {/* Xoá hồi (cho phép xoá bất kỳ hồi nào) */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Xoá phân cảnh "${s.title}"?`)) {
                                  closeTabsByEntityId(s.id);
                                  deleteScene(s.id);
                                }
                              }}
                              className="p-0.5 text-[var(--color-ink-tertiary)] hover:text-[var(--color-destructive)]"
                              title="Xoá phân cảnh này"
                            >
                              <Trash2 size={11} />
                            </button>

                            {s.drawingStrokes && s.drawingStrokes.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] flex-shrink-0" title="Có nét vẽ tay" />
                            )}
                          </div>
                        </div>
                      ))}

                      {(!ch.scenes || ch.scenes.length === 0) && (
                        <div className="pl-2 py-1 text-[11px] text-[var(--color-ink-tertiary)] italic flex items-center justify-between">
                          <span>Chưa có hồi nào</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const s = addScene(ch.id);
                              openTab({ type: 'chapter', title: s.title, entityId: s.id });
                            }}
                            className="text-[10px] text-[var(--color-accent)] hover:underline font-medium"
                          >
                            + Thêm hồi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Bách khoa toàn thư / Lore đã bị gỡ bỏ để tinh giản hoàn toàn */}

          {/* Section: Nhân vật */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[var(--color-ink-secondary)] px-1 mb-1.5">
              <button
                onClick={() => toggleSection('characters')}
                className="flex items-center gap-1.5 hover:text-[var(--color-ink-primary)]"
              >
                {collapsedSections.characters ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                <Users size={14} />
                <span>Nhân Vật ({project.characters?.length || 0})</span>
              </button>
              <div className="flex items-center gap-1">
                {/* Nút mở Sơ đồ mạng lưới quan hệ */}
                <button
                  onClick={() =>
                    openTab({
                      type: 'relationship-graph',
                      title: 'Sơ Đồ Mạng Lưới Nhân Vật',
                    })
                  }
                  className="p-1 hover:bg-[var(--color-surface-hover)] rounded text-purple-500"
                  title="Mở Sơ Đồ Mạng Lưới Quan Hệ Nhân Vật"
                >
                  <GitFork size={14} />
                </button>
                <button
                  onClick={() => {
                    const c = addCharacter();
                    openTab({ type: 'character', title: c.name, entityId: c.id });
                  }}
                  className="p-1 hover:bg-[var(--color-surface-hover)] rounded text-[var(--color-accent)]"
                  title="Thêm nhân vật mới"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {!collapsedSections.characters && (
              <div className="pl-3 space-y-1">
                {/* Nút mở Sơ đồ mạng lưới quan hệ nổi bật */}
                <div
                  onClick={() =>
                    openTab({
                      type: 'relationship-graph',
                      title: 'Sơ Đồ Mạng Lưới Nhân Vật',
                    })
                  }
                  className="flex items-center gap-2 p-1.5 px-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-primary)] font-semibold text-xs cursor-pointer hover:border-purple-400 hover:text-purple-600 transition-all shadow-2xs mb-1.5"
                  title="Xem toàn bộ các nhân vật và mối liên kết dạng sơ đồ mạng lưới"
                >
                  <GitFork size={13} className="text-purple-500" />
                  <span>Xem Sơ Đồ Mạng Lưới</span>
                </div>

                {project.characters?.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => openTab({ type: 'character', title: c.name, entityId: c.id })}
                    className="flex items-center justify-between p-1.5 rounded-md text-xs text-[var(--color-ink-primary)] hover:bg-[var(--color-surface-hover)] cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.color || '#D97706' }}
                      />
                      <span className="truncate">{c.name}</span>
                    </div>
                    {/* Luôn hiển thị nút thùng rác rõ ràng (opacity-70) để dễ bấm xoá */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc chắn muốn xoá nhân vật "${c.name}"?`)) {
                          closeTabsByEntityId(c.id);
                          const updated = project.characters.filter((item) => item.id !== c.id);
                          updateProject({ characters: updated });
                        }
                      }}
                      className="p-1 rounded text-[var(--color-destructive)] hover:bg-[var(--color-destructive)] hover:text-white transition-colors opacity-70 hover:opacity-100"
                      title={`Xoá nhân vật ${c.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Nút Reset Dữ Liệu Ngay Trong Sidebar */}
            <div className="pt-2 border-t border-[var(--color-border)] px-1">
              <button
                onClick={() => {
                  if (confirm('BẠN CÓ CHẮC MUỐN XOÁ SẠCH TOÀN BỘ DỮ LIỆU ĐỂ BẮT ĐẦU TÁC PHẨM MỚI TINH?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full py-1.5 px-2 rounded-lg border border-dashed border-[var(--color-destructive)] text-[var(--color-destructive)] text-[11px] font-semibold hover:bg-[var(--color-destructive)] hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} /> Xoá Sạch Dữ Liệu (Reset 100%)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export & Backup Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </aside>
  );
};
