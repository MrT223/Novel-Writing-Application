import React, { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useWorldBibleStore } from '@/stores/worldBibleStore';
import { useTabStore } from '@/stores/tabStore';
import { User, Shield, Zap, Heart, Plus, Trash2, Tag, Sparkles, X, GitFork } from 'lucide-react';

interface CharacterEditorProps {
  characterId: string;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ characterId }) => {
  const { project, updateProject } = useProjectStore();
  const { updateCharacter } = useWorldBibleStore();
  const { openTab, closeTabsByEntityId } = useTabStore();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'backstory' | 'abilities' | 'relationships'>('profile');

  // Alias State (Đặt toàn bộ Hooks lên đầu trước mọi return statement)
  const [aliasInput, setAliasInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Abilities State
  const [newAbilityInput, setNewAbilityInput] = useState('');

  // Relationships State
  const [showAddRelModal, setShowAddRelModal] = useState(false);
  const [relTargetId, setRelTargetId] = useState('');
  const [relLabel, setRelLabel] = useState('Bằng hữu');
  const [relColor, setRelColor] = useState('#D97706');
  const [relDesc, setRelDesc] = useState('');

  const character = project.characters.find((c) => c.id === characterId);

  // Nếu nhân vật bị xoá khi đang xem tab này: Hiển thị thông báo an toàn, không làm crash React
  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[var(--color-surface)] select-none">
        <User size={48} className="text-[var(--color-ink-tertiary)] opacity-40 mb-3" />
        <h3 className="font-heading text-lg font-bold text-[var(--color-ink-primary)]">
          Nhân vật này đã được xoá
        </h3>
        <p className="text-xs text-[var(--color-ink-secondary)] max-w-sm mt-1 mb-4">
          Dữ liệu nhân vật này không còn tồn tại trong tác phẩm. Bạn có thể đóng tab này hoặc chọn nhân vật khác ở Sidebar.
        </p>
        <button
          onClick={() => closeTabsByEntityId(characterId)}
          className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
        >
          Đóng Tab Này
        </button>
      </div>
    );
  }

  const handleAddAlias = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && aliasInput.trim()) {
      e.preventDefault();
      const updated = [...(character.aliases || []), aliasInput.trim()];
      updateCharacter(character.id, { aliases: updated });
      setAliasInput('');
    }
  };

  const handleRemoveAlias = (index: number) => {
    const updated = character.aliases.filter((_, i) => i !== index);
    updateCharacter(character.id, { aliases: updated });
  };

  const handleAddAbility = () => {
    if (newAbilityInput.trim()) {
      const updated = [...(character.abilities || []), newAbilityInput.trim()];
      updateCharacter(character.id, { abilities: updated });
      setNewAbilityInput('');
    }
  };

  const handleAddExtractedPower = (powerName: string) => {
    if (!character.abilities?.includes(powerName)) {
      const updated = [...(character.abilities || []), powerName];
      updateCharacter(character.id, { abilities: updated });
    }
  };

  const handleAddRelationship = () => {
    if (!relTargetId) return;
    const newRel = {
      targetCharacterId: relTargetId,
      type: 'custom' as const,
      label: relLabel.trim() || 'Bằng hữu',
      color: relColor,
      description: relDesc.trim(),
    };
    const updated = [...(character.relationships || []), newRel];
    updateCharacter(character.id, { relationships: updated });
    setRelTargetId('');
    setRelLabel('Bằng hữu');
    setRelColor('#D97706');
    setRelDesc('');
    setShowAddRelModal(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-[var(--color-surface)]">
      {/* Cột trái: Thẻ tóm tắt thông tin */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[var(--color-border)] p-6 bg-[var(--color-sidebar-bg)] overflow-y-auto">
        <div className="flex flex-col items-center text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center font-heading text-3xl font-bold text-white shadow-lg mb-4"
            style={{ backgroundColor: character.color || 'var(--color-accent)' }}
          >
            {character.name ? character.name.slice(0, 1) : '?'}
          </div>

          <input
            type="text"
            value={character.name}
            onChange={(e) => updateCharacter(character.id, { name: e.target.value })}
            placeholder="Tên nhân vật"
            className="text-xl font-heading font-bold text-center bg-transparent border-b border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none w-full pb-1 text-[var(--color-ink-primary)]"
          />

          {/* Vai trò / Danh phận nhân vật (Tự do custom không giới hạn) */}
          <div className="w-full mt-3 text-left">
            <label className="text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] block mb-1">
              Vai Trò / Danh Phận (Tự Do Đặt Tên)
            </label>
            <input
              type="text"
              value={character.role || ''}
              onChange={(e) => updateCharacter(character.id, { role: e.target.value })}
              placeholder="VD: Nhân vật chính, Phản diện, Sư phụ, Ẩn thế cao nhân..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-primary)] font-semibold outline-none focus:border-[var(--color-accent)]"
            />
            {/* Gợi ý vai trò nhanh (chỉ để tham khảo, bấm là gán) */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[
                'Nhân vật chính',
                'Phản diện',
                'Nhân vật phụ',
                'Sư phụ',
                'Kỳ phùng địch thủ',
                'Đạo lữ',
                'Boss ẩn',
                'Linh thú',
              ].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => updateCharacter(character.id, { role: sug })}
                  className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${
                    character.role === sug
                      ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Tags phân loại nhân vật tự do (Custom Tags) */}
          <div className="w-full mt-4 text-left">
            <span className="text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] flex items-center gap-1 mb-1.5">
              <Tag size={11} className="text-[var(--color-accent)]" /> Tags Đặc Điểm / Phân Loại
            </span>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {character.tags?.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold border border-[var(--color-accent)]/30"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = character.tags?.filter((_, i) => i !== idx);
                      updateCharacter(character.id, { tags: updated });
                    }}
                    className="hover:text-[var(--color-destructive)] text-[11px] ml-0.5"
                    title="Xoá tag này"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault();
                  if (!character.tags?.includes(tagInput.trim())) {
                    const updated = [...(character.tags || []), tagInput.trim()];
                    updateCharacter(character.id, { tags: updated });
                  }
                  setTagInput('');
                }
              }}
              placeholder="Thêm tag (VD: Kiếm tu, Trọng sinh, Lạnh lùng...) + Enter"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Danh xưng khác (Aliases) */}
          <div className="w-full mt-6 text-left">
            <span className="text-xs font-semibold text-[var(--color-ink-secondary)] flex items-center gap-1 mb-2">
              <Tag size={13} /> Danh hiệu / Biệt danh
            </span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {character.aliases?.map((alias, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-primary)]"
                >
                  {alias}
                  <button
                    onClick={() => handleRemoveAlias(idx)}
                    className="hover:text-[var(--color-destructive)] text-[10px]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              onKeyDown={handleAddAlias}
              placeholder="Nhập biệt danh rồi nhấn Enter..."
              className="w-full text-xs px-2.5 py-1.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Màu sắc nhận diện */}
          <div className="w-full mt-6 text-left">
            <span className="text-xs font-semibold text-[var(--color-ink-secondary)] mb-2 block">
              Màu biểu trưng
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={character.color || '#D97706'}
                onChange={(e) => updateCharacter(character.id, { color: e.target.value })}
                className="w-8 h-8 rounded border-none cursor-pointer"
              />
              <span className="text-xs font-mono text-[var(--color-ink-tertiary)]">
                {character.color}
              </span>
            </div>
          </div>

          {/* Nút xem trong sơ đồ quan hệ & Nút xoá nhân vật */}
          <div className="w-full mt-6 pt-4 border-t border-[var(--color-border)] space-y-2">
            <button
              onClick={() =>
                openTab({
                  type: 'relationship-graph',
                  title: 'Sơ Đồ Mạng Lưới Nhân Vật',
                })
              }
              className="w-full py-2 px-3 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              title="Mở sơ đồ mạng lưới toàn thể các nhân vật"
            >
              <GitFork size={14} className="text-purple-500" />
              <span>Xem Bản Đồ Mạng Lưới</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xoá vĩnh viễn nhân vật "${character.name}"?`)) {
                  closeTabsByEntityId(character.id);
                  const updated = project.characters.filter((item) => item.id !== character.id);
                  updateProject({ characters: updated });
                }
              }}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-[var(--color-destructive)] text-[var(--color-destructive)] hover:bg-[var(--color-destructive)] hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100"
              title="Xoá vĩnh viễn nhân vật này khỏi tác phẩm"
            >
              <Trash2 size={13} />
              <span>Xoá Nhân Vật Này</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cột phải: Chi tiết hồ sơ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navigation tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeSubTab === 'profile'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
                : 'border-transparent text-[var(--color-ink-secondary)] hover:text-[var(--color-ink-primary)]'
            }`}
          >
            Hồ sơ & Tính cách
          </button>
          <button
            onClick={() => setActiveSubTab('backstory')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeSubTab === 'backstory'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
                : 'border-transparent text-[var(--color-ink-secondary)] hover:text-[var(--color-ink-primary)]'
            }`}
          >
            Tiểu sử & Quá khứ
          </button>
          <button
            onClick={() => setActiveSubTab('abilities')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeSubTab === 'abilities'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
                : 'border-transparent text-[var(--color-ink-secondary)] hover:text-[var(--color-ink-primary)]'
            }`}
          >
            Năng lực & Tuyệt kỹ
          </button>
          <button
            onClick={() => setActiveSubTab('relationships')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeSubTab === 'relationships'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
                : 'border-transparent text-[var(--color-ink-secondary)] hover:text-[var(--color-ink-primary)]'
            }`}
          >
            Mối quan hệ
          </button>
        </div>

        {/* Tab contents */}
        <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
                  Tóm tắt nhân vật
                </label>
                <textarea
                  rows={3}
                  value={character.description}
                  onChange={(e) => updateCharacter(character.id, { description: e.target.value })}
                  placeholder="Mô tả tổng quan về vai trò và đặc điểm cốt lõi..."
                  className="w-full text-sm p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
                  Ngoại hình & Nhận diện
                </label>
                <textarea
                  rows={3}
                  value={character.appearance}
                  onChange={(e) => updateCharacter(character.id, { appearance: e.target.value })}
                  placeholder="Vóc dáng, y phục, ánh mắt, vết sẹo, cổ vật đeo bên mình..."
                  className="w-full text-sm p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
                  Tính cách & Điểm yếu nội tâm
                </label>
                <textarea
                  rows={3}
                  value={character.personality}
                  onChange={(e) => updateCharacter(character.id, { personality: e.target.value })}
                  placeholder="Thói quen, nguyên tắc sống, nỗi sợ hãi, khát vọng ngầm..."
                  className="w-full text-sm p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
                  Mục tiêu tối thượng (Motivation & Goals)
                </label>
                <textarea
                  rows={2}
                  value={character.goals}
                  onChange={(e) => updateCharacter(character.id, { goals: e.target.value })}
                  placeholder="Mục đích sống, thù hận cần trả hoặc lý tưởng muốn vươn tới..."
                  className="w-full text-sm p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'backstory' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
                Dòng thời gian cuộc đời & Sự kiện biến cố
              </label>
              <textarea
                rows={12}
                value={character.backstory}
                onChange={(e) => updateCharacter(character.id, { backstory: e.target.value })}
                placeholder="Nguồn gốc gia thế, tuổi thơ, những bước ngoặt đưa đẩy nhân vật vào cốt truyện..."
                className="w-full text-sm p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)] leading-relaxed font-body"
              />
            </div>
          )}

          {activeSubTab === 'abilities' && (
            <div className="space-y-6">
              {/* Form thêm năng lực / tuyệt kỹ */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs space-y-3">
                <label className="block text-xs font-bold text-[var(--color-ink-primary)] flex items-center gap-1.5">
                  <Plus size={14} className="text-[var(--color-accent)]" />
                  Thêm Năng Lực / Tuyệt Kỹ Mới
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAbilityInput}
                    onChange={(e) => setNewAbilityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAbility();
                      }
                    }}
                    placeholder="Nhập tên tuyệt kỹ, công pháp, bí thuật hoặc năng lực (VD: Cửu U Kiếm Khí, Hỏa Cầu Thuật...)"
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
                  />
                  <button
                    onClick={handleAddAbility}
                    className="px-4 py-2 bg-[var(--color-accent)] hover:opacity-90 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Plus size={14} /> Thêm Kỹ Năng
                  </button>
                </div>

                {/* Gợi ý nhanh từ danh mục Hệ thống sức mạnh đã trích xuất */}
                {project.extractedCategories &&
                  project.extractedCategories.filter((c) => c.domain === 'power-system').length > 0 && (
                    <div className="pt-2 border-t border-[var(--color-border)]">
                      <span className="text-[10px] font-semibold text-[var(--color-ink-tertiary)] uppercase block mb-1.5 flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-500" /> Gợi ý từ Hệ Thống Sức Mạnh đã soạn:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.extractedCategories
                          .filter((c) => c.domain === 'power-system')
                          .map((cat) => {
                            const isAdded = character.abilities?.includes(cat.name);
                            return (
                              <button
                                key={cat.id}
                                disabled={isAdded}
                                onClick={() => handleAddExtractedPower(cat.name)}
                                className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${
                                  isAdded
                                    ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)] opacity-60 cursor-default'
                                    : 'bg-[var(--color-canvas)] border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink-primary)] cursor-pointer'
                                }`}
                                title={isAdded ? 'Đã thêm vào nhân vật' : 'Nhấp để thêm năng lực này'}
                              >
                                <span>{cat.name}</span>
                                {isAdded ? '✓' : '+'}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
              </div>

              {/* Danh sách kỹ năng đã liên kết */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
                  Danh Sách Kỹ Năng Đã Liên Kết ({character.abilities?.length || 0})
                </label>

                {(!character.abilities || character.abilities.length === 0) ? (
                  <div className="p-8 text-center border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-canvas)] text-[var(--color-ink-tertiary)] text-xs">
                    <Zap size={24} className="mx-auto mb-2 text-[var(--color-ink-tertiary)] opacity-50" />
                    <p className="font-medium text-[var(--color-ink-secondary)]">Nhân vật này chưa được liên kết năng lực nào.</p>
                    <p className="text-[11px] mt-1">Hãy nhập tên tuyệt kỹ ở khung phía trên hoặc chọn từ hệ thống sức mạnh để liên kết.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {character.abilities.map((ab, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] hover:border-[var(--color-accent)] transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Zap size={15} className="text-[var(--color-accent)] flex-shrink-0" />
                          <span className="text-sm font-semibold text-[var(--color-ink-primary)]">
                            {ab}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const updated = character.abilities.filter((_, idx) => idx !== i);
                            updateCharacter(character.id, { abilities: updated });
                          }}
                          className="p-1 rounded text-[var(--color-ink-tertiary)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-surface-hover)] transition-colors"
                          title="Gỡ bỏ kỹ năng này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'relationships' && (
            <div className="space-y-6">
              {/* Form thêm mối quan hệ & Nút xem sơ đồ */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider">
                  Mạng Lưới Mối Quan Hệ ({character.relationships?.length || 0})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      openTab({
                        type: 'relationship-graph',
                        title: 'Sơ Đồ Mạng Lưới Nhân Vật',
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-400 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-100 transition-all cursor-pointer shadow-2xs"
                    title="Mở sơ đồ mạng lưới toàn thể các nhân vật"
                  >
                    <GitFork size={13} /> Xem Phiên Bản Sơ Đồ
                  </button>
                  {!showAddRelModal && (
                    <button
                      onClick={() => setShowAddRelModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus size={13} /> Thêm Mối Quan Hệ
                    </button>
                  )}
                </div>
              </div>

              {/* Form nhập mối quan hệ mới */}
              {showAddRelModal && (
                <div className="p-4 rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] shadow-md space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                    <span className="text-xs font-bold text-[var(--color-ink-primary)] flex items-center gap-1.5">
                      <Heart size={14} className="text-[var(--color-accent)]" />
                      Thiết Lập Mối Quan Hệ Mới
                    </span>
                    <button
                      onClick={() => setShowAddRelModal(false)}
                      className="p-1 text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-primary)]"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] mb-1">
                        Nhân Vật Liên Kết
                      </label>
                      <select
                        value={relTargetId}
                        onChange={(e) => setRelTargetId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none"
                      >
                        <option value="">-- Chọn nhân vật đối phương --</option>
                        {project.characters
                          .filter((c) => c.id !== character.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.role})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] mb-1">
                        Mối Quan Hệ (Tự Do Đặt Tên)
                      </label>
                      <input
                        type="text"
                        value={relLabel}
                        onChange={(e) => setRelLabel(e.target.value)}
                        placeholder="VD: Sư đồ, Kẻ thù truyền kiếp, Tri kỷ, Nợ máu..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] font-semibold outline-none focus:border-[var(--color-accent)]"
                      />
                      {/* Gợi ý quan hệ nhanh */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[
                          'Huynh đệ',
                          'Sư đồ',
                          'Kẻ thù',
                          'Tri kỷ',
                          'Đạo lữ',
                          'Túc địch',
                          'Thuộc hạ',
                          'Nợ máu',
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setRelLabel(sug)}
                            className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${
                              relLabel === sug
                                ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                                : 'bg-[var(--color-canvas)] border-[var(--color-border)] text-[var(--color-ink-secondary)]'
                            }`}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Màu sắc đường nối trên sơ đồ */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)]">
                      Màu đường nối trên sơ đồ:
                    </span>
                    <div className="flex items-center gap-2">
                      {['#16A34A', '#DC2626', '#2563EB', '#EC4899', '#9333EA', '#D97706'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setRelColor(col)}
                          className={`w-4 h-4 rounded-full transition-transform ${
                            relColor === col ? 'scale-125 ring-2 ring-offset-1 ring-[var(--color-accent)]' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                      <input
                        type="color"
                        value={relColor}
                        onChange={(e) => setRelColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-none ml-1"
                        title="Tuỳ chọn màu khác"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[var(--color-ink-tertiary)] mb-1">
                      Chi Tiết / Nguồn Gốc Mối Quan Hệ
                    </label>
                    <input
                      type="text"
                      value={relDesc}
                      onChange={(e) => setRelDesc(e.target.value)}
                      placeholder="VD: Từng cứu mạng nhau trong trận chiến Hắc Phong Lĩnh..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)] text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowAddRelModal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-hover)]"
                    >
                      Huỷ
                    </button>
                    <button
                      disabled={!relTargetId}
                      onClick={handleAddRelationship}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50"
                    >
                      Lưu Quan Hệ
                    </button>
                  </div>
                </div>
              )}

              {/* Danh sách mối quan hệ hiện có */}
              {(!character.relationships || character.relationships.length === 0) ? (
                <div className="p-8 text-center border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-canvas)] text-[var(--color-ink-tertiary)] text-xs">
                  <Heart size={24} className="mx-auto mb-2 text-[var(--color-ink-tertiary)] opacity-50" />
                  <p className="font-medium text-[var(--color-ink-secondary)]">Chưa có mối quan hệ nào được thiết lập.</p>
                  <p className="text-[11px] mt-1">Bấm nút "Thêm Mối Quan Hệ" phía trên để kết nối với các nhân vật khác.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {character.relationships.map((rel, idx) => {
                    const target = project.characters.find((c) => c.id === rel.targetCharacterId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] hover:border-[var(--color-accent)] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center font-heading text-sm font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: target?.color || 'var(--color-accent)' }}
                          >
                            {target ? target.name.slice(0, 1) : '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[var(--color-ink-primary)]">
                                {target ? target.name : 'Nhân vật chưa rõ'}
                              </span>
                              <span
                                className="text-[11px] px-2.5 py-0.5 rounded-full font-bold border"
                                style={{
                                  backgroundColor: rel.color ? `${rel.color}15` : 'var(--color-accent-soft)',
                                  color: rel.color || 'var(--color-accent)',
                                  borderColor: rel.color ? `${rel.color}40` : 'var(--color-accent)',
                                }}
                              >
                                {rel.label || rel.type}
                              </span>
                            </div>
                            {rel.description && (
                              <p className="text-xs text-[var(--color-ink-secondary)] mt-0.5">
                                {rel.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updated = character.relationships.filter((_, i) => i !== idx);
                            updateCharacter(character.id, { relationships: updated });
                          }}
                          className="p-1 rounded text-[var(--color-ink-tertiary)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-surface-hover)] transition-colors"
                          title="Xoá mối quan hệ này"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

