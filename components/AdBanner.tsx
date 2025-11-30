
import React, { useState, useEffect } from 'react';

const ADS = [
  {
    company: "The Gilded Tankard",
    tagline: "Warm beds. Cold ale. No questions.",
    color: "text-amber-500",
    bgHover: "group-hover:border-amber-700/50"
  },
  {
    company: "Grimtooth's Traps",
    tagline: "Security solutions for the discerning dungeon lord.",
    color: "text-red-500",
    bgHover: "group-hover:border-red-700/50"
  },
  {
    company: "Mystic Pizza",
    tagline: "Delivered to any plane in 30 minutes or it's free.",
    color: "text-violet-500",
    bgHover: "group-hover:border-violet-700/50"
  },
  {
    company: "Eldritch Insurance",
    tagline: "Coverage for acts of god, demon, and murderhobo.",
    color: "text-blue-500",
    bgHover: "group-hover:border-blue-700/50"
  },
  {
    company: "Bloodbath & Beyond",
    tagline: "Weaponry for every occasion.",
    color: "text-stone-300",
    bgHover: "group-hover:border-stone-500/50"
  }
];

const AdBanner: React.FC = () => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ADS.length);
        setIsVisible(true);
      }, 500); // Wait for fade out
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const ad = ADS[currentAdIndex];

  return (
    <div className="w-full py-3 px-6 border-t border-[#292524] bg-[#0c0a09]/30 shrink-0">
      <div className={`w-full h-20 bg-[#050404] border border-[#292524] rounded-sm flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer shadow-inner transition-colors duration-500 ${ad.bgHover}`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-[0.03]"></div>
          
          {/* Ad Indicator */}
          <span className="text-[7px] uppercase tracking-widest text-stone-800 absolute top-1 right-2 border border-stone-900 px-1 rounded">Sponsored</span>
          
          {/* Ad Content */}
          <div className={`text-center z-10 transition-opacity duration-500 ${isVisible ? 'opacity-80' : 'opacity-0'} group-hover:opacity-100`}>
             <p className={`font-display text-xs tracking-widest uppercase transition-colors duration-300 ${ad.color} drop-shadow-md`}>{ad.company}</p>
             <p className="text-stone-600 text-[9px] italic mt-1 font-serif tracking-wide">{ad.tagline}</p>
          </div>
          
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-scanline pointer-events-none opacity-20"></div>
      </div>
    </div>
  );
};

export default AdBanner;
    