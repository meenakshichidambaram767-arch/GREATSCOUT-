import React, { useState, useEffect } from 'react';

interface TacticalCrosshairProps {
  color?: string;
  size?: number;
  showCoordinates?: boolean;
  className?: string;
}

export const TacticalCrosshair: React.FC<TacticalCrosshairProps> = ({
  color = '#00A389',
  size = 40,
  showCoordinates = true,
  className = '',
}) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [telemetry, setTelemetry] = useState({
    lat: '37°31\'14"N',
    lng: '127°02\'48"E',
    azimuth: '284°',
    signal: '98.6%',
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const x = e.clientX;
      const y = e.clientY;
      setPos({ x, y });

      // Calculate dynamic pseudo-telemetry based on screen coordinates
      const normX = x / window.innerWidth;
      const normY = y / window.innerHeight;
      const degLat = 37 + Math.floor(normY * 10);
      const minLat = Math.floor(normY * 60);
      const degLng = 126 + Math.floor(normX * 10);
      const minLng = Math.floor(normX * 60);
      const az = Math.floor((normX + normY) * 180);
      const sig = (94 + (normX * 5.8)).toFixed(1);

      setTelemetry({
        lat: `${degLat}°${minLat < 10 ? '0' : ''}${minLat}'N`,
        lng: `${degLng}°${minLng < 10 ? '0' : ''}${minLng}'E`,
        azimuth: `${az}°`,
        signal: `${sig}%`,
      });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed pointer-events-none z-[99990] transition-opacity duration-200 select-none ${className}`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outer Tactical Reticle Frame */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: `${size * 2}px`, height: `${size * 2}px` }}
      >
        {/* Reticle Circle */}
        <div
          className="absolute inset-0 rounded-full border border-dashed opacity-40 animate-[spin_12s_linear_infinite]"
          style={{ borderColor: color }}
        />

        {/* Center Target Dot */}
        <div
          className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#00A389]"
          style={{ backgroundColor: color }}
        />

        {/* Reticle Corner Brackets */}
        <div
          className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2"
          style={{ borderColor: color }}
        />
        <div
          className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2"
          style={{ borderColor: color }}
        />
        <div
          className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2"
          style={{ borderColor: color }}
        />
        <div
          className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2"
          style={{ borderColor: color }}
        />

        {/* Cardinal Tick Lines */}
        <div className="absolute -top-3 w-[1px] h-2 opacity-70" style={{ backgroundColor: color }} />
        <div className="absolute -bottom-3 w-[1px] h-2 opacity-70" style={{ backgroundColor: color }} />
        <div className="absolute -left-3 h-[1px] w-2 opacity-70" style={{ backgroundColor: color }} />
        <div className="absolute -right-3 h-[1px] w-2 opacity-70" style={{ backgroundColor: color }} />

        {/* Live Coordinate Tag */}
        {showCoordinates && (
          <div
            className="absolute left-full top-0 ml-3.5 pl-2.5 border-l-2 border-[#00A389]/60 font-mono text-[9px] leading-tight tracking-wider uppercase text-slate-800 dark:text-teal-300 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none"
          >
            <div className="flex items-center gap-1.5 text-[8px] text-[#00A389] font-bold">
              <span className="inline-block w-1 h-1 rounded-full bg-[#00A389] animate-ping" />
              RADAR LOCK • {telemetry.signal}
            </div>
            <div className="text-slate-600 dark:text-slate-300">COORD: {telemetry.lat} {telemetry.lng}</div>
            <div className="text-slate-400 text-[8px]">BEARING: {telemetry.azimuth} REL</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalCrosshair;
