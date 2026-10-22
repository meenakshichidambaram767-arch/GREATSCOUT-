import React, { useRef, useEffect } from 'react';

interface CursorGridProps {
  cellSize?: number;
  radius?: number;
  color?: string;
  borderColor?: string;
  holdTime?: number;
  fadeDuration?: number;
  className?: string;
}

interface CellData {
  time: number;
  alpha: number;
}

export const CursorGrid: React.FC<CursorGridProps> = ({
  cellSize = 54,
  radius = 160,
  color = '#00A389',
  borderColor = 'rgba(22, 113, 125, 0.12)',
  holdTime = 300,
  fadeDuration = 800,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeCells = useRef<Map<string, CellData>>(new Map());
  const mousePos = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      const now = performance.now();

      // Light up cells within radius
      const r = radius;
      const startCol = Math.max(0, Math.floor((e.clientX - r) / cellSize));
      const endCol = Math.min(Math.ceil(canvas.width / cellSize), Math.ceil((e.clientX + r) / cellSize));
      const startRow = Math.max(0, Math.floor((e.clientY - r) / cellSize));
      const endRow = Math.min(Math.ceil(canvas.height / cellSize), Math.ceil((e.clientY + r) / cellSize));

      for (let c = startCol; c <= endCol; c++) {
        for (let row = startRow; row <= endRow; row++) {
          const cellCenterX = c * cellSize + cellSize / 2;
          const cellCenterY = row * cellSize + cellSize / 2;
          const dist = Math.hypot(e.clientX - cellCenterX, e.clientY - cellCenterY);

          if (dist < r) {
            const key = `${c},${row}`;
            const targetAlpha = Math.pow(1 - dist / r, 1.5) * 0.45;
            const existing = activeCells.current.get(key);
            if (!existing || existing.alpha < targetAlpha) {
              activeCells.current.set(key, { time: now, alpha: targetAlpha });
            }
          }
        }
      }
    };

    const handleMouseLeave = () => {
      mousePos.current = { x: -1000, y: -1000 };
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw baseline subtle grid
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Render illuminated cells
      activeCells.current.forEach((data, key) => {
        const elapsed = now - data.time;
        let currentAlpha = data.alpha;

        if (elapsed > holdTime) {
          const fadeProgress = (elapsed - holdTime) / fadeDuration;
          if (fadeProgress >= 1) {
            activeCells.current.delete(key);
            return;
          }
          currentAlpha = data.alpha * (1 - fadeProgress);
        }

        const [cStr, rowStr] = key.split(',');
        const col = parseInt(cStr, 10);
        const row = parseInt(rowStr, 10);
        const x = col * cellSize;
        const y = row * cellSize;

        // Fill cell with soft cyan/teal glow
        ctx.fillStyle = color;
        ctx.globalAlpha = currentAlpha * 0.35;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // Highlight cell border
        ctx.strokeStyle = color;
        ctx.globalAlpha = currentAlpha * 0.9;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, cellSize, cellSize);

        // Tiny crosshair at cell intersection
        ctx.fillStyle = color;
        ctx.globalAlpha = currentAlpha;
        ctx.fillRect(x - 2, y - 2, 4, 4);
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [cellSize, radius, color, borderColor, holdTime, fadeDuration]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

export default CursorGrid;
