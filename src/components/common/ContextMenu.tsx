import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [adjustedPos, setAdjustedPos] = useState(position);

  // Auto-position near screen edges
  useEffect(() => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    let { x, y } = position;

    if (x + rect.width > window.innerWidth - 8) {
      x = window.innerWidth - rect.width - 8;
    }
    if (y + rect.height > window.innerHeight - 8) {
      y = window.innerHeight - rect.height - 8;
    }
    x = Math.max(8, x);
    y = Math.max(8, y);

    setAdjustedPos({ x, y });
  }, [position]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use setTimeout to avoid the same click that opened the menu closing it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close on scroll
  useEffect(() => {
    const handleScroll = () => onClose();
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const actionableItems = items.filter((item) => !item.divider && !item.disabled);

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown': {
          e.preventDefault();
          setFocusIndex((prev) => {
            let next = prev + 1;
            while (next < items.length && (items[next].divider || items[next].disabled)) {
              next++;
            }
            return next < items.length ? next : prev;
          });
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setFocusIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && (items[next].divider || items[next].disabled)) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < items.length) {
            const item = items[focusIndex];
            if (!item.disabled && !item.divider) {
              item.action();
              onClose();
            }
          }
          break;
        }
      }
    },
    [items, focusIndex, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus the menu on mount
  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  return (
    <div
      ref={menuRef}
      tabIndex={-1}
      className="
        fixed min-w-[180px] py-1
        bg-[var(--color-surface)] border border-[var(--color-border)]
        rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]
        outline-none animate-[ctxIn_100ms_ease]
        font-[family-name:var(--font-ui)]
      "
      style={{
        zIndex: 'var(--z-dropdown)',
        top: adjustedPos.y,
        left: adjustedPos.x,
      }}
      role="menu"
    >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <div
              key={`divider-${index}`}
              className="my-1 h-px bg-[var(--color-border)]"
              role="separator"
            />
          );
        }

        const isFocused = focusIndex === index;

        return (
          <button
            key={`item-${index}`}
            role="menuitem"
            disabled={item.disabled}
            className={`
              flex items-center w-full px-3 py-1.5 text-sm text-left gap-2.5
              transition-colors duration-[var(--transition-fast)]
              ${item.disabled
                ? 'text-[var(--color-ink-tertiary)] cursor-not-allowed'
                : 'text-[var(--color-ink-primary)] hover:bg-[var(--color-surface-hover)] cursor-pointer'
              }
              ${isFocused && !item.disabled ? 'bg-[var(--color-surface-hover)]' : ''}
            `}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            onMouseEnter={() => setFocusIndex(index)}
          >
            {item.icon && (
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-[var(--color-ink-secondary)]">
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-[var(--color-ink-tertiary)] ml-4">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}

      <style>{`
        @keyframes ctxIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
