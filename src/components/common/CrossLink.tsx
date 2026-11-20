import React from 'react';
import { useTabStore } from '@/stores/tabStore';
import type { TabType } from '@/types';

interface CrossLinkSpanProps {
  term: string;
  targetType: TabType;
  targetId: string;
  description?: string;
}

export const CrossLinkSpan: React.FC<CrossLinkSpanProps> = ({
  term,
  targetType,
  targetId,
  description,
}) => {
  const { openTab } = useTabStore();

  const handleClick = (e: React.MouseEvent) => {
    // If Ctrl is pressed, navigate to target entity
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      openTab({
        type: targetType,
        title: term,
        entityId: targetId,
      });
    }
  };

  return (
    <span
      onClick={handleClick}
      title={description ? `${description} (Giữ Ctrl + Chuột trái để mở)` : 'Giữ Ctrl + Chuột trái để mở'}
      className="cross-link border-b border-dashed border-[var(--color-crosslink)] text-[var(--color-crosslink)] hover:bg-[var(--color-crosslink)] hover:text-white px-1 py-0.5 rounded cursor-pointer transition-colors"
    >
      {term}
    </span>
  );
};

