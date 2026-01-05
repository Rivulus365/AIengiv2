
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, User, Sword, Shield, BookOpen, Backpack, ScrollText, Zap, Brain, Wind, Eye, Crown, Activity } from 'lucide-react';
import { getModifier } from '../utils/engine';
import { BaseStats, PlayerState } from '../types';
import { ItemTooltip } from './design-system/ItemTooltip';

interface CharacterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({ isOpen, onClose }) => {
  const gameState = useGameStore(state => state.gameState);
  const { player, inventory, equipment } = gameState;
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'magic' | 'inventory'>('overview');

  if (!isOpen) return null;

  const renderStatBlock = (stat: keyof BaseStats, label: string, icon: React.ElementType, color: string) => {
    const val = player.stats[stat];
    const mod = getModifier(val);
    return (
      <div className="flex flex-col items-center p-3 bg-black/30 border border-white/5 rounded-lg w-full">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${color} mb-1 flex items-center gap-1`}>
            <icon className="w-3 h-3" /> {label}
        </span>
        <span className="text-2xl font-display font-bold text-stone-200">{val}</span>
        <span className={`text-sm font-mono font-bold ${mod >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {mod >= 0 ? '+' : ''}{mod}
        </span>
      </div>
    );
  };

  const tabs = [
      { id: 'overview', label: 'Overview', icon: User },
      { id: 'skills', label: 'Skills & Traits', icon: BookOpen },
      { id: 'magic', label: 'Combat & Magic', icon: Sword },
      { id: 'inventory', label: 'Inventory', icon: Backpack },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#1c1917] border border-[#44403c] rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b border-[#292524] bg-[#0c0a09] flex justify-between items-start shrink-0">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-700 to-stone-900 border-2 border-amber-500/30 flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-amber-200" />
                </div>
                <div>
                    <h2 className="text-3xl font-display font-bold text-stone-100 tracking-wide">{player.name || "Unknown Hero"}</h2>
                    <div className="flex items-center gap-3 text-stone-400 text-sm font-serif italic mt-1">
                        <span>Level {player.level} {player.race} {player.class}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-600"></span>
                        <span>{player.subclass || "No Subclass"}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-600"></span>
                        <span>{player.background || "Unknown Origin"}</span>
                    </div>
                    {/* XP Bar */}
                    <div className="w-64 h-1.5 bg-stone-800 rounded-full mt-3 overflow-hidden relative">
                        <div 
                            className="absolute top-0 left-0 h-full bg-amber-600" 
                            style={{ width: `${Math.min(100, (player.xp / player.nextLevelXp) * 100)}%` }}
                        ></div>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1 uppercase tracking-widest">
                        {player.xp} / {player.nextLevelXp} XP
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 text-stone-500 hover:text-stone-200 transition-colors bg-stone-900/50 rounded-full border border-stone-800 hover:border-stone-600">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-16 md:w-64 bg-[#0c0a09]/50 border-r border-[#292524] flex flex-col py-4 shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-4 text-left transition-all ${activeTab === tab.id ? 'bg-amber-900/10 text-amber-500 border-r-2 border-amber-500' : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'}`}
                    >
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-amber-500' : 'text-stone-600'}`} />
                        <span className="hidden md:block font-display font-bold tracking-wide uppercase text-xs">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-[#151413]">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {renderStatBlock('str', 'Strength', Sword, 'text-red-500')}
                            {renderStatBlock('dex', 'Dexterity', Wind, 'text-emerald-500')}
                            {renderStatBlock('con', 'Constitution', Shield, 'text-amber-500')}
                            {renderStatBlock('int', 'Intelligence', Brain, 'text-blue-500')}
                            {renderStatBlock('wis', 'Wisdom', Eye, 'text-violet-500')}
                            {renderStatBlock('cha', 'Charisma', Crown, 'text-rose-500')}
                        </div>

                        {/* Vitals */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-5 rounded-xl bg-black/20 border border-white/5 space-y-4">
                                <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest border-b border-white/5 pb-2">Combat Vitals</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-300 text-sm">Armor Class</span>
                                        <span className="text-xl font-mono font-bold text-emerald-400">{player.derivedStats.ac}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-300 text-sm">Initiative</span>
                                        <span className="text-xl font-mono font-bold text-amber-400">{player.derivedStats.initiative >= 0 ? '+' : ''}{player.derivedStats.initiative}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-300 text-sm">Speed</span>
                                        <span className="text-xl font-mono font-bold text-stone-200">30 ft</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-300 text-sm">Proficiency</span>
                                        <span className="text-xl font-mono font-bold text-blue-400">+{player.derivedStats.proficiencyBonus}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-black/20 border border-white/5 space-y-4">
                                <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest border-b border-white/5 pb-2">Hit Points</h3>
                                <div className="text-center py-4">
                                    <div className="text-4xl font-display font-bold text-red-500">{player.hp.current} <span className="text-stone-600 text-2xl">/</span> {player.hp.max}</div>
                                    <div className="text-xs text-stone-500 uppercase mt-2">Current HP</div>
                                </div>
                                <div className="bg-stone-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${(player.hp.current / player.hp.max) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-black/20 border border-white/5 space-y-4">
                                <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest border-b border-white/5 pb-2">Biography</h3>
                                <div className="space-y-2 text-sm text-stone-400">
                                    <div className="flex justify-between"><span className="text-stone-500">Gender</span> <span>{player.gender}</span></div>
                                    <div className="flex justify-between"><span className="text-stone-500">Age</span> <span>{player.age} Years</span></div>
                                    <div className="flex justify-between"><span className="text-stone-500">Gold</span> <span className="text-amber-400">{player.gold} gp</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SKILLS TAB */}
                {activeTab === 'skills' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                            <h3 className="text-lg font-display font-bold text-stone-200 border-b border-stone-800 pb-2">Skills</h3>
                            <div className="grid grid-cols-1 gap-1">
                                {player.skills.map(s => (
                                    <div key={s.name} className={`flex items-center justify-between p-2 rounded hover:bg-white/5 ${s.isProficient ? 'bg-amber-900/10' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${s.isProficient ? 'bg-amber-500' : 'bg-stone-800'}`}></div>
                                            <span className={`text-sm ${s.isProficient ? 'text-stone-100 font-bold' : 'text-stone-400'}`}>{s.name}</span>
                                        </div>
                                        <span className={`font-mono font-bold ${s.modifier >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {s.modifier >= 0 ? '+' : ''}{s.modifier}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-display font-bold text-stone-200 border-b border-stone-800 pb-2">Feats & Traits</h3>
                                <div className="space-y-2">
                                    {player.activeFeats.map((f, i) => (
                                        <div key={i} className="p-3 bg-black/30 border border-white/10 rounded-lg">
                                            <div className="text-sm font-bold text-amber-100">{f}</div>
                                        </div>
                                    ))}
                                    {player.features.map((f, i) => (
                                        <div key={`feature-${i}`} className="p-3 bg-black/30 border border-white/10 rounded-lg">
                                            <div className="text-sm font-bold text-stone-300">{f}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-lg font-display font-bold text-stone-200 border-b border-stone-800 pb-2">Proficiencies</h3>
                                <div className="flex flex-wrap gap-2">
                                    {player.proficiencies.map((p, i) => (
                                        <span key={i} className="px-3 py-1 bg-stone-800 rounded-full text-xs text-stone-300 border border-stone-700">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAGIC & COMBAT TAB */}
                {activeTab === 'magic' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        
                        {/* Equipment Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 rounded-xl bg-black/20 border border-white/5">
                                <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-4 flex items-center gap-2"><Sword className="w-4 h-4"/> Equipped Weapons</h3>
                                <div className="space-y-3">
                                    <ItemTooltip item={equipment.mainHand} className="block">
                                        <div className="flex justify-between items-center p-3 bg-stone-900/50 rounded-lg border border-stone-800 hover:border-stone-600 transition-colors">
                                            <span className="text-stone-200 font-bold">{equipment.mainHand?.name || "Unarmed"}</span>
                                            <span className="text-xs text-stone-500 uppercase">{equipment.mainHand?.dmg || "1d4"} Dmg</span>
                                        </div>
                                    </ItemTooltip>
                                    {equipment.offHand && (
                                        <ItemTooltip item={equipment.offHand} className="block">
                                            <div className="flex justify-between items-center p-3 bg-stone-900/50 rounded-lg border border-stone-800 hover:border-stone-600 transition-colors">
                                                <span className="text-stone-200 font-bold">{equipment.offHand.name}</span>
                                                <span className="text-xs text-stone-500 uppercase">{equipment.offHand.type === 'shield' ? `+${equipment.offHand.ac} AC` : `${equipment.offHand.dmg} Dmg`}</span>
                                            </div>
                                        </ItemTooltip>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-black/20 border border-white/5">
                                <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-4 flex items-center gap-2"><Shield className="w-4 h-4"/> Defenses</h3>
                                <div className="space-y-3">
                                    <ItemTooltip item={equipment.body} className="block">
                                        <div className="flex justify-between items-center p-3 bg-stone-900/50 rounded-lg border border-stone-800 hover:border-stone-600 transition-colors">
                                            <span className="text-stone-200 font-bold">{equipment.body?.name || "Unarmored"}</span>
                                            <span className="text-xs text-stone-500 uppercase">{player.derivedStats.ac} AC</span>
                                        </div>
                                    </ItemTooltip>
                                </div>
                            </div>
                        </div>

                        {/* Spellcasting */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-stone-800 pb-2">
                                <h3 className="text-lg font-display font-bold text-stone-200">Spellcasting</h3>
                                <div className="flex gap-4 text-xs text-stone-500">
                                    <span>Save DC: <span className="text-stone-200 font-bold text-sm">{player.derivedStats.spellSaveDc}</span></span>
                                    <span>Attack Mod: <span className="text-stone-200 font-bold text-sm">+{player.derivedStats.attackBonus}</span></span>
                                </div>
                            </div>
                            
                            {player.activeSpells.length === 0 ? (
                                <div className="text-stone-600 italic text-sm p-4 text-center">No spells known.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {player.activeSpells.map((spell, i) => (
                                        <div key={i} className="p-3 bg-violet-950/20 border border-violet-900/30 rounded-lg hover:border-violet-500/50 transition-colors group">
                                            <div className="flex justify-between items-center">
                                                <span className="text-stone-300 font-bold group-hover:text-violet-300 transition-colors">{spell}</span>
                                                <Zap className="w-3 h-3 text-violet-700" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* INVENTORY TAB */}
                {activeTab === 'inventory' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-display font-bold text-stone-200">Backpack</h3>
                            <span className="text-xs font-mono text-stone-500">{inventory.length} items</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {inventory.map((item, idx) => (
                                <ItemTooltip key={idx} item={item} className="block">
                                    <div className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-xl hover:border-white/10 transition-colors cursor-help">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${item.rarity === 'rare' ? 'text-blue-400' : item.rarity === 'epic' ? 'text-purple-400' : item.rarity === 'legendary' ? 'text-amber-400' : 'text-stone-200'}`}>
                                                {item.name} {item.qty && item.qty > 1 && <span className="text-stone-500 ml-1">x{item.qty}</span>}
                                            </span>
                                            <span className="text-[10px] text-stone-500 uppercase tracking-wide">{item.type} • {item.rarity}</span>
                                            {item.description && <span className="text-xs text-stone-400 mt-1 italic">"{item.description}"</span>}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            {item.value && <span className="text-xs font-mono text-amber-500">{item.value} gp</span>}
                                            {item.weight && <span className="text-[10px] font-mono text-stone-600">{item.weight} lbs</span>}
                                        </div>
                                    </div>
                                </ItemTooltip>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetModal;
