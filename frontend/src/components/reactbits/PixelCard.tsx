import React, { useRef, useEffect, useState } from 'react';

interface PixelCardProps {
  children: React.ReactNode;
  pixelColor?: string;
  pixelSize?: number;
  gap?: number;
  speed?: number;
  className?: string;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  pixelColor = '#00A389',
  pixelSize = 8,
  gap = 2,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mousePos = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const pixelsRef = useRef<Map<string, { alpha: number; decay: number }>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = card.clientWidth;
      canvas.height = card.clientHeight;
    };
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isHovered) {
        // Activate pixels around mouse
        const step = pixelSize + gap;
        const radius = 60;
        const startX = Math.max(0, Math.floor((mousePos.current.x - radius) / step) * step);
        const endX = Math.min(canvas.width, Math.ceil((mousePos.current.x + radius) / step) * step);
        const startY = Math.max(0, Math.floor((mousePos.current.y - radius) / step) * step);
        const endY = Math.min(canvas.height, Math.ceil((mousePos.current.y + radius) / step) * step);

        for (let x = startX; x <= endX; x += step) {
          for (let y = startY; y <= endY; y += step) {
            const dist = Math.hypot(x - mousePos.current.x, y - mousePos.current.y);
            if (dist < radius && Math.random() > 0.45) {
              const key = `${x},${y}`;
              const alpha = Math.max(0.1, 1 - dist / radius);
              pixelsRef.current.set(key, { alpha, decay: 0.04 + Math.random() * 0.03 });
            }
          }
        }
      }

      // Draw active pixels and decay them
      pixelsRef.current.forEach((val, key) => {
        const [xStr, yStr] = key.split(',');
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);

        ctx.fillStyle = pixelColor;
        ctx.globalAlpha = val.alpha * 0.6;
        ctx.fillRect(x, y, pixelSize, pixelSize);

        val.alpha -= val.decay;
        if (val.alpha <= 0) {
          pixelsRef.current.delete(key);
        }
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      mousePos.current = { x: -100, y: -100 };
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, [isHovered, pixelColor, pixelSize, gap]);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden group transition-all duration-300 ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-20"
      />
      {children}
    </div>
  );
};

export default PixelCard;
