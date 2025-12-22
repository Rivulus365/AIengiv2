
import React, { useState, useMemo } from 'react';
import { BaseStats } from '../types';
import { Sword, Shield, Brain, Sparkles, Wind, Eye, Crown, ArrowUpCircle, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { SKILL_LIST, SKILL_DEFINITIONS } from '../constants';
import { getModifier } from '../utils/engine';
import Button from './design-system/Button';

const LevelUpModal: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const levelUp = useGameStore(state => state.levelUp);
  
  const [step, setStep] = useState<1 | 2>(1);
  const currentStats = gameState.player.stats;
  const pointsToSpend = gameState.player.unspentStatPoints;
  const currentProficiencies = gameState.player.proficiencies;

  const [stats, setStats] = useState<BaseStats>({ ...currentStats });
  const [selectedProficiency, setSelectedProficiency] = useState<string | undefined>(undefined);
  
  const originalTotal = (Object.values(currentStats) as number[]).reduce((a, b) => a + b, 0);
  const currentTotal = (Object.values(stats) as number[]).reduce((a, b) => a + b, 0);
  const spentInSession = currentTotal - originalTotal;
  const remainingPoints = pointsToSpend - spentInSession;

  const availableProficiencies = useMemo(() => {
    return SKILL_LIST.filter(skill => !currentProficiencies.includes(skill));
  }, [currentProficiencies]);

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

  const handleSubmit = () => {
    levelUp(stats, selectedProficiency);
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

        <div className="p-6 md:p-8 border border-[#292524] rounded h-full relative z-10">
            <div className="text-center mb-6">
                <ArrowUpCircle className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce" />
                <h2 className="text-2xl md:text-3xl font-display text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 border-b border-[#292524] pb-4">
                    {step === 1 ? "Empower Soul" : "Sharpen Skills"}
                </h2>
                <div className="flex justify-center gap-2 mt-4">
                    <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-amber-500 w-6' : 'bg-emerald-500'} transition-all`}></div>
                    <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-amber-500 w-6' : 'bg-stone-800'} transition-all`}></div>
                </div>
            </div>
            
            {step === 1 ? (
                <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                    <p className="text-stone-400 text-center text-sm font-serif mb-4">
                        Distribute <span className="text-amber-400 font-bold">{remainingPoints}</span> points to your attributes.
                    </p>
                    <div className="bg-[#0c0a09]/50 p-4 rounded border border-[#292524] space-y-2">
                        {statConfig.map((stat) => {
                            const isIncreased = stats[stat.key as keyof BaseStats] > currentStats[stat.key as keyof BaseStats];
                            return (
                                <div key={stat.key} className={`flex items-center justify-between p-2 rounded transition-colors ${isIncreased ? 'bg-amber-900/10' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`${stat.bg} p-1.5 rounded border ${stat.border}`}>
                                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                        </div>
                                        <span className="text-stone-300 font-serif text-sm">{stat.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => decrement(stat.key as keyof BaseStats)} className="w-8 h-8 rounded hover:bg-[#292524] text-stone-500 hover:text-stone-300 flex items-center justify-center border border-transparent hover:border-[#292524] transition-all disabled:opacity-20" disabled={stats[stat.key as keyof BaseStats] <= currentStats[stat.key as keyof BaseStats]}>-</button>
                                        <span className={`w-6 text-center font-mono text-lg ${isIncreased ? 'text-amber-400 font-bold' : 'text-stone-100'}`}>{stats[stat.key as keyof BaseStats]}</span>
                                        <button type="button" onClick={() => increment(stat.key as keyof BaseStats)} className="w-8 h-8 rounded hover:bg-[#292524] text-stone-500 hover:text-stone-300 flex items-center justify-center border border-transparent hover:border-[#292524] transition-all disabled:opacity-20" disabled={remainingPoints === 0}>+</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <Button 
                        disabled={remainingPoints !== 0}
                        onClick={() => setStep(2)}
                        className="w-full mt-4"
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                        Continue
                    </Button>
                </div>
            ) : (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <p className="text-stone-400 text-center text-sm font-serif mb-4">
                        Choose a new <span className="text-amber-400 font-bold">Skill Proficiency</span>.
                    </p>
                    <div className="bg-[#0c0a09]/50 p-2 rounded border border-[#292524] max-h-[300px] overflow-y-auto custom-scrollbar">
                        {availableProficiencies.map(skillName => {
                            const def = SKILL_DEFINITIONS[skillName];
                            const mod = getModifier(stats[def.ability as keyof BaseStats]);
                            const isSelected = selectedProficiency === skillName;
                            return (
                                <button
                                    key={skillName}
                                    onClick={() => setSelectedProficiency(skillName)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all mb-1 text-left border ${isSelected ? 'bg-amber-900/20 border-amber-500/50' : 'border-transparent hover:bg-white/5'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${isSelected ? 'text-amber-400' : 'text-stone-200'}`}>{skillName}</span>
                                        <span className="text-[10px] text-stone-500 uppercase tracking-tighter">{def.ability}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-xs font-mono font-bold text-stone-400">Total: {mod >= 0 ? '+' : ''}{mod + (gameState.player.derivedStats.proficiencyBonus)}</div>
                                            <div className="text-[9px] text-stone-600">({mod} + {gameState.player.derivedStats.proficiencyBonus} prof)</div>
                                        </div>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                        <Button 
                            className="flex-1" 
                            disabled={!selectedProficiency} 
                            onClick={handleSubmit}
                            leftIcon={<Sparkles className="w-4 h-4" />}
                        >
                            Finalize
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
