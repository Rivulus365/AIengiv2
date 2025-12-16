import React, { useEffect, useState } from 'react';
import { audioService } from '../services/audio';

interface DiceAnimationProps {
  target: number;
  type: 'player' | 'enemy';
  isCrit: boolean;
  isFail: boolean;
  onComplete?: () => void;
  soundEnabled: boolean;
}

const DiceAnimation: React.FC<DiceAnimationProps> = ({ target, type, isCrit, isFail, onComplete, soundEnabled }) => {
  const [currentValue, setCurrentValue] = useState(1);
  const [isRolling, setIsRolling] = useState(true);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Random number shuffle
    const duration = 1000; // 1 second roll
    const intervalTime = 60;
    const steps = duration / intervalTime;
    let step = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      step++;
      // Random number between 1 and 20
      setCurrentValue(Math.floor(Math.random() * 20) + 1);
      
      // Play sound via service
      if (soundEnabled) {
          audioService.playOneShot('dice_roll');
      }

      if (step >= steps) {
        clearInterval(interval);
        setCurrentValue(target);
        setIsRolling(false);
        setShowResult(true);
        if (onComplete) {
            timeoutId = setTimeout(onComplete, 2000); // Wait 2 seconds before calling complete
        }
      }
    }, intervalTime);

    return () => {
        clearInterval(interval);
        clearTimeout(timeoutId);
    };
  }, [target, onComplete, soundEnabled]);

  // Color config
  const getColors = () => {
    if (isCrit) return { fill: '#fbbf24', stroke: '#fffbeb', text: '#78350f', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]' }; // Gold
    if (isFail) return { fill: '#1c1917', stroke: '#7f1d1d', text: '#ef4444', glow: 'shadow-[0_0_30px_rgba(127,29,29,0.6)]' }; // Dark Red
    
    if (type === 'player') return { fill: '#064e3b', stroke: '#34d399', text: '#d1fae5', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' }; // Emerald
    return { fill: '#7f1d1d', stroke: '#f87171', text: '#fecaca', glow: 'shadow-[0_0_20px_rgba(220,38,38,0.4)]' }; // Red
  };

  const colors = getColors();

  return (
    <div className={`relative flex flex-col items-center justify-center animate-dice-pop ${showResult ? colors.glow : ''} rounded-full transition-all duration-300`}>
      <div className={`${isRolling ? 'animate-dice-tumble' : ''} relative transform-gpu`}>
        {/* D20 SVG */}
        <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-lg">
          <defs>
            <linearGradient id="diceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.fill} stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Hexagon Base - The outline of a D20 from the front */}
          <path 
            d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" 
            fill={colors.fill} 
            stroke={colors.stroke} 
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* Internal Lines to form triangles */}
          {/* Center Triangle (Top) */}
          <path d="M10 25 L50 50 L90 25" fill="none" stroke={colors.stroke} strokeWidth="1" opacity="0.6" />
          
          {/* Center Triangle (Bottom) */}
          <path d="M10 75 L50 50 L90 75" fill="none" stroke={colors.stroke} strokeWidth="1" opacity="0.6" />
          
          {/* Vertical Center */}
          <path d="M50 5 L50 50 L50 95" fill="none" stroke={colors.stroke} strokeWidth="1" opacity="0.6" />
          
          {/* Text Number - Hidden while tumbling for better effect, or show it flashing */}
          {!isRolling && (
            <text 
                x="50" 
                y="56" 
                fontFamily="Cinzel, serif" 
                fontSize="32" 
                fontWeight="bold" 
                fill={colors.text} 
                textAnchor="middle" 
                dominantBaseline="middle"
                className="animate-in zoom-in duration-300"
            >
                {currentValue}
            </text>
          )}
        </svg>
      </div>
      
      {/* Result Label */}
      {showResult && (
        <div className={`mt-4 px-3 py-1 rounded border backdrop-blur-md animate-in slide-in-from-top-2 fade-in duration-500 font-display font-bold uppercase tracking-widest text-sm
            ${isCrit ? 'bg-amber-500/20 border-amber-400 text-amber-300' : ''}
            ${isFail ? 'bg-red-950/40 border-red-800 text-red-500' : ''}
            ${!isCrit && !isFail && type === 'player' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : ''}
            ${!isCrit && !isFail && type === 'enemy' ? 'bg-red-950/40 border-red-800 text-red-300' : ''}
        `}>
          {isCrit ? 'Critical Hit!' : isFail ? 'Critical Miss!' : type === 'player' ? 'Player Roll' : 'Enemy Roll'}
        </div>
      )}
    </div>
  );
};

export default DiceAnimation;