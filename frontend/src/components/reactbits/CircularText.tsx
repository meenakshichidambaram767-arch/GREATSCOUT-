import React from 'react';

interface CircularTextProps {
  text: string;
  radius?: number;
  fontSize?: number;
  letterSpacing?: number;
  speed?: number; // seconds per full rotation
  reverse?: boolean;
  color?: string;
  className?: string;
}

export const CircularText: React.FC<CircularTextProps> = ({
  text,
  radius = 180,
  fontSize = 10,
  letterSpacing = 3,
  speed = 24,
  reverse = false,
  color = '#00A389',
  className = '',
}) => {
  const characters = text.split('');
  const totalChars = characters.length;
  const anglePerChar = 360 / totalChars;

  return (
    <div
      className={`relative inline-flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
      }}
    >
      <div
        className="w-full h-full relative"
        style={{
          animation: `spin ${speed}s linear infinite ${reverse ? 'reverse' : 'normal'}`,
        }}
      >
        {characters.map((char, index) => {
          const rotation = index * anglePerChar;
          return (
            <span
              key={index}
              className="absolute font-mono uppercase font-bold tracking-widest text-center"
              style={{
                left: '50%',
                top: '50%',
                transform: `rotate(${rotation}deg) translate(0, -${radius}px) rotate(0deg)`,
                transformOrigin: '0 0',
                fontSize: `${fontSize}px`,
                letterSpacing: `${letterSpacing}px`,
                color: color,
                textShadow: '0 0 10px rgba(0, 163, 137, 0.4)',
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CircularText;
