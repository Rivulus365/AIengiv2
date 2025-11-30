
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Item, ItemRarity, BaseStats, Equipment, Enemy, CombatLogEntry, Spell } from '../types';
import { FEAT_OPTIONS, SPELL_LIBRARY, ITEM_LIBRARY } from '../constants';
import { getModifier } from '../utils/engine';
import { Heart, User, Sword, Shield, Skull, Activity, Box, Book, Star, AlertTriangle, ArrowUp, ArrowDown, Coins, ShoppingBag, Crosshair, Ban } from 'lucide-react';
import AdBanner from './AdBanner';
import DiceAnimation from './DiceAnimation';
import { useGameStore } from '../store/gameStore';

// --- SHARED HELPERS --- (Kept same as before)
const getRarityColor = (rarity?: ItemRarity) => {
    switch (rarity) {
        case 'uncommon': return 'text-emerald-400 border-emerald-900/50 shadow-emerald-900/20';
        case 'rare': return 'text-blue-400 border-blue-900/50 shadow-blue-900/20';
        case 'epic': return 'text-purple-400 border-purple-900/50 shadow-purple-900/20';
        case 'legendary': return 'text-amber-400 border-amber-900/50 shadow-amber-900/20';
        case 'common':
        default: return 'text-stone-300 border-stone-800 shadow-black/50';
    }
};

const getRarityBorder = (rarity?: ItemRarity) => {
    switch (rarity) {
        case 'uncommon': return 'border-emerald-700/50';
        case 'rare': return 'border-blue-700/50';
        case 'epic': return 'border-purple-700/50';
        case 'legendary': return 'border-amber-500/50';
        case 'common':
        default: return 'border-amber-900/40';
    }
};

const getDiceAverage = (dmgStr?: string): number => {
    if (!dmgStr) return 0;
    const match = dmgStr.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return 0;
    const num = parseInt(match[1]);
    const die = parseInt(match[2]);
    const mod = match[3] ? parseInt(match[3]) : 0;
    return num * ((die + 1) / 2) + mod;
};

const getEquippedSlot = (item: Item, equipment: Equipment): Item | null => {
    const libItem = ITEM_LIBRARY[item.name];
    const type = (item.type || libItem?.type || '').toLowerCase();
    const hasDmg = !!item.dmg || !!libItem?.dmg;
    const hasAc = item.ac !== undefined || libItem?.ac !== undefined;

    if (type.includes('shield') || (hasAc && type.includes('shield'))) return equipment.offHand;
    if (type.includes('armor') || type.includes('light') || type.includes('heavy') || type.includes('body')) return equipment.body;
    if (type.includes('accessory') || type.includes('ring') || type.includes('amulet')) return equipment.accessory;
    if (type.includes('melee') || type.includes('ranged') || type.includes('weapon') || hasDmg) return equipment.mainHand;

    if (hasDmg && !type.includes('consumable')) return equipment.mainHand;
    if (hasAc && !type.includes('consumable')) return equipment.body;

    return null;
};

// --- SUB-COMPONENTS --- (Kept same as before)
const StatComparison: React.FC<{ label: string; current: string | number; compare: string | number; isBetter: boolean; isSame: boolean }> = ({ label, current, compare, isBetter, isSame }) => {
    if (isSame) return null;
    return (
        <div className="flex justify-between items-center text-[10px] mt-1">
            <span className="text-stone-500">{label}</span>
            <div className="flex items-center gap-1">
                <span className="text-stone-600 line-through mr-1">{compare}</span>
                <span className={`flex items-center ${isBetter ? 'text-emerald-400 font-bold' : 'text-red-400'}`}>
                    {current}
                    {isBetter ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                </span>
            </div>
        </div>
    );
};

const ItemTooltip: React.FC<{ item: Item; comparisonItem?: Item | null }> = ({ item, comparisonItem }) => {
    const libItem = ITEM_LIBRARY[item.name];
    const desc = item.description || libItem?.description;
    const effect = item.effect || libItem?.effect;
    const rarity = item.rarity || libItem?.rarity || 'common';
    const dmg = item.dmg || libItem?.dmg;
    const ac = item.ac ?? libItem?.ac;
    const val = item.value ?? libItem?.value;

    let compareDmg = null;
    let compareAc = null;

    if (comparisonItem && comparisonItem.name !== item.name) {
        const compDmg = comparisonItem.dmg || ITEM_LIBRARY[comparisonItem.name]?.dmg;
        if (dmg && compDmg) {
            const currentAvg = getDiceAverage(dmg);
            const compAvg = getDiceAverage(compDmg);
            compareDmg = { current: dmg, compare: compDmg, isBetter: currentAvg > compAvg, isSame: currentAvg === compAvg };
        }

        const compAcVal = comparisonItem.ac ?? ITEM_LIBRARY[comparisonItem.name]?.ac;
        if (ac !== undefined && compAcVal !== undefined) {
            compareAc = { current: ac, compare: compAcVal, isBetter: ac > compAcVal, isSame: ac === compAcVal };
        }
    }

    return (
        <div className={`absolute right-full top-0 mr-3 w-64 bg-[#0c0a09] border p-3 rounded shadow-[0_0_20px_rgba(0,0,0,0.8)] z-50 hidden group-hover:block group-focus-within:block animate-in fade-in zoom-in-95 duration-200 pointer-events-none ${getRarityBorder(rarity)}`}>
            <div className="flex justify-between items-start mb-1 border-b border-stone-800 pb-1">
                <h4 className={`font-display font-bold text-sm ${getRarityColor(rarity).split(' ')[0]}`}>{item.name}</h4>
                <span className="text-[9px] uppercase tracking-widest text-stone-600">{rarity}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] text-stone-500 italic font-serif capitalize">{item.type || 'Item'}</div>
                <div className="text-[10px] text-amber-200/80 font-mono">{val ? `${val}gp` : ''}</div>
            </div>
            {desc && <p className="text-xs text-stone-300 mb-3 leading-relaxed font-serif text-justify">{desc}</p>}
            <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] font-mono bg-[#151210] p-2 rounded border border-stone-900">
                {item.weight !== undefined && <span className="text-stone-500">Weight: <span className="text-stone-300">{item.weight}lb</span></span>}
                {item.qty && <span className="text-stone-500">Qty: <span className="text-stone-300">{item.qty}</span></span>}
                {dmg && <span className="col-span-2 text-red-400 flex justify-between"><span>Damage:</span> <span className="text-red-300">{dmg}</span></span>}
                {ac !== undefined && <span className="col-span-2 text-blue-400 flex justify-between"><span>Armor Class:</span> <span className="text-blue-300">+{ac}</span></span>}
                {effect && <span className="col-span-2 text-emerald-400 border-t border-stone-800 pt-1 mt-1 italic">{effect}</span>}
            </div>
            {comparisonItem && comparisonItem.name !== item.name && (compareDmg || compareAc) && (
                <div className="mt-2 pt-2 border-t border-stone-800 bg-stone-900/20 -mx-3 -mb-3 p-3 rounded-b">
                    <div className="text-[9px] uppercase text-stone-500 mb-1 flex items-center gap-1">
                        <span>Vs Equipped:</span>
                        <span className="text-amber-500/80 truncate max-w-[120px]">{comparisonItem.name}</span>
                    </div>
                    {compareDmg && <StatComparison label="Damage" current={compareDmg.current} compare={compareDmg.compare} isBetter={compareDmg.isBetter} isSame={compareDmg.isSame} />}
                    {compareAc && <StatComparison label="AC" current={compareAc.current} compare={compareAc.compare} isBetter={compareAc.isBetter} isSame={compareAc.isSame} />}
                </div>
            )}
        </div>
    );
};

const CombatView: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const primaryEnemy = gameState.combat.enemies[0];
    const lastLog = gameState.combatLog?.[gameState.combatLog.length - 1];
    const isPlayerTurn = !lastLog || lastLog.source === 'enemy';

    if (!primaryEnemy) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-700">
            {/* Turn Indicator */}
            <div className="flex justify-between items-center bg-black/40 p-1 rounded-full border border-stone-800 relative h-8 select-none" role="status" aria-live="polite">
                <div className={`absolute h-6 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${isPlayerTurn ? 'w-[calc(50%-4px)] left-1 bg-emerald-900/80 border border-emerald-700/50' : 'w-[calc(50%-4px)] left-[50%] bg-red-900/80 border border-red-700/50'}`}></div>
                <div className={`relative z-10 w-1/2 text-center text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 ${isPlayerTurn ? 'text-emerald-300 drop-shadow-md' : 'text-stone-600'}`}>Player Turn</div>
                <div className={`relative z-10 w-1/2 text-center text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 ${!isPlayerTurn ? 'text-red-300 drop-shadow-md' : 'text-stone-600'}`}>Enemy Turn</div>
            </div>

            <div className="flex justify-center -mt-2">
                <span className="text-[9px] bg-black border border-stone-800 px-2 py-0.5 rounded-full text-stone-500 uppercase tracking-widest">Distance: {gameState.combat.distance}</span>
            </div>

            {/* Enemy Card */}
            <div className="bg-[#2a0a0a] border border-red-900/50 rounded-sm overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.15)] relative group animate-pulse-red">
                <div className="absolute inset-0 bg-red-900/5 animate-pulse pointer-events-none"></div>
                <div className="bg-red-950/80 p-2 border-b border-red-900/50 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                        <Skull className="w-4 h-4 text-red-400" aria-hidden="true" />
                        <span className="font-display font-bold text-red-100 tracking-wide">{primaryEnemy.name}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-red-400 font-sans border border-red-900/50 px-1 rounded">{primaryEnemy.archetype || 'Hostile'}</span>
                </div>
                <div className="p-4 space-y-3 relative z-10">
                    {primaryEnemy.description && <p className="text-xs text-red-200/60 italic leading-relaxed">{primaryEnemy.description}</p>}
                    {primaryEnemy.traits && primaryEnemy.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {primaryEnemy.traits.map((trait, i) => (
                                <span key={i} className="text-[9px] bg-red-900/30 border border-red-800/50 text-red-300 px-1.5 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="w-2 h-2" />{trait}</span>
                            ))}
                        </div>
                    )}
                    <div role="progressbar" aria-valuenow={primaryEnemy.hp} aria-valuemin={0} aria-valuemax={primaryEnemy.maxHp || 10}>
                        <div className="flex justify-between text-[10px] text-red-400 mb-1 uppercase tracking-wider font-bold">
                            <span>Enemy Vitality</span>
                            <span>{primaryEnemy.hp} {primaryEnemy.maxHp ? `/ ${primaryEnemy.maxHp}` : ''}</span>
                        </div>
                        <div className="w-full bg-[#1a0505] h-2.5 rounded-sm overflow-hidden border border-red-900/30 relative">
                            <div className="bg-gradient-to-r from-red-700 to-red-500 h-full transition-all duration-500 ease-out" style={{ width: `${Math.max(0, Math.min(100, (primaryEnemy.hp / (primaryEnemy.maxHp || primaryEnemy.hp || 10)) * 100))}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Battle Log */}
            <div className="relative">
                <div className="flex items-center gap-2 text-xs font-display tracking-[0.2em] text-red-500 uppercase mb-3"><Activity className="w-3 h-3" /><span>Battle Log</span></div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 relative">
                    {gameState.combatLog && gameState.combatLog.length > 0 ? (
                        gameState.combatLog.slice().reverse().map((log, idx) => {
                            const isPlayer = log.source === 'player';
                            return (
                                <div key={idx} className={`text-xs p-2.5 rounded border ${isPlayer ? (log.isHit ? 'border-emerald-900/50 bg-emerald-950/20 ml-2' : 'border-stone-800 bg-stone-900/20 ml-2') : (log.isHit ? 'border-red-900/50 bg-red-950/20 mr-2' : 'border-stone-800 bg-stone-900/20 mr-2')} transition-all duration-300 hover:bg-opacity-50`}>
                                    <div className={`flex justify-between mb-1.5 opacity-90 border-b pb-1 ${isPlayer ? 'border-emerald-900/20' : 'border-red-900/20'}`}>
                                        <span className={`uppercase font-bold tracking-wider flex items-center gap-1.5 ${isPlayer ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isPlayer ? <User className="w-3 h-3" /> : <Skull className="w-3 h-3" />}
                                            {isPlayer ? 'You' : 'Enemy'}
                                        </span>
                                        <div className="flex items-center gap-2 font-mono text-[10px]">
                                            <span className="text-stone-500">d20: {log.roll}</span>
                                            {log.isHit ? <span className="text-stone-300 flex items-center gap-1"><Crosshair className="w-3 h-3" /> HIT</span> : <span className="text-stone-500 flex items-center gap-1"><Ban className="w-3 h-3" /> MISS</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-stone-300 leading-snug font-serif italic">{log.description}</p>
                                        {log.damage && log.damage > 0 && <div className={`font-mono font-bold text-sm whitespace-nowrap ${isPlayer ? 'text-emerald-500' : 'text-red-500'}`}>-{log.damage}</div>}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-stone-600 italic text-xs text-center py-4 border border-dashed border-stone-800 rounded">The air grows heavy with anticipation...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SkillsView: React.FC<{ gameState: GameState }> = ({ gameState }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
        <div>
            <div className="flex items-center gap-2 text-xs font-display tracking-[0.2em] text-amber-600 uppercase mb-3">
                <Star className="w-3 h-3" aria-hidden="true" /><span>Active Feats</span><span className="w-full h-[1px] bg-amber-900/20"></span>
            </div>
            {gameState.player.activeFeats && gameState.player.activeFeats.length > 0 ? (
                <div className="space-y-2">
                    {gameState.player.activeFeats.map((featName, idx) => {
                        // Defensive coding: Ensure featName is string
                        const safeName = typeof featName === 'string' ? featName : (featName as any)?.name || 'Unknown Feat';
                        const featDetails = FEAT_OPTIONS.find(f => f.name === safeName);
                        return (
                            <div key={idx} className="bg-[#151210] p-3 rounded border border-[#292524] hover:border-amber-900/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-amber-100 font-bold text-sm">{safeName}</h4>
                                    <span className="text-[9px] uppercase tracking-widest text-stone-500 border border-stone-800 px-1 rounded">{featDetails?.type || 'Passive'}</span>
                                </div>
                                {featDetails && <p className="text-xs text-stone-400 mt-1 italic">{featDetails.description}</p>}
                            </div>
                        )
                    })}
                </div>
            ) : <div className="text-stone-600 italic text-xs text-center py-2">No active feats.</div>}
        </div>
        <div>
            <div className="flex items-center gap-2 text-xs font-display tracking-[0.2em] text-stone-500 uppercase mb-3">
                <span>Skills & Proficiencies</span><span className="w-full h-[1px] bg-[#292524]"></span>
            </div>
            <div className="space-y-1">
                {gameState.player.skills && gameState.player.skills.length > 0 ? (
                    gameState.player.skills.map((skill) => (
                        <div key={skill.name} className={`flex justify-between items-center text-xs p-1.5 rounded hover:bg-[#292524] group ${skill.isProficient ? 'bg-[#1c1917]' : ''}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${skill.isProficient ? 'bg-amber-500' : 'bg-stone-800'}`}></div>
                                <span className={`font-serif ${skill.isProficient ? 'text-amber-100 font-bold' : 'text-stone-500'}`}>{skill.name}</span>
                            </div>
                            <span className="font-mono text-stone-500 group-hover:text-white">{skill.modifier >= 0 ? '+' : ''}{skill.modifier}</span>
                        </div>
                    ))
                ) : <div className="text-stone-600 text-xs italic text-center">No skills available.</div>}
            </div>
        </div>
    </div>
);

const GrimoireView: React.FC<{ gameState: GameState }> = ({ gameState }) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
        <div className="text-center p-4 border border-[#292524] bg-[#0c0a09] rounded-lg mb-4">
            <Book className="w-8 h-8 text-violet-900/50 mx-auto mb-2 animate-float" aria-hidden="true" />
            <h3 className="font-display text-lg text-violet-200/80">Grimoire</h3>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest">Spells Known</p>
        </div>
        {gameState.player.activeSpells && gameState.player.activeSpells.length > 0 ? (
            gameState.player.activeSpells.map((spellName, idx) => {
                // Defensive coding: Ensure spellName is string
                const safeName = typeof spellName === 'string' ? spellName : (spellName as any)?.name || 'Unknown Spell';
                const spell: Spell = SPELL_LIBRARY[safeName] || { name: safeName, level: 0, school: 'Unknown', description: 'Mysterious magic.', cost: 'Slot' };
                return (
                    <div key={idx} className="bg-violet-950/10 border border-violet-900/20 p-3 rounded group hover:bg-violet-950/20 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-violet-200 font-display font-bold">{spell.name}</span>
                            <span className="text-[10px] text-violet-400 border border-violet-900/30 px-1 rounded">Lvl {spell.level}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">{spell.school} • {spell.cost || 'Slot'}</div>
                        <p className="text-xs text-stone-400 leading-relaxed italic">{spell.description}</p>
                    </div>
                )
            })
        ) : <div className="text-stone-600 italic text-sm text-center py-10">The pages are blank...</div>}
    </div>
);

const MerchantView: React.FC<{ gameState: GameState, onAction: (t: string) => void }> = ({ gameState, onAction }) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
        <div className="text-center p-4 border border-amber-900/20 bg-[#0c0a09] rounded-lg mb-4">
            <div className="flex justify-center items-center gap-2 text-amber-500 mb-2">
                <ShoppingBag className="w-6 h-6" aria-hidden="true" />
                <Coins className="w-6 h-6 text-amber-400" aria-hidden="true" />
            </div>
            <h3 className="font-display text-lg text-amber-200/80">Local Merchant</h3>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-2">Buying & Selling</p>
            <div className="inline-block bg-[#1a0f0f] border border-amber-900/30 px-3 py-1 rounded-full text-xs font-mono text-amber-300">Wealth: {gameState.player.gold || 0} gp</div>
        </div>

        <div className="flex items-center gap-2 text-xs font-display tracking-[0.2em] text-stone-500 uppercase mb-3"><span>Your Goods</span><span className="w-full h-[1px] bg-[#292524]"></span></div>

        <ul className="text-sm space-y-1">
            {gameState.inventory.length === 0 ? (
                <li className="text-stone-600 italic text-center py-4">Nothing to sell.</li>
            ) : (
                gameState.inventory.map((item, idx) => {
                    const itemValue = item.value || 1;
                    return (
                        <li key={idx} className="flex items-center justify-between p-2 hover:bg-[#292524] rounded border border-transparent hover:border-amber-900/20 group focus-within:bg-[#292524]">
                            <div className="flex items-center gap-3">
                                <div className="text-stone-300">{item.name}</div>
                                {item.qty && <span className="text-stone-600 font-mono text-xs">x{item.qty}</span>}
                            </div>
                            <button onClick={() => onAction(`[System]: Player sells ${item.name}.`)} className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-900/50 px-2 py-1 rounded hover:bg-amber-900/60 transition-colors flex items-center gap-1 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100" aria-label={`Sell ${item.name} for ${itemValue} gold`}>
                                Sell <span className="text-amber-200">{itemValue}gp</span>
                            </button>
                        </li>
                    )
                })
            )}
        </ul>
    </div>
);

const InventoryView: React.FC<{ gameState: GameState, onAction: (t: string) => void }> = ({ gameState, onAction }) => {
    return (
        <div>
            <div className="flex items-center gap-2 text-xs font-display tracking-[0.2em] text-stone-500 uppercase mb-3">
                <span>Inventory</span>
                <span className="w-full h-[1px] bg-[#292524]"></span>
            </div>
            <ul className="text-sm space-y-1 bg-[#151210]/50 p-2 rounded border border-[#292524]/50 min-h-[100px]">
                {gameState.inventory.length === 0 ? (
                    <li className="text-stone-600 italic text-center py-4">Satchel is empty</li>
                ) : (
                    gameState.inventory.map((item, idx) => {
                        let textColor = 'text-stone-300';
                        let itemAnimation = '';
                        if (item.rarity === 'uncommon') textColor = 'text-emerald-300';
                        if (item.rarity === 'rare') textColor = 'text-blue-300';
                        if (item.rarity === 'epic') textColor = 'text-purple-300';
                        if (item.rarity === 'legendary') {
                            textColor = 'text-amber-400';
                            itemAnimation = 'text-shimmer';
                        }
                        const comparisonItem = getEquippedSlot(item, gameState.equipment);

                        return (
                            <li key={idx} tabIndex={0} className="flex items-center gap-3 p-2 hover:bg-[#292524] rounded transition-colors group relative cursor-help focus:outline-none focus:bg-[#292524] focus-within:bg-[#292524]">
                                <ItemTooltip item={item} comparisonItem={comparisonItem} />
                                <Box className={`w-3 h-3 transition-colors ${textColor} opacity-60`} aria-hidden="true" />
                                <div className="flex-1 flex justify-between">
                                    <span className={`${textColor} ${itemAnimation} group-hover:text-white`}>{item.name}</span>
                                    {item.qty && <span className="text-stone-500 font-mono text-xs">x{item.qty}</span>}
                                </div>
                                <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-[#151210] pl-2">
                                    <button onClick={(e) => { e.stopPropagation(); onAction(`[System]: Player equips ${item.name}.`); }} className="text-[9px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded hover:bg-stone-700 border border-stone-600 focus:outline-none focus:border-amber-500" title="Equip">Eqp</button>
                                    <button onClick={(e) => { e.stopPropagation(); onAction(`[System]: Player drops ${item.name}.`); }} className="text-[9px] bg-red-950/40 text-red-400 px-1.5 py-0.5 rounded hover:bg-red-900/60 border border-red-900/50 focus:outline-none focus:border-red-500" title="Drop">Drop</button>
                                </div>
                            </li>
                        )
                    })
                )}
            </ul>
        </div>
    );
};

const StatsView: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const statDisplay = [
        { key: 'str', label: 'STR', val: gameState.player.stats.str, hoverColor: 'group-hover:text-red-500', borderHover: 'hover:border-red-900/30' },
        { key: 'dex', label: 'DEX', val: gameState.player.stats.dex, hoverColor: 'group-hover:text-emerald-500', borderHover: 'hover:border-emerald-900/30' },
        { key: 'con', label: 'CON', val: gameState.player.stats.con, hoverColor: 'group-hover:text-amber-500', borderHover: 'hover:border-amber-900/30' },
        { key: 'int', label: 'INT', val: gameState.player.stats.int, hoverColor: 'group-hover:text-blue-500', borderHover: 'hover:border-blue-900/30' },
        { key: 'wis', label: 'WIS', val: gameState.player.stats.wis, hoverColor: 'group-hover:text-violet-500', borderHover: 'hover:border-violet-900/30' },
        { key: 'cha', label: 'CHA', val: gameState.player.stats.cha, hoverColor: 'group-hover:text-rose-500', borderHover: 'hover:border-rose-900/30' },
    ];

    const spellSlots = gameState.player.resources?.spellSlots;
    const classFeats = gameState.player.resources?.classFeats;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Resources Grid */}
            {((spellSlots?.max ?? 0) > 0 || (classFeats?.max ?? 0) > 0) && (
                <div className="grid grid-cols-2 gap-2">
                    {(spellSlots?.max ?? 0) > 0 && (
                        <div className="bg-[#151015] border border-violet-900/30 p-2 rounded flex flex-col items-center">
                            <span className="text-[9px] text-violet-400 uppercase tracking-widest mb-1">Spell Slots</span>
                            <div className="flex gap-1">
                                {[...Array(spellSlots!.max)].map((_, i) => (
                                    <div key={i} className={`w-3 h-3 rounded-full border border-violet-500 ${i < spellSlots!.current ? 'bg-violet-500 shadow-[0_0_5px_rgba(139,92,246,0.5)]' : 'bg-transparent'}`}></div>
                                ))}
                            </div>
                        </div>
                    )}
                    {(classFeats?.max ?? 0) > 0 && (
                        <div className="bg-[#151210] border border-amber-900/30 p-2 rounded flex flex-col items-center">
                            <span className="text-[9px] text-amber-500 uppercase tracking-widest mb-1 truncate max-w-full">{classFeats!.name}</span>
                            <div className="flex gap-1">
                                {[...Array(classFeats!.max)].map((_, i) => (
                                    <div key={i} className={`w-3 h-3 transform rotate-45 border border-amber-600 ${i < classFeats!.current ? 'bg-amber-600' : 'bg-transparent'}`}></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-display tracking-[0.2em] text-stone-500 uppercase">
                    <span className="w-full h-[1px] bg-[#292524]"></span><span>Attributes</span><span className="w-full h-[1px] bg-[#292524]"></span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {statDisplay.map((stat) => {
                        const mod = getModifier(stat.val);
                        const modString = mod >= 0 ? `+${mod}` : `${mod}`;
                        const modColor = mod > 0 ? 'text-emerald-400' : mod < 0 ? 'text-red-400' : 'text-stone-500';
                        const modBg = mod > 0 ? 'bg-emerald-950/30 border-emerald-900/50' : mod < 0 ? 'bg-red-950/30 border-red-900/50' : 'bg-[#0c0a09] border-[#292524]';

                        return (
                            <div key={stat.key} className={`bg-[#151210] p-2 rounded text-center border border-[#292524] group ${stat.borderHover} transition-colors relative`}>
                                {gameState.player.unspentStatPoints > 0 && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                                )}
                                <div className="text-[9px] text-stone-500 uppercase tracking-wider mb-0.5">{stat.label}</div>
                                <div className={`font-display font-bold text-xl text-stone-300 ${stat.hoverColor} transition-colors`}>{stat.val}</div>
                                <div className={`text-[10px] font-mono mx-auto w-8 rounded mt-0.5 border ${modBg} ${modColor} transition-colors`}>{modString}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Equipment Slots */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-display tracking-[0.2em] text-stone-500 uppercase"><span>Equipment</span><span className="w-full h-[1px] bg-[#292524]"></span></div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div tabIndex={0} className={`bg-[#151210] p-2 rounded border border-[#292524] group relative focus:border-amber-500/50 outline-none ${gameState.equipment.mainHand?.rarity ? 'border-' + getRarityColor(gameState.equipment.mainHand.rarity).split(' ')[1] : ''}`}>
                        {gameState.equipment.mainHand && <ItemTooltip item={gameState.equipment.mainHand} />}
                        <div className="text-[9px] uppercase text-stone-500 mb-1">Main Hand</div>
                        <div className={`text-amber-100/90 truncate ${gameState.equipment.mainHand?.rarity === 'legendary' ? 'text-shimmer font-bold' : ''} ${gameState.equipment.mainHand?.rarity === 'epic' ? 'text-purple-300' : ''}`}>{gameState.equipment.mainHand?.name || 'Empty'}</div>
                        {gameState.equipment.mainHand && <div className="text-stone-500 text-[9px] mt-0.5">{gameState.equipment.mainHand.dmg}</div>}
                    </div>
                    <div tabIndex={0} className="bg-[#151210] p-2 rounded border border-[#292524] group relative focus:border-amber-500/50 outline-none">
                        {gameState.equipment.body && <ItemTooltip item={gameState.equipment.body} />}
                        <div className="text-[9px] uppercase text-stone-500 mb-1">Body</div>
                        <div className={`text-amber-100/90 truncate ${gameState.equipment.body?.rarity === 'legendary' ? 'text-shimmer' : ''}`}>{gameState.equipment.body?.name || 'Empty'}</div>
                        {gameState.equipment.body && <div className="text-stone-500 text-[9px] mt-0.5">AC {gameState.equipment.body.ac}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN SIDEBAR COMPONENT ---

const GameStateSidebar: React.FC = () => {
    const gameState = useGameStore(state => state.gameState);
    const processTurn = useGameStore(state => state.processTurn);
    const soundEnabled = useGameStore(state => state.soundEnabled);

    const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'grimoire' | 'merchant'>('overview');
    const [animatingRoll, setAnimatingRoll] = useState<{ value: number, type: 'player' | 'enemy', isCrit: boolean, isFail: boolean } | null>(null);
    const lastLogRef = useRef<string | null>(null);

    useEffect(() => {
        const log = gameState.combatLog;
        if (log && log.length > 0) {
            const lastEntry = log[log.length - 1];
            const entryString = JSON.stringify(lastEntry);

            if (entryString !== lastLogRef.current) {
                lastLogRef.current = entryString;
                if (typeof lastEntry.roll === 'number') {
                    setAnimatingRoll({
                        value: lastEntry.roll,
                        type: lastEntry.source,
                        isCrit: lastEntry.roll === 20,
                        isFail: lastEntry.roll === 1
                    });
                }
            }
        }
    }, [gameState.combatLog]);

    const nextLevelXp = gameState.player.nextLevelXp || 300;
    const xpPercentage = Math.min(100, (gameState.player.xp / nextLevelXp) * 100);

    const isMerchantAvailable = ['town', 'city', 'village', 'shop', 'camp', 'outpost'].some(loc =>
        gameState.worldState.location.toLowerCase().includes(loc)
    );

    const handleAction = (text: string) => {
        processTurn(text);
    };

    return (
        <div className={`h-full flex flex-col text-stone-300 font-serif overflow-hidden transition-colors duration-700 relative ${gameState.combat.isActive ? 'bg-[#1a0f0f]' : 'bg-[#1c1917]'}`}>

            {animatingRoll && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none animate-in fade-in duration-300" role="status" aria-live="assertive">
                    <DiceAnimation target={animatingRoll.value} type={animatingRoll.type} isCrit={animatingRoll.isCrit} isFail={animatingRoll.isFail} onComplete={() => setAnimatingRoll(null)} soundEnabled={soundEnabled} />
                </div>
            )}

            {/* Character Header */}
            <div className={`p-6 border-b shrink-0 transition-colors duration-700 ${gameState.combat.isActive ? 'bg-[#2a1212] border-red-900/30' : 'bg-[#151210] border-[#292524]'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-full border transition-colors duration-700 ${gameState.combat.isActive ? 'bg-red-950/40 border-red-500/30' : 'bg-[#292524] border-amber-900/30'} animate-float`}>
                        <User className={`w-6 h-6 transition-colors duration-700 ${gameState.combat.isActive ? 'text-red-500' : 'text-amber-600'}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-display text-amber-100/90 tracking-wide leading-none">{gameState.player.name || "Unknown Hero"}</h2>
                            <div className="flex items-center gap-1.5 bg-[#0c0a09]/50 px-2 py-0.5 rounded-full border border-amber-900/20" title={`Gold: ${gameState.player.gold || 0}`}>
                                <Coins className="w-3 h-3 text-amber-500" aria-hidden="true" />
                                <span className="font-mono text-xs text-amber-200">{gameState.player.gold || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-stone-500 font-sans tracking-widest uppercase mt-1">
                            <span className={gameState.combat.isActive ? 'text-red-400' : 'text-amber-700'}>{gameState.player.class}</span>
                            <span className="text-stone-300">Level {gameState.player.level}</span>
                        </div>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="mt-2 relative group" role="progressbar" aria-valuenow={gameState.player.xp} aria-valuemin={0} aria-valuemax={nextLevelXp}>
                    <div className="flex justify-between text-[10px] text-stone-600 mb-1 font-mono group-hover:text-amber-500 transition-colors" aria-hidden="true"><span>EXP</span><span>{gameState.player.xp} / {nextLevelXp}</span></div>
                    <div className="w-full bg-[#0c0a09] h-1 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-amber-600 h-full transition-all duration-500 relative" style={{ width: `${xpPercentage}%` }}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-amber-200 rounded-full blur-[1px] animate-torch"></div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                {!gameState.combat.isActive && (
                    <div className="flex mt-6 border-b border-[#292524] overflow-x-auto scrollbar-hide" role="tablist">
                        {['overview', 'skills', 'grimoire'].map(tab => (
                            <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 pb-2 text-xs uppercase tracking-widest font-display transition-colors whitespace-nowrap px-2 ${activeTab === tab ? 'text-amber-500 border-b border-amber-500' : 'text-stone-600 hover:text-stone-400'}`}>{tab}</button>
                        ))}
                        {isMerchantAvailable && (
                            <button role="tab" aria-selected={activeTab === 'merchant'} onClick={() => setActiveTab('merchant')} className={`flex-1 pb-2 text-xs uppercase tracking-widest font-display transition-colors whitespace-nowrap px-2 ${activeTab === 'merchant' ? 'text-emerald-500 border-b border-emerald-500' : 'text-stone-600 hover:text-emerald-700/60'}`}>Trade</button>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                {/* Vitals */}
                <div className="space-y-3 font-sans">
                    <div role="progressbar" aria-valuenow={gameState.player.hp.current} aria-valuemin={0} aria-valuemax={gameState.player.hp.max}>
                        <div className="flex items-center justify-between mb-1 text-xs"><div className="flex items-center gap-1.5 text-stone-400"><Heart className="w-3 h-3 text-red-800" /><span>Health</span></div><span className="font-mono text-stone-300">{gameState.player.hp.current} <span className="text-stone-600">/</span> {gameState.player.hp.max}</span></div>
                        <div className="w-full bg-[#0c0a09] h-2 rounded-full overflow-hidden border border-white/5 relative">
                            <div className="absolute top-0 left-0 h-full bg-red-900/30 transition-all duration-1000 ease-out" style={{ width: `${Math.max(0, Math.min(100, (gameState.player.hp.current / gameState.player.hp.max) * 100))}%` }} />
                            <div className="bg-gradient-to-r from-red-900 to-red-600 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(153,27,27,0.5)] relative" style={{ width: `${Math.max(0, Math.min(100, (gameState.player.hp.current / gameState.player.hp.max) * 100))}%` }}></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between bg-[#0c0a09]/50 p-2 rounded border border-[#292524]" title="Armor Class"><div className="flex items-center gap-2 text-xs text-stone-400"><Shield className="w-3 h-3 text-stone-500" /><span>AC</span></div><span className="font-mono text-stone-200">{gameState.player.derivedStats.ac}</span></div>
                        <div className="flex items-center justify-between bg-[#0c0a09]/50 p-2 rounded border border-[#292524]" title="Attack Bonus"><div className="flex items-center gap-2 text-xs text-stone-400"><Sword className="w-3 h-3 text-stone-500" /><span>ATK</span></div><span className="font-mono text-stone-200">+{gameState.player.derivedStats.attackBonus}</span></div>
                    </div>
                </div>

                {gameState.combat.isActive && gameState.combat.enemies[0] ? (
                    <CombatView gameState={gameState} />
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <>
                                <StatsView gameState={gameState} />
                                <InventoryView gameState={gameState} onAction={handleAction} />
                            </>
                        )}
                        {activeTab === 'skills' && <SkillsView gameState={gameState} />}
                        {activeTab === 'grimoire' && <GrimoireView gameState={gameState} />}
                        {activeTab === 'merchant' && <MerchantView gameState={gameState} onAction={handleAction} />}
                    </>
                )}
            </div>

            <AdBanner />
        </div>
    );
};

export default GameStateSidebar;
