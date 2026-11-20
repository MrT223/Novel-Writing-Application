import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import {
  Pen,
  Highlighter,
  Eraser,
  Undo2,
  Trash2,
  X,
  Move,
} from 'lucide-react';
import type { DrawingStroke } from '@/types';

const PRESET_COLORS = [
  '#0F172A', // Dark
  '#D97706', // Amber
  '#DC2626', // Red
  '#2563EB', // Blue
  '#16A34A', // Green
  '#9333EA', // Purple
  '#FFFFFF', // White
];

interface DrawingCanvasProps {
  sceneId?: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ sceneId, scrollContainerRef }) => {
  const {
    isDrawingMode,
    drawingTool,
    drawingColor,
    drawingWidth,
    setDrawingMode,
    setDrawingTool,
    setDrawingColor,
    setDrawingWidth,
  } = useEditorStore();

  const { project, updateScene } = useProjectStore();

  // Tìm scene hiện tại để lấy và lưu strokes
  let currentScene = null;
  if (sceneId) {
    for (const ch of project.chapters) {
      const s = ch.scenes.find((sc) => sc.id === sceneId);
      if (s) {
        currentScene = s;
        break;
      }
    }
  }

  const strokes: DrawingStroke[] = currentScene?.drawingStrokes || [];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const currentPoints = useRef<{ x: number; y: number }[]>([]);

  // Redraw strokes
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.width * 3;
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = stroke.width * 2.5;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }, [strokes]);

  // Adjust canvas size to match scrollable content
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = scrollContainerRef?.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = Math.max(container.scrollWidth, container.clientWidth);
      canvas.height = Math.max(container.scrollHeight, container.clientHeight);
      redraw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [scrollContainerRef, redraw, isDrawingMode]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Save new stroke into current Scene in persistent store
  const persistStroke = (newStroke: DrawingStroke) => {
    if (!currentScene) return;
    const updated = [...strokes, newStroke];
    updateScene(currentScene.id, { drawingStrokes: updated });
  };

  const handleClear = () => {
    if (!currentScene) return;
    updateScene(currentScene.id, { drawingStrokes: [] });
  };

  const handleUndo = () => {
    if (!currentScene || strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    updateScene(currentScene.id, { drawingStrokes: updated });
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: e.clientX, y: e.clientY };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Right click: Pan editor scroll view
    if (e.button === 2) {
      const container = scrollContainerRef?.current;
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: container ? container.scrollLeft : 0,
        scrollTop: container ? container.scrollTop : 0,
      });
      return;
    }

    // Left click: Drawing directly over content
    if (e.button === 0) {
      setIsPainting(true);
      const pt = getCanvasCoords(e);
      currentPoints.current = [pt];
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const container = scrollContainerRef?.current;
      if (container) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        container.scrollLeft = panStart.scrollLeft - dx;
        container.scrollTop = panStart.scrollTop - dy;
      }
      return;
    }

    if (!isPainting) return;
    const pt = getCanvasCoords(e);
    currentPoints.current.push(pt);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (drawingTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = drawingWidth * 3;
    } else if (drawingTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawingColor;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = drawingWidth * 2.5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = drawingWidth;
    }

    const pts = currentPoints.current;
    if (pts.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && e.button === 2) {
      setIsPanning(false);
      return;
    }

    if (isPainting && e.button === 0) {
      setIsPainting(false);
      if (currentPoints.current.length > 0) {
        persistStroke({
          id: `${Date.now()}`,
          points: [...currentPoints.current],
          color: drawingColor,
          width: drawingWidth,
          tool: drawingTool,
        });
      }
      currentPoints.current = [];
      redraw();
    }
  };

  return (
    <>
      {/* Floating Toolbar khi đang bật Drawing Mode */}
      {isDrawingMode && (
        <div className="fixed top-14 right-6 z-50 flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-xl p-2 text-[var(--color-ink-primary)] backdrop-blur-md select-none">
          <div className="flex items-center gap-1 border-r border-[var(--color-border)] pr-2">
            <button
              onClick={() => setDrawingTool('pen')}
              className={`p-2 rounded-lg transition-colors ${
                drawingTool === 'pen'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'hover:bg-[var(--color-surface-hover)]'
              }`}
              title="Bút vẽ trực tiếp lên bản thảo"
            >
              <Pen size={17} />
            </button>
            <button
              onClick={() => setDrawingTool('highlighter')}
              className={`p-2 rounded-lg transition-colors ${
                drawingTool === 'highlighter'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'hover:bg-[var(--color-surface-hover)]'
              }`}
              title="Bút dạ quang đánh dấu"
            >
              <Highlighter size={17} />
            </button>
            <button
              onClick={() => setDrawingTool('eraser')}
              className={`p-2 rounded-lg transition-colors ${
                drawingTool === 'eraser'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'hover:bg-[var(--color-surface-hover)]'
              }`}
              title="Cục tẩy"
            >
              <Eraser size={17} />
            </button>
          </div>

          {/* Color Presets */}
          <div className="flex items-center gap-1.5 border-r border-[var(--color-border)] pr-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setDrawingColor(c)}
                className="w-5 h-5 rounded-full border border-black/20 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: drawingColor === c ? '2px solid var(--color-accent)' : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-2 border-r border-[var(--color-border)] pr-2">
            <span className="text-xs font-mono">{drawingWidth}px</span>
            <input
              type="range"
              min={1}
              max={16}
              value={drawingWidth}
              onChange={(e) => setDrawingWidth(Number(e.target.value))}
              className="w-16 accent-[var(--color-accent)] cursor-pointer"
            />
          </div>

          {/* Actions */}
          <button
            onClick={handleUndo}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)]"
            title="Hoàn tác nét vẽ (Undo)"
          >
            <Undo2 size={17} />
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-lg hover:bg-[var(--color-destructive)] hover:text-white"
            title="Xoá toàn bộ ghi chú vẽ"
          >
            <Trash2 size={17} />
          </button>

          <div className="flex items-center gap-1 text-xs text-[var(--color-ink-tertiary)] pl-2 border-l border-[var(--color-border)]">
            <Move size={13} /> Giữ chuột phải để cuộn
          </div>

          {/* Close */}
          <button
            onClick={() => setDrawingMode(false)}
            className="p-2 ml-1 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-secondary)]"
            title="Tắt chế độ vẽ (hoặc nhấn MB4)"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className={`absolute top-0 left-0 transition-opacity duration-150 ${
          isDrawingMode
            ? 'pointer-events-auto cursor-crosshair z-30'
            : 'pointer-events-none z-10 opacity-90'
        }`}
        style={{ background: 'transparent' }}
      />
    </>
  );
};
