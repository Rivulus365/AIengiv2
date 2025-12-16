
import React, { memo } from 'react';
import { useGameStore } from '../store/gameStore';
import { CombatState, CombatLogEntry, Item, Equipment, PlayerState } from '../types';
import { 
    Skull, Shield, Activity, Map, Clock, Compass, Coins, Sword, Shirt, Zap, Crosshair, Ban, User, Backpack, Crown
} from 'lucide-react';

// --- Components ---

const StatCard: React.FC<{ label: string, value: string | number, sub?: string, icon?: React.ElementType, color?: string }> = ({ label, value, sub, icon: Icon, color = "text-stone-200" }) => (
    <div className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-br ${color === 'text-red-400' ? 'from-red-900/20' : color === 'text-emerald-400' ? 'from-emerald-900/20' : 'from-stone-800/20'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        {Icon && <Icon className={`w-4 h-4 mb-1 opacity-50 ${color}`} />}
        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500">{label}</span>
        <span className={`text-xl font-display font-bold ${color}`}>{value}</span>
        {sub && <span className="text-[9px] text-stone-600">{sub}</span>}
    </div>
);

const HealthBar: React.FC<{ current: number, max: number }> = ({ current, max }) => {
    const percent = Math.min(100, Math.max(0, (current / max) * 100));
    return (
        <div className="col-span-2 glass-panel p-3 rounded-xl relative overflow-hidden">
            <div className="flex justify-between items-end mb-2 relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-red-500" /> Vitality
                </span>
                <span className="text-sm font-mono font-bold text-stone-200">{current} <span className="text-stone-600">/</span> {max}</span>
            </div>
            <div className="h-2 bg-stone-900/50 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );
};

const EquipmentSlot: React.FC<{ label: string, item?: Item | null, icon: React.ElementType }> = ({ label, item, icon: Icon }) => (
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
        {/* Tooltip would go here in a refined implementation */}
    </div>
);

const WorldWidget: React.FC<{ location: string, time: string, quest: string }> = ({ location, time, quest }) => (
    <div className="glass-panel p-4 rounded-xl space-y-3 border-l-4 border-l-amber-700/50">
        <div className="flex items-start justify-between">
            <div>
                <div className="text-[10px] uppercase text-stone-500 font-bold flex items-center gap-1.5">
                    <Map className="w-3 h-3" /> Location
                </div>
                <div className="text-sm text-stone-200 font-display font-semibold mt-0.5 leading-tight">{location}</div>
            </div>
            <div className="text-right">
                <div className="text-[10px] uppercase text-stone-500 font-bold flex items-center justify-end gap-1.5">
                    <Clock className="w-3 h-3" /> Time
                </div>
                <div className="text-sm text-amber-500 font-mono mt-0.5">{time}</div>
            </div>
        </div>
        {quest && quest !== 'None' && (
            <div className="pt-3 border-t border-white/5">
                <div className="text-[10px] uppercase text-stone-500 font-bold flex items-center gap-1.5 mb-1">
                    <Compass className="w-3 h-3 text-amber-600" /> Current Quest
                </div>
                <div className="text-xs text-stone-300 italic leading-snug">"{quest}"</div>
            </div>
        )}
    </div>
);

const CombatWidget: React.FC<{ combat: CombatState, log: CombatLogEntry[] }> = ({ combat, log }) => {
    const enemy = combat.enemies[0];
    if (!enemy) return null;

    return (
        <div className="space-y-3 animate-slide-up">
            <div className="glass-panel p-1 rounded-full flex relative bg-black/40">
                <div className="w-full text-center py-1 text-[10px] font-bold uppercase tracking-widest text-red-400 animate-pulse">
                    Combat Encounter
                </div>
            </div>

            {/* Enemy Card */}
            <div className="glass-panel border-red-900/30 bg-red-950/10 p-4 rounded-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-red-900/10 rotate-12">
                    <Skull className="w-24 h-24" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-display font-bold text-lg text-red-100">{enemy.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-900/40 text-red-300 border border-red-800/50">
                            {enemy.state || 'Hostile'}
                        </span>
                    </div>

                    {/* Enemy HP */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-red-400 font-bold uppercase">
                            <span>Health</span>
                            <span>{enemy.hp}</span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-red-600 transition-all duration-300"
                                style={{ width: `${Math.min(100, (enemy.hp / (enemy.maxHp || enemy.hp || 1)) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Enemy Stats */}
                    <div className="flex gap-4 mt-3">
                        <div className="text-center">
                            <div className="text-[9px] text-stone-500 uppercase font-bold">AC</div>
                            <div className="text-sm font-mono text-stone-300">{enemy.ac}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[9px] text-stone-500 uppercase font-bold">Dist</div>
                            <div className="text-sm font-mono text-stone-300">{combat.distance}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Log */}
            <div className="glass-panel p-3 rounded-xl max-h-[200px] overflow-y-auto custom-scrollbar space-y-2">
                <div className="text-[10px] uppercase text-stone-600 font-bold sticky top-0 bg-[#0c0a09]/90 backdrop-blur pb-2 border-b border-white/5 mb-2">
                    Battle Log
                </div>
                {log.slice().reverse().map((entry, i) => (
                    <div key={i} className="text-xs flex gap-2 items-start opacity-90">
                        <div className={`mt-0.5 shrink-0 ${entry.source === 'player' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {entry.isHit ? <Crosshair className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        </div>
                        <div>
                            <span className="font-bold text-stone-400">{entry.source === 'player' ? 'You' : 'Enemy'} </span>
                            <span className="text-stone-500 italic">{entry.action}</span>
                            {entry.damage && <span className={`ml-1 font-bold ${entry.source === 'player' ? 'text-emerald-400' : 'text-red-400'}`}>-{entry.damage}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GameStateSidebar: React.FC = () => {
    const gameState = useGameStore(state => state.gameState);
    const { player, worldState, combat, combatLog, inventory, equipment } = gameState;

    return (
        <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar pb-20">
            
            {/* Player Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-stone-800 flex items-center justify-center border-2 border-white/10 shadow-lg">
                    <User className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="font-display font-bold text-xl text-stone-100 leading-none">{player.name || "Unknown"}</h2>
                    <div className="text-xs text-stone-500 font-bold mt-1 flex items-center gap-2">
                        <span className="bg-white/5 px-1.5 py-0.5 rounded text-stone-300">Lvl {player.level}</span>
                        <span className="uppercase tracking-wide">{player.race} {player.class}</span>
                    </div>
                </div>
            </div>

            {/* Vital Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
                <HealthBar current={player.hp.current} max={player.hp.max} />
                <StatCard label="Armor" value={player.derivedStats.ac} icon={Shield} />
                <StatCard label="Gold" value={player.gold} icon={Coins} color="text-amber-400" />
                <StatCard label="XP" value={player.xp} sub={`/ ${player.nextLevelXp}`} icon={Crown} />
            </div>

            {/* World Info */}
            <WorldWidget location={worldState.location} time={worldState.time} quest={worldState.activeQuest} />

            {/* Dynamic Content: Combat OR Exploration */}
            {combat.isActive ? (
                <CombatWidget combat={combat} log={combatLog} />
            ) : (
                <div className="space-y-4 animate-fade-in">
                    
                    {/* Equipment */}
                    <div className="space-y-2">
                        <div className="text-[10px] uppercase text-stone-600 font-bold tracking-widest pl-1">Equipment</div>
                        <div className="grid gap-2">
                            <EquipmentSlot label="Main Hand" item={equipment.mainHand} icon={Sword} />
                            <EquipmentSlot label="Off Hand" item={equipment.offHand} icon={Shield} />
                            <EquipmentSlot label="Armor" item={equipment.body} icon={Shirt} />
                        </div>
                    </div>

                    {/* Inventory Preview */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center pl-1 pr-1">
                            <div className="text-[10px] uppercase text-stone-600 font-bold tracking-widest">Backpack</div>
                            <span className="text-[9px] text-stone-700">{inventory.length} Items</span>
                        </div>
                        <div className="glass-panel rounded-xl overflow-hidden">
                            {inventory.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="p-3 border-b border-white/5 last:border-0 flex justify-between items-center hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-stone-600"></div>
                                        <span className="text-xs text-stone-300">{item.name}</span>
                                    </div>
                                    {item.qty && item.qty > 1 && <span className="text-[10px] text-stone-500">x{item.qty}</span>}
                                </div>
                            ))}
                            {inventory.length === 0 && <div className="p-4 text-center text-xs text-stone-600 italic">Empty</div>}
                            {inventory.length > 5 && <div className="p-2 text-center text-[10px] text-stone-500 bg-black/20">+{inventory.length - 5} more</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameStateSidebar;
