import React, { useState, useEffect, useRef } from 'react';

interface TrueFocusProps {
  sentence?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
}

export const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'Real-time Signal Intelligence For Global Innovators',
  manualMode = false,
  blurAmount = 4,
  borderColor = '#00A389',
  glowColor = 'rgba(0, 163, 137, 0.45)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 2.2,
  className = '',
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (manualMode) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => clearInterval(interval);
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return;
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const activeWordRect = wordRefs.current[currentIndex]!.getBoundingClientRect();

    setFocusRect({
      x: activeWordRect.left - parentRect.left,
      y: activeWordRect.top - parentRect.top,
      width: activeWordRect.width,
      height: activeWordRect.height,
    });
  }, [currentIndex, words.length]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-wrap items-center gap-x-2.5 gap-y-1.5 select-none ${className}`}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={(el) => {
              wordRefs.current[index] = el;
            }}
            className="relative cursor-pointer transition-all duration-300 font-extrabold"
            style={{
              filter: isActive ? 'none' : `blur(${blurAmount}px)`,
              opacity: isActive ? 1 : 0.45,
              transform: isActive ? 'scale(1.02)' : 'scale(0.98)',
              color: isActive ? '#00A389' : 'inherit',
            }}
            onMouseEnter={() => {
              setLastActiveIndex(currentIndex);
              setCurrentIndex(index);
            }}
            onMouseLeave={() => {
              if (lastActiveIndex !== null) {
                setCurrentIndex(lastActiveIndex);
              }
            }}
          >
            {word}
          </span>
        );
      })}

      {/* Floating Animated Focus Box */}
      <div
        className="pointer-events-none absolute transition-all ease-out"
        style={{
          transform: `translate(${focusRect.x - 6}px, ${focusRect.y - 4}px)`,
          width: `${focusRect.width + 12}px`,
          height: `${focusRect.height + 8}px`,
          transitionDuration: `${animationDuration}s`,
        }}
      >
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 rounded-md"
          style={{
            boxShadow: `0 0 16px ${glowColor}`,
            border: `1.5px solid ${borderColor}`,
            backgroundColor: 'rgba(0, 163, 137, 0.05)',
          }}
        />

        {/* Optical Target Corner Reticles */}
        <span
          className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2"
          style={{ borderColor }}
        />
        <span
          className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2"
          style={{ borderColor }}
        />
        <span
          className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2"
          style={{ borderColor }}
        />
        <span
          className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2"
          style={{ borderColor }}
        />
      </div>
    </div>
  );
};

export default TrueFocus;
