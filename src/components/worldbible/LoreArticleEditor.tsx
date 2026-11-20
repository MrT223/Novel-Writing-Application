import React, { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTabStore } from '@/stores/tabStore';
import {
  BookOpen,
  Plus,
  Trash2,
  Tag,
  Sparkles,
  Link2,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { WorldLoreArticle } from '@/types';

interface LoreArticleEditorProps {
  articleId?: string;
}

const LORE_CATEGORIES = [
  { id: 'history', label: 'Biến cố Lịch sử & Kỷ nguyên' },
  { id: 'cosmology', label: 'Vũ trụ luận & Cấu trúc Thế giới' },
  { id: 'religion', label: 'Tín ngưỡng, Thần linh & Giáo phái' },
  { id: 'artifact', label: 'Thần khí, Cổ vật & Bảo pháp' },
  { id: 'culture', label: 'Tập tục, Lễ hội & Ngôn ngữ' },
  { id: 'race', label: 'Chủng tộc & Dị thú' },
  { id: 'custom', label: 'Ghi chép tự do khác' },
];

export const LoreArticleEditor: React.FC<LoreArticleEditorProps> = ({ articleId }) => {
  const { project, updateProject } = useProjectStore();
  const { openTab } = useTabStore();

  const loreArticles = project.loreArticles || [];
  const currentArticle = loreArticles.find((a) => a.id === articleId) || loreArticles[0];

  const [tagInput, setTagInput] = useState('');

  if (!currentArticle) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--color-ink-secondary)] p-8 text-center">
        <Compass size={36} className="text-[var(--color-accent)] mb-3" />
        <h2 className="text-lg font-heading font-bold text-[var(--color-ink-primary)] mb-1">
          Chưa có mục ghi chép World-Building nào
        </h2>
        <p className="text-xs max-w-sm mb-4">
          Tạo các bài viết chuyên sâu về thần thoại, cổ vật, chủng tộc, tín ngưỡng để hoàn thiện thế giới của bạn.
        </p>
        <button
          onClick={() => {
            const newArt: WorldLoreArticle = {
              id: uuidv4(),
              title: 'Cổ Vật: Gương Thái Cổ',
              category: 'artifact',
              content: 'Tương truyền chiếc gương này phản chiếu chân linh vạn vật...',
              tags: ['Thần Khí', 'Thái Cổ'],
              relatedEntityIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            updateProject({ loreArticles: [newArt] });
          }}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
        >
          + Tạo Mục Khởi Đầu
        </button>
      </div>
    );
  }

  const handleUpdate = (partial: Partial<WorldLoreArticle>) => {
    const updated = loreArticles.map((a) =>
      a.id === currentArticle.id ? { ...a, ...partial, updatedAt: new Date().toISOString() } : a
    );
    updateProject({ loreArticles: updated });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const updatedTags = [...(currentArticle.tags || []), tagInput.trim()];
      handleUpdate({ tags: updatedTags });
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    const updatedTags = (currentArticle.tags || []).filter((tag) => tag !== t);
    handleUpdate({ tags: updatedTags });
  };

  return (
    <div className="h-full overflow-y-auto p-8 max-w-5xl mx-auto bg-[var(--color-surface)]">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            World Lore & Bách Khoa Toàn Thư
          </span>
          <select
            value={currentArticle.category}
            onChange={(e) => handleUpdate({ category: e.target.value as any })}
            className="text-xs px-2.5 py-1 rounded bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-primary)] outline-none"
          >
            {LORE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          value={currentArticle.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          placeholder="Tiêu đề mục khảo cứu (VD: Trận Chiến Hoàng Hôn, Thần Tộc Cổ Xưa...)"
          className="text-3xl font-heading font-bold text-[var(--color-ink-primary)] bg-transparent border-b border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none w-full pb-1"
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Tag size={13} className="text-[var(--color-ink-tertiary)]" />
          {currentArticle.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-primary)]"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-[var(--color-destructive)] text-[10px]"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Gõ tag + Enter..."
            className="text-xs px-2 py-0.5 rounded bg-transparent border-b border-[var(--color-border)] outline-none w-28 text-[var(--color-ink-primary)]"
          />
        </div>
      </div>

      {/* Editor Body */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
          Nội dung chuyên khảo & Luận thuyết
        </label>
        <textarea
          rows={16}
          value={currentArticle.content}
          onChange={(e) => handleUpdate({ content: e.target.value })}
          placeholder="Viết tất cả những nghiên cứu, nguồn gốc lịch sử, bí mật huyền thoại của yếu tố này..."
          className="w-full text-base p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)] leading-relaxed font-body shadow-inner"
        />
      </div>
    </div>
  );
};

