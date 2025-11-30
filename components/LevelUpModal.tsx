import React, { useState } from 'react';
import { BaseStats } from '../types';
import { Sword, Shield, Brain, Sparkles, Wind, Eye, Crown, ArrowUpCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const LevelUpModal: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const levelUp = useGameStore(state => state.levelUp);
  
  const currentStats = gameState.player.stats;
  const pointsToSpend = gameState.player.unspentStatPoints;

  const [stats, setStats] = useState<BaseStats>({ ...currentStats });
  
  const originalTotal = (Object.values(currentStats) as number[]).reduce((a, b) => a + b, 0);
  const currentTotal = (Object.values(stats) as number[]).reduce((a, b) => a + b, 0);
  const spentInSession = currentTotal - originalTotal;
  const remainingPoints = pointsToSpend - spentInSession;

  const increment = (stat: keyof BaseStats) => {
    if (remainingPoints > 0) {
      setStats({ ...stats, [stat]: stats[stat] + 1 });
    }
  };

  const decrement = (stat: keyof BaseStats) => {
    if (stats[stat] > currentStats[stat]) {
      setStats({ ...stats, [stat]: stats[stat] - 1 });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingPoints === 0) {
      levelUp(stats);
    }
  };

  const statConfig = [
    { key: 'str', label: 'Strength', icon: Sword, color: 'text-red-700', bg: 'bg-red-900/20', border: 'border-red-900/30' },
    { key: 'dex', label: 'Dexterity', icon: Wind, color: 'text-emerald-700', bg: 'bg-emerald-900/20', border: 'border-emerald-900/30' },
    { key: 'con', label: 'Constitution', icon: Shield, color: 'text-amber-700', bg: 'bg-amber-900/20', border: 'border-amber-900/30' },
    { key: 'int', label: 'Intelligence', icon: Brain, color: 'text-blue-700', bg: 'bg-blue-900/20', border: 'border-blue-900/30' },
    { key: 'wis', label: 'Wisdom', icon: Eye, color: 'text-violet-700', bg: 'bg-violet-900/20', border: 'border-violet-900/30' },
    { key: 'cha', label: 'Charisma', icon: Crown, color: 'text-rose-700', bg: 'bg-rose-900/20', border: 'border-rose-900/30' },
  ];

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#1c1917] border-2 border-amber-500/50 p-1 rounded-lg shadow-[0_0_100px_rgba(251,191,36,0.2)] max-w-md w-full relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

        <div className="p-8 border border-[#292524] rounded h-full relative z-10">
            <div className="text-center mb-6">
                <ArrowUpCircle className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce" />
                <h2 className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 border-b border-[#292524] pb-4">
                    Level Up!
                </h2>
                <p className="text-stone-400 mt-2 text-sm font-serif">
                    Your power grows. You have <span className="text-amber-400 font-bold">{remainingPoints}</span> points to allocate.
                </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="bg-[#0c0a09]/50 p-4 rounded border border-[#292524]">
                <div className="space-y-2">
                    {statConfig.map((stat) => {
                        const isIncreased = stats[stat.key as keyof BaseStats] > currentStats[stat.key as keyof BaseStats];
                        
                        return (
                        <div key={stat.key} className={`flex items-center justify-between p-2 rounded transition-colors ${isIncreased ? 'bg-amber-900/10' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className={`${stat.bg} p-1.5 rounded border ${stat.border}`}>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                                <span className="text-stone-300 font-serif">{stat.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => decrement(stat.key as keyof BaseStats)} className="w-8 h-8 rounded hover:bg-[#292524] text-stone-500 hover:text-stone-300 flex items-center justify-center border border-transparent hover:border-[#292524] transition-all disabled:opacity-20" disabled={stats[stat.key as keyof BaseStats] <= currentStats[stat.key as keyof BaseStats]}>-</button>
                                <span className={`w-6 text-center font-mono text-lg ${isIncreased ? 'text-amber-400 font-bold' : 'text-stone-100'}`}>{stats[stat.key as keyof BaseStats]}</span>
                                <button type="button" onClick={() => increment(stat.key as keyof BaseStats)} className="w-8 h-8 rounded hover:bg-[#292524] text-stone-500 hover:text-stone-300 flex items-center justify-center border border-transparent hover:border-[#292524] transition-all disabled:opacity-20" disabled={remainingPoints === 0}>+</button>
                            </div>
                        </div>
                    )})}
                </div>
            </div>

            <button
                type="submit"
                disabled={remainingPoints !== 0}
                className="w-full bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-stone-100 font-display font-bold py-3 rounded border border-amber-600/50 shadow-lg mt-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale"
            >
                <Sparkles className="w-5 h-5" />
                Confirm Destiny
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;