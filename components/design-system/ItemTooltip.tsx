
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Item } from '../../types';

interface ItemTooltipProps {
    item?: Item | null;
    children: React.ReactNode;
    className?: string;
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, children, className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const timeoutRef = useRef<any>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (!item) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({ x: e.clientX + 15, y: e.clientY + 15 });
        timeoutRef.current = setTimeout(() => setIsVisible(true), 400); // Slight delay for intent
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!item) return;
        // Update coordinates to follow mouse if not visible yet, or even if visible
        setCoords({ x: e.clientX + 15, y: e.clientY + 15 });
    };

    return (
        <>
            <div 
                className={className} 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
            >
                {children}
            </div>
            {isVisible && item && createPortal(
                <div 
                    className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                    style={{ 
                        left: Math.min(coords.x, window.innerWidth - 300), 
                        top: Math.min(coords.y, window.innerHeight - 200) 
                    }}
                >
                    <div className="bg-[#0c0a09]/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-4 w-72 shadow-[0_0_30px_rgba(0,0,0,0.8)] text-stone-300">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-2">
                            <div>
                                <h4 className={`font-display font-bold text-base ${
                                    item.rarity === 'legendary' ? 'text-amber-400' : 
                                    item.rarity === 'epic' ? 'text-purple-400' : 
                                    item.rarity === 'rare' ? 'text-blue-400' : 
                                    item.rarity === 'uncommon' ? 'text-emerald-400' : 'text-stone-200'
                                }`}>{item.name}</h4>
                                <div className="text-[10px] uppercase tracking-widest text-stone-500">{item.rarity} {item.type}</div>
                            </div>
                            {item.value && <div className="text-amber-500 font-mono text-xs">{item.value} gp</div>}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            {item.dmg && (
                                <div className="bg-white/5 rounded px-2 py-1 flex justify-between items-center">
                                    <span className="text-stone-500">Damage</span>
                                    <span className="text-stone-200 font-bold">{item.dmg}</span>
                                </div>
                            )}
                            {item.ac && (
                                <div className="bg-white/5 rounded px-2 py-1 flex justify-between items-center">
                                    <span className="text-stone-500">Armor</span>
                                    <span className="text-stone-200 font-bold">{item.ac}</span>
                                </div>
                            )}
                            {item.weight && (
                                <div className="bg-white/5 rounded px-2 py-1 flex justify-between items-center">
                                    <span className="text-stone-500">Weight</span>
                                    <span className="text-stone-200">{item.weight} lb</span>
                                </div>
                            )}
                            {item.prop && (
                                <div className="bg-white/5 rounded px-2 py-1 flex flex-col col-span-2">
                                    <span className="text-[9px] text-stone-500 uppercase">Properties</span>
                                    <span className="text-stone-200">{item.prop}</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {item.description && (
                            <div className="text-xs italic text-stone-400 font-serif leading-relaxed mb-2">
                                "{item.description}"
                            </div>
                        )}

                        {/* Effect */}
                        {item.effect && (
                            <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 rounded px-2 py-1 mt-2">
                                <span className="font-bold uppercase text-[9px] block text-emerald-600 mb-0.5">Effect</span>
                                {item.effect}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
