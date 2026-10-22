import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollExpandProps {
  startWidth?: number; // percentage (e.g. 75)
  startRadius?: number; // px
  endRadius?: number; // px
  children: React.ReactNode;
  className?: string;
  triggerId?: string;
}

export const ScrollExpand: React.FC<ScrollExpandProps> = ({
  startWidth = 75,
  startRadius = 32,
  endRadius = 20,
  children,
  className = '',
  triggerId = 'metrics',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const el = containerRef.current;
    if (!el) return;

    const trigger = document.getElementById(triggerId) || el;

    const st = ScrollTrigger.create({
      trigger,
      start: 'top 80%',
      end: 'center 45%',
      scrub: 0.8,
      onUpdate: (self) => {
        const w = startWidth + (100 - startWidth) * self.progress;
        const r = startRadius - (startRadius - endRadius) * self.progress;
        const scale = 0.94 + 0.06 * self.progress;
        const shadowIntensity = 0.15 + 0.25 * self.progress;

        el.style.width = `${w}%`;
        el.style.borderRadius = `${r}px`;
        el.style.transform = `scale(${scale})`;
        el.style.boxShadow = `0 ${20 + 20 * self.progress}px ${40 + 30 * self.progress}px rgba(6, 86, 96, ${shadowIntensity})`;
      },
    });

    return () => {
      st.kill();
    };
  }, [startWidth, startRadius, endRadius, triggerId]);

  return (
    <div className="w-full flex justify-center items-center py-4">
      <div
        ref={containerRef}
        className={`transition-all duration-150 ease-out will-change-[width,transform,border-radius] ${className}`}
        style={{
          width: `${startWidth}%`,
          borderRadius: `${startRadius}px`,
          transform: 'scale(0.94)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollExpand;
