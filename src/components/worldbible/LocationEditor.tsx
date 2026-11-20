import React, { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useWorldBibleStore } from '@/stores/worldBibleStore';
import { MapPin, Globe, Compass } from 'lucide-react';

interface LocationEditorProps {
  locationId: string;
}

export const LocationEditor: React.FC<LocationEditorProps> = ({ locationId }) => {
  const { project } = useProjectStore();
  const { updateLocation } = useWorldBibleStore();

  const loc = project.locations.find((l) => l.id === locationId);

  if (!loc) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-ink-secondary)]">
        Không tìm thấy địa điểm này.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto bg-[var(--color-surface)]">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1">
          <MapPin size={14} /> Bản đồ & Xây dựng địa danh
        </div>
        <input
          type="text"
          value={loc.name}
          onChange={(e) => updateLocation(loc.id, { name: e.target.value })}
          placeholder="Tên địa danh / Thành trì / Cấm địa"
          className="text-3xl font-heading font-bold text-[var(--color-ink-primary)] bg-transparent border-b border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none w-full"
        />

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-[var(--color-ink-secondary)]">Quy mô:</span>
          <select
            value={loc.type}
            onChange={(e) => updateLocation(loc.id, { type: e.target.value as any })}
            className="px-2.5 py-1 text-xs rounded bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-primary)] outline-none"
          >
            <option value="continent">Đại lục / Thế giới</option>
            <option value="country">Vương quốc / Lãnh thổ</option>
            <option value="city">Thành đô / Phủ thành</option>
            <option value="village">Thôn trấn / Làng mạc</option>
            <option value="dungeon">Bí cảnh / Cấm địa / Di tích</option>
            <option value="landmark">Kỳ quan / Địa danh thiên nhiên</option>
            <option value="realm">Vị diện / Thế giới song song</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
            Địa lý & Khí hậu đặc trưng
          </label>
          <textarea
            rows={3}
            value={loc.climate}
            onChange={(e) => updateLocation(loc.id, { climate: e.target.value })}
            placeholder="Địa hình đồi núi, đầm lầy, khí hậu băng giá vĩnh cửu, bão cát ma thuật..."
            className="w-full text-sm p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
            Văn hóa, Phong tục & Cư dân
          </label>
          <textarea
            rows={4}
            value={loc.culture}
            onChange={(e) => updateLocation(loc.id, { culture: e.target.value })}
            placeholder="Tín ngưỡng bản địa, ngôn ngữ, tập tục ăn uống, lễ hội truyền thống..."
            className="w-full text-sm p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider mb-2">
            Ý nghĩa lịch sử & Cốt truyện (Significance)
          </label>
          <textarea
            rows={4}
            value={loc.significance}
            onChange={(e) => updateLocation(loc.id, { significance: e.target.value })}
            placeholder="Những trận chiến cổ xưa từng diễn ra, kho báu được chôn giấu..."
            className="w-full text-sm p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-ink-primary)] outline-none focus:border-[var(--color-accent)] font-body leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};

