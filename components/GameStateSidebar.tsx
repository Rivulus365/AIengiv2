
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { CombatState, CombatLogEntry, Item, Equipment, PlayerState, Skill, BaseStats, Enemy } from '../types';
import { 
    Skull, Shield, Activity, Map, Clock, Compass, Coins, Sword, Shirt, Zap, Crosshair, Ban, User, Backpack, Crown, BookOpen, Star, Eye, Weight, Trash2, CheckCircle, ScrollText, FileText, Footprints, Heart
} from 'lucide-react';
import { SKILL_DEFINITIONS } from '../constants';
import { getModifier, calculateCarryCapacity } from '../utils/engine';
import Button from './design-system/Button';
import { ItemTooltip } from './design-system/ItemTooltip';

const StatCard: React.FC<{ label: string, value: string | number, sub?: string, icon?: React.ElementType, color?: string }> = ({ label, value, sub, icon: Icon, color = "text-stone-200" }) => (
    <div className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-br ${color === 'text-red-400' ? 'from-red-900/20' : color === 'text-emerald-400' ? 'from-emerald-900/20' : 'from-stone-800/20'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        {Icon && <Icon className={`w-4 h-4 mb-1 opacity-50 ${color}`} />}
        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500">{label}</span>
        <span className={`text-xl font-display font-bold ${color}`}>{value}</span>
        {sub && <span className="text-[9px] text-stone-600">{sub}</span>}
    </div>
);

const HealthBar: React.FC<{ 
  current: number, 
  max: number, 
  label?: string, 
  compact?: boolean,
  colorClass?: string 
}> = ({ current, max, label, compact = false, colorClass = "from-red-800 to-red-500" }) => {
    const percent = Math.min(100, Math.max(0, (current / (max || 1)) * 100));
    const [ghostPercent, setGhostPercent] = useState(percent);
    const lastHp = useRef(current);

    useEffect(() => {
        if (current < lastHp.current) {
            const timer = setTimeout(() => setGhostPercent(percent), 600);
            return () => clearTimeout(timer);
        } else {
            setGhostPercent(percent);
        }
        lastHp.current = current;
    }, [current, percent]);

    const isCritical = percent < 25;

    return (
        <div className={`${compact ? 'w-full' : 'col-span-2'} glass-panel p-3 rounded-xl relative overflow-hidden group transition-all duration-500 ${isCritical && !compact ? 'border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : ''}`}>
            <div className="flex justify-between items-end mb-2 relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    {label === 'Vitality' ? <Activity className={`w-3 h-3 text-red-500 ${isCritical ? 'animate-pulse' : ''}`} /> : <Heart className="w-3 h-3 text-red-700" />}
                    {label}
                </span>
                <span className="text-sm font-mono font-bold text-stone-200">{current} <span className="text-stone-600">/</span> {max}</span>
            </div>
            <div className={`${compact ? 'h-1.5' : 'h-2.5'} bg-stone-900/80 rounded-full overflow-hidden border border-white/5 relative shadow-inner`}>
                <div 
                    className="absolute inset-y-0 left-0 bg-red-950 transition-all duration-1000 ease-out" 
                    style={{ width: `${ghostPercent}%` }}
                ></div>
                <div 
                    className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-300 ease-out shadow-[0_0_10px_rgba(220,38,38,0.3)]`} 
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
            {isCritical && !compact && (
                <div className="absolute inset-0 bg-red-900/5 animate-pulse pointer-events-none"></div>
            )}
        </div>
    );
};

const EnemyCard: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
    const max = enemy.maxHp || enemy.hp;
    return (
        <div className="glass-panel p-3 rounded-xl border border-stone-800 bg-black/40 group hover:border-red-900/40 transition-all hover:translate-x-1">
            <div className="flex justify-between items-start mb-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-100 truncate">{enemy.name}</span>
                        {enemy.ai && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-500 uppercase tracking-tighter">
                                {enemy.ai}
                            </span>
                        )}
                    </div>
                    {enemy.state && <span className="text-[9px] text-stone-500 italic block truncate mt-0.5">{enemy.state}</span>}
                </div>
                <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1 text-stone-400">
                        <Shield className="w-3 h-3" />
                        <span className="text-[10px] font-mono font-bold">{enemy.ac}</span>
                    </div>
                </div>
            </div>
            
            <HealthBar 
                current={enemy.hp} 
                max={max} 
                compact 
                colorClass={enemy.hp < (max * 0.25) ? "from-red-900 to-red-700" : "from-red-800 to-red-600"} 
            />
            
            <div className="mt-2 flex gap-1 overflow-x-hidden">
                {enemy.traits?.slice(0, 2).map((t, i) => (
                    <span key={i} className="text-[7px] uppercase font-bold text-stone-600 border border-stone-800 px-1 rounded whitespace-nowrap">
                        {t}
                    </span>
                ))}
            </div>
        </div>
    );
};

const CombatDistanceIndicator: React.FC<{ distance: 'Melee' | 'Near' | 'Far' }> = ({ distance }) => {
    const steps = ['Melee', 'Near', 'Far'];
    const icons: Record<string, React.ElementType> = {
        'Melee': Sword,
        'Near': Footprints,
        'Far': Crosshair
    };
    
    return (
        <div className="glass-panel p-3 rounded-xl border-red-900/30 bg-red-950/10 animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-red-900/5 animate-pulse pointer-events-none"></div>
            <div className="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-3 flex justify-between items-center relative z-10">
                <span className="flex items-center gap-1.5"><Skull className="w-3 h-3" /> Engagement</span>
                <span className="text-red-400/80">{distance} Range</span>
            </div>
            <div className="flex justify-between items-center relative px-2 py-1 z-10">
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-stone-800 -z-10"></div>
                {steps.map((step) => {
                    const isActive = step === distance;
                    const Icon = icons[step];
                    return (
                        <div key={step} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-40 grayscale'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors duration-300 ${isActive ? 'bg-red-900 border-red-500 text-white shadow-red-900/50' : 'bg-stone-900 border-stone-700 text-stone-500'}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[8px] uppercase font-bold tracking-wider ${isActive ? 'text-red-400' : 'text-stone-600'}`}>{step}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const EquipmentSlot: React.FC<{ label: string, item?: Item | null, icon: React.ElementType }> = ({ label, item, icon: Icon }) => (
    <ItemTooltip item={item} className="block w-full">
        <div className="glass-panel p-2 rounded-lg flex items-center gap-3 group hover:bg-white/5 transition-colors cursor-help relative">
            <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 transition-colors">
                <Icon className="w-4 h-4 text-stone-600 group-hover:text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[9px] uppercase text-stone-600 font-bold tracking-wider">{label}</div>
                <div className={`text-xs truncate ${item ? 'text-stone-300 group-hover:text-amber-100' : 'text-stone-700 italic'}`}>
                    {item?.name || "Empty"}
                </div>
            </div>
        </div>
    </ItemTooltip>
);

const QuestLog: React.FC<{ active: string, completed: string[] }> = ({ active, completed }) => (
    <div className="space-y-4 animate-fade-in">
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-amber-600">
            <h4 className="text-[10px] uppercase font-bold text-amber-500 mb-2 flex items-center gap-2">
                <Star className="w-3 h-3 fill-current" /> Main Objective
            </h4>
            <p className="text-sm text-stone-200 font-serif leading-tight">{active || "Find your purpose in the world."}</p>
        </div>
        {completed.length > 0 && (
            <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-stone-500 tracking-widest pl-1">Chronicle</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {completed.map((q, i) => (
                        <div key={i} className="flex gap-3 p-3 glass-panel rounded-lg border-emerald-900/20">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs text-stone-400 font-serif italic line-through opacity-60">{q}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const GameStateSidebar: React.FC = () => {
    const gameState = useGameStore(state => state.gameState);
    const equipItem = useGameStore(state => state.equipItem);
    const dropItem = useGameStore(state => state.dropItem);
    const setToggleCharacterSheet = useUIStore(state => state.setToggleCharacterSheet);
    
    const { player, worldState, combat, inventory, equipment } = gameState;
    const [activeTab, setActiveTab] = useState<'gear' | 'skills' | 'quests'>('gear');

    const carryCap = calculateCarryCapacity(player.stats.str);
    const currentWeight = inventory.reduce((total, item) => total + (item.weight || 0) * (item.qty || 1), 0);

    return (
        <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar pb-20">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-stone-800 flex items-center justify-center border-2 border-white/10 shadow-lg shrink-0">
                    <User className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                    <h2 className="font-display font-bold text-xl text-stone-100 leading-none truncate">{player.name || "Unknown"}</h2>
                    <div className="text-xs text-stone-500 font-bold mt-1 flex items-center gap-2">
                        <span className="bg-white/5 px-1.5 py-0.5 rounded text-stone-300 whitespace-nowrap">Lvl {player.level}</span>
                        <span className="uppercase tracking-wide truncate">{player.race} {player.class}</span>
                    </div>
                </div>
            </div>

            <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-center"
                onClick={() => setToggleCharacterSheet(true)}
                leftIcon={<FileText className="w-3 h-3" />}
            >
                View Character Sheet
            </Button>

            <div className="grid grid-cols-2 gap-2">
                <HealthBar current={player.hp.current} max={player.hp.max} label="Vitality" />
                <StatCard label="Armor" value={player.derivedStats.ac} icon={Shield} />
                <StatCard label="Gold" value={player.gold} icon={Coins} color="text-amber-400" />
            </div>

            {combat.isActive && (
                <div className="space-y-4 animate-fade-in bg-red-950/5 p-2 rounded-2xl border border-red-900/10">
                    <CombatDistanceIndicator distance={combat.distance} />
                    {combat.enemies && combat.enemies.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-500 tracking-widest px-2">
                                <span className="flex items-center gap-1.5 text-red-500/80"><Skull className="w-3 h-3" /> Adversaries</span>
                                <span>{combat.enemies.length} Present</span>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar px-1">
                                {combat.enemies.map((enemy, idx) => (
                                    <EnemyCard key={`${enemy.name}-${idx}`} enemy={enemy} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex border-b border-white/10">
                <button onClick={() => setActiveTab('gear')} className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors flex flex-col items-center ${activeTab === 'gear' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500'}`}><Backpack className="w-3 h-3 mb-1" /> Gear</button>
                <button onClick={() => setActiveTab('skills')} className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors flex flex-col items-center ${activeTab === 'skills' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500'}`}><Zap className="w-3 h-3 mb-1" /> Skills</button>
                <button onClick={() => setActiveTab('quests')} className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors flex flex-col items-center ${activeTab === 'quests' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500'}`}><ScrollText className="w-3 h-3 mb-1" /> Quests</button>
            </div>

            {activeTab === 'gear' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid gap-2">
                        <EquipmentSlot label="Weapon" item={equipment.mainHand} icon={Sword} />
                        <EquipmentSlot label="Armor" item={equipment.body} icon={Shirt} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase text-stone-600 font-bold px-1">
                            <span>Inventory</span>
                            <span>{currentWeight.toFixed(1)} / {carryCap} lbs</span>
                        </div>
                        <div className="space-y-1">
                            {inventory.map((item, idx) => (
                                <ItemTooltip key={idx} item={item} className="block w-full">
                                    <div className="group p-2 rounded bg-black/20 border border-white/5 flex justify-between items-center hover:border-amber-500/30 transition-all cursor-help relative">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs text-stone-300 truncate">{item.name} {item.qty && item.qty > 1 ? `(x${item.qty})` : ''}</span>
                                            <span className="text-[9px] text-stone-600 uppercase tracking-tighter">{item.rarity} {item.type}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-black/80 rounded px-1 border border-white/10">
                                            <button onClick={(e) => { e.stopPropagation(); equipItem(item); }} className="p-1 hover:bg-emerald-950/50 text-stone-500 hover:text-emerald-500 rounded transition-colors" title="Equip"><Sword className="w-3 h-3" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); dropItem(item); }} className="p-1 hover:bg-red-950/50 text-stone-500 hover:text-red-500 rounded transition-colors" title="Drop"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </ItemTooltip>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'skills' && (
                <div className="space-y-1 animate-fade-in">
                    {player.skills.map(s => (
                        <div key={s.name} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group">
                            <span className={`text-xs ${s.isProficient ? 'text-amber-400 font-bold' : 'text-stone-400'}`}>{s.name}</span>
                            <span className={`text-xs font-mono ${s.modifier >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{s.modifier >= 0 ? '+' : ''}{s.modifier}</span>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'quests' && (
                <QuestLog active={worldState.activeQuest} completed={worldState.questsCompleted || []} />
            )}
        </div>
    );
};

export default GameStateSidebar;
