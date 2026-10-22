import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CircularCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  cardWidth?: number;
  cardHeight?: number;
  radiusOffset?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number; // seconds per full rotation
  className?: string;
}

export function CircularCarousel<T>({
  items,
  renderItem,
  cardWidth = 380,
  cardHeight = 440,
  radiusOffset = 40,
  autoRotate = false,
  autoRotateSpeed = 24,
  className = '',
}: CircularCarouselProps<T>) {
  const [rotation, setRotation] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const startRotation = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const count = items.length;
  const angleStep = 360 / count;
  // Calculate cylinder radius based on card width
  const radius = Math.round((cardWidth / 2) / Math.tan(Math.PI / count)) + radiusOffset;

  const handlePrev = useCallback(() => {
    setRotation((prev) => {
      const next = prev + angleStep;
      const normalizedIndex = Math.round(-next / angleStep) % count;
      setActiveIndex((normalizedIndex + count) % count);
      return next;
    });
  }, [angleStep, count]);

  const handleNext = useCallback(() => {
    setRotation((prev) => {
      const next = prev - angleStep;
      const normalizedIndex = Math.round(-next / angleStep) % count;
      setActiveIndex((normalizedIndex + count) % count);
      return next;
    });
  }, [angleStep, count]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startRotation.current = rotation;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startX.current;
    const newRot = startRotation.current + (deltaX / cardWidth) * angleStep * 1.2;
    setRotation(newRot);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
    // Snap to closest card
    const targetIdx = Math.round(-rotation / angleStep);
    const snappedRot = -targetIdx * angleStep;
    setRotation(snappedRot);
    const normalizedIndex = ((targetIdx % count) + count) % count;
    setActiveIndex(normalizedIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Optional auto-rotation
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      if (!isDragging.current) {
        handleNext();
      }
    }, (autoRotateSpeed / count) * 1000);
    return () => clearInterval(interval);
  }, [autoRotate, autoRotateSpeed, count, handleNext]);

  return (
    <div className={`relative w-full overflow-hidden py-12 select-none ${className}`}>
      {/* 3D Viewport Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative mx-auto flex items-center justify-center cursor-grab touch-none"
        style={{
          height: `${cardHeight + 80}px`,
          perspective: '1300px',
        }}
      >
        {/* 3D Ring Container */}
        <div
          className="relative w-full h-full transition-transform duration-500 ease-out flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${radius}px) rotateY(${rotation}deg)`,
          }}
        >
          {items.map((item, index) => {
            const itemAngle = index * angleStep;
            const isActive = index === activeIndex;

            return (
              <div
                key={index}
                className="absolute will-change-transform transition-opacity duration-300"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  opacity: isActive ? 1 : 0.65,
                  filter: isActive ? 'none' : 'blur(0.5px)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const targetRot = -itemAngle;
                  setRotation(targetRot);
                  setActiveIndex(index);
                }}
              >
                {renderItem(item, index, isActive)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={handlePrev}
          aria-label="Previous case study"
          className="w-12 h-12 rounded-full bg-white border border-[#DDDDDD] hover:border-[#16717d] shadow-sm hover:shadow-md flex items-center justify-center text-[#333333] hover:text-[#16717d] transition-all hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setRotation(-i * angleStep);
                setActiveIndex(i);
              }}
              aria-label={`Jump to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-8 bg-[#16717d]'
                  : 'w-2 bg-[#CCCCCC] hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next case study"
          className="w-12 h-12 rounded-full bg-white border border-[#DDDDDD] hover:border-[#16717d] shadow-sm hover:shadow-md flex items-center justify-center text-[#333333] hover:text-[#16717d] transition-all hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default CircularCarousel;
