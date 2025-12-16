
import React, { memo } from 'react';

export const NoiseTexture: React.FC<{ className?: string, opacity?: number }> = memo(({ className = "", opacity = 0.05 }) => (
  <svg className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`} style={{ opacity }}>
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
));

export const GridPattern: React.FC<{ className?: string, opacity?: number }> = memo(({ className = "text-stone-500", opacity = 0.05 }) => (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`} style={{ opacity }}>
        <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
));

export const DiagonalPattern: React.FC<{ className?: string, opacity?: number }> = memo(({ className = "text-white", opacity = 0.03 }) => (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`} style={{ opacity }}>
        <defs>
            <pattern id="diagonal-pattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diagonal-pattern)" />
    </svg>
));

export const OrnamentalDivider: React.FC<{ className?: string }> = memo(({ className = "" }) => (
    <div className={`flex items-center justify-center gap-2 opacity-40 my-4 w-full ${className}`}>
        <div className="h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent flex-1"></div>
        <div className="w-1.5 h-1.5 rotate-45 bg-amber-800/80 border border-amber-600/50"></div>
        <div className="h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent flex-1"></div>
    </div>
));

export const CornerDecoration: React.FC<{ className?: string }> = memo(({ className = "" }) => (
    <svg width="40" height="40" viewBox="0 0 40 40" className={`absolute pointer-events-none text-amber-500/20 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1V15M1 1H15" stroke="currentColor" strokeWidth="2" />
    </svg>
));
