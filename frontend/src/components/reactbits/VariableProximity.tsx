import React, { useRef, useEffect } from 'react';

interface VariableProximityProps {
  label: string;
  className?: string;
  fromFontVariationSettings?: string;
  toFontVariationSettings?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: 'linear' | 'exponential' | 'gaussian';
}

export const VariableProximity: React.FC<VariableProximityProps> = ({
  label,
  className = '',
  radius = 120,
}) => {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mousePos = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      letterRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        if (dist < radius) {
          const factor = 1 - dist / radius; // 0 to 1
          const weight = Math.round(400 + factor * 500); // 400 to 900
          const scale = 1 + factor * 0.15;
          const letterSpacing = factor * 2;
          el.style.fontWeight = `${weight}`;
          el.style.transform = `scale(${scale}) translateY(-${factor * 4}px)`;
          el.style.letterSpacing = `${letterSpacing}px`;
          el.style.color = factor > 0.4 ? '#00A389' : 'inherit';
        } else {
          el.style.fontWeight = '500';
          el.style.transform = 'scale(1) translateY(0px)';
          el.style.letterSpacing = 'normal';
          el.style.color = 'inherit';
        }
      });
    };

    const handleMouseLeave = () => {
      letterRefs.current.forEach((el) => {
        if (!el) return;
        el.style.fontWeight = '500';
        el.style.transform = 'scale(1) translateY(0px)';
        el.style.color = 'inherit';
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [radius]);

  const chars = label.split('');

  return (
    <span className={`inline-block select-none ${className}`}>
      {chars.map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            letterRefs.current[i] = el;
          }}
          className="inline-block transition-all duration-150 ease-out font-sans"
          style={{ willChange: 'transform, font-weight, color' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default VariableProximity;
