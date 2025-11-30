import React, { useState, useEffect } from 'react';
import { BaseStats, Feat, ClassDefinition, RaceDefinition } from '../types';
import { GameDataService } from '../services/gameData';
import { getModifier } from '../utils/engine';
import { generateFantasyName } from '../utils/nameGenerator';
import { Sword, Shield, Brain, User, Check, Wind, Eye, Crown, ArrowRight, ArrowLeft, Star, BookOpen, Loader2, Dices } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const CharacterCreator: React.FC = () => {
    const createCharacter = useGameStore(state => state.createCharacter);
    
    const [step, setStep] = useState(1); // 1: Identity, 2: Stats, 3: Feat
    const [isLoading, setIsLoading] = useState(true);

    const [classDefinitions, setClassDefinitions] = useState<Record<string, ClassDefinition>>({});
    const [raceDefinitions, setRaceDefinitions] = useState<Record<string, RaceDefinition>>({});
    const [featOptions, setFeatOptions] = useState<Feat[]>([]);

    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [race, setRace] = useState('');
    const [charClass, setCharClass] = useState('');
    const [selectedFeat, setSelectedFeat] = useState<Feat | null>(null);

    const [stats, setStats] = useState<BaseStats>({
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [classes, races, feats] = await Promise.all([
                    GameDataService.getClasses(),
                    GameDataService.getRaces(),
                    GameDataService.getFeatOptions()
                ]);
                setClassDefinitions(classes);
                setRaceDefinitions(races);
                setFeatOptions(feats);

                // Set defaults once data is loaded
                const classKeys = Object.keys(classes);
                const raceKeys = Object.keys(races);
                if (classKeys.length > 0) setCharClass(classKeys[0]);
                if (raceKeys.length > 0) setRace(raceKeys[0]);
                if (feats.length > 0) setSelectedFeat(feats[0]);

                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load game data:", error);
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const POINTS_BUDGET = 12;

    // Calculate used points based on deviation from 10
    const usedPoints = (Object.values(stats) as number[]).reduce((a: number, b: number) => a + (b - 10), 0);
    const remainingPoints = POINTS_BUDGET - usedPoints;

    const currentClassDef = classDefinitions[charClass];
    const currentRaceDef = raceDefinitions[race];

    const increment = (stat: keyof BaseStats) => {
        if (remainingPoints > 0 && stats[stat] < 18) {
            setStats({ ...stats, [stat]: stats[stat] + 1 });
        }
    };

    const decrement = (stat: keyof BaseStats) => {
        if (stats[stat] > 10) {
            setStats({ ...stats, [stat]: stats[stat] - 1 });
        }
    };

    const handleRandomizeName = () => {
        const newName = generateFantasyName(race, gender);
        setName(newName);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && gender && age && remainingPoints === 0 && selectedFeat && currentClassDef && currentRaceDef) {
            // Merge Base Stats with Class & Race Bonuses
            const finalStats = { ...stats };
            
            if (currentClassDef.statBonuses) {
                (Object.keys(currentClassDef.statBonuses) as Array<keyof BaseStats>).forEach((key) => {
                    finalStats[key] = (finalStats[key] || 0) + (currentClassDef.statBonuses[key] || 0);
                });
            }
            if (currentRaceDef.statBonuses) {
                (Object.keys(currentRaceDef.statBonuses) as Array<keyof BaseStats>).forEach((key) => {
                    finalStats[key] = (finalStats[key] || 0) + (currentRaceDef.statBonuses[key] || 0);
                });
            }

            createCharacter(name, gender, Number(age), race, charClass, finalStats, selectedFeat);
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

    if (isLoading || !currentClassDef || !currentRaceDef || !selectedFeat) {
        return (
            <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
                <div className="text-amber-500 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="font-display tracking-widest">Summoning Archives...</p>
                </div>
            </div>
        );
    }

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-in fade-in duration-500">
            <div className="bg-[#1c1917] border border-[#44403c] p-1 rounded-lg shadow-[0_0_100px_rgba(251,191,36,0.1)] max-w-2xl w-full relative overflow-hidden flex flex-col h-[80vh] animate-float">
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-amber-900/20 to-transparent pointer-events-none animate-torch" aria-hidden="true" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-amber-900/20 to-transparent pointer-events-none animate-torch" aria-hidden="true" />

                <div className="p-8 border border-[#292524] rounded h-full relative z-10 flex flex-col">

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="flex justify-center items-center gap-2 mb-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} aria-label="Creation Progress">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)]' : 'bg-[#292524]'}`} />
                            ))}
                        </div>
                        <h2 id="modal-title" className="text-3xl font-display text-shimmer">
                            {step === 1 && "Identity & Origin"}
                            {step === 2 && "Ability Scores"}
                            {step === 3 && "Feats & Talents"}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">

                        <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                            {/* STEP 1: IDENTITY */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="char-name" className="block text-amber-500/80 mb-2 font-display tracking-widest text-xs uppercase">Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-3 text-stone-600 w-5 h-5 group-focus-within:text-amber-500 transition-colors" aria-hidden="true" />
                                            <input
                                                id="char-name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-[#0c0a09] border border-[#292524] text-stone-200 rounded p-2 pl-10 pr-12 focus:outline-none focus:border-amber-700/50 transition-all font-serif text-lg placeholder-stone-700 focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                                placeholder="Enter thy name..."
                                                required
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRandomizeName}
                                                className="absolute right-2 top-2 p-1 text-stone-500 hover:text-amber-500 transition-colors rounded hover:bg-stone-800"
                                                title="Randomize Name"
                                            >
                                                <Dices className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Gender & Age */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="char-gender" className="block text-amber-500/80 mb-2 font-display tracking-widest text-xs uppercase">Gender / Identity</label>
                                            <input
                                                id="char-gender"
                                                type="text"
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full bg-[#0c0a09] border border-[#292524] text-stone-200 rounded p-3 focus:outline-none focus:border-amber-700/50 transition-all font-serif placeholder-stone-700"
                                                placeholder="Male, Female, Non-binary..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="char-age" className="block text-amber-500/80 mb-2 font-display tracking-widest text-xs uppercase">Age</label>
                                            <input
                                                id="char-age"
                                                type="number"
                                                min="1"
                                                max="999"
                                                value={age}
                                                onChange={(e) => setAge(parseInt(e.target.value))}
                                                className="w-full bg-[#0c0a09] border border-[#292524] text-stone-200 rounded p-3 focus:outline-none focus:border-amber-700/50 transition-all font-serif placeholder-stone-700"
                                                placeholder="Years"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Race & Class */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="char-race" className="block text-amber-500/80 mb-2 font-display tracking-widest text-xs uppercase">Race</label>
                                            <div className="relative">
                                                <select
                                                    id="char-race"
                                                    value={race}
                                                    onChange={(e) => setRace(e.target.value)}
                                                    className="w-full bg-[#0c0a09] border border-[#292524] text-stone-200 rounded p-3 focus:outline-none focus:border-amber-700/50 transition-all font-serif appearance-none cursor-pointer hover:border-amber-900/50"
                                                >
                                                    {Object.keys(raceDefinitions).map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-3 pointer-events-none text-stone-500" aria-hidden="true">▼</div>
                                            </div>
                                            <p className="text-[10px] text-stone-500 mt-1 italic">{currentRaceDef.description}</p>
                                        </div>

                                        <div>
                                            <label htmlFor="char-class" className="block text-amber-500/80 mb-2 font-display tracking-widest text-xs uppercase">Class</label>
                                            <div className="relative">
                                                <select
                                                    id="char-class"
                                                    value={charClass}
                                                    onChange={(e) => setCharClass(e.target.value)}
                                                    className="w-full bg-[#0c0a09] border border-[#292524] text-stone-200 rounded p-3 focus:outline-none focus:border-amber-700/50 transition-all font-serif appearance-none cursor-pointer hover:border-amber-900/50"
                                                >
                                                    {Object.keys(classDefinitions).map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-3 pointer-events-none text-stone-500" aria-hidden="true">▼</div>
                                            </div>
                                            <p className="text-[10px] text-stone-500 mt-1 italic">{currentClassDef.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#0c0a09]/50 p-4 rounded border border-[#292524] text-sm animate-in zoom-in-95 duration-300">
                                        <h4 className="text-amber-500 font-display mb-2 border-b border-[#292524] pb-1">Combined Traits</h4>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {currentRaceDef.traits.map((trait, i) => (
                                                <span key={i} className="text-[10px] bg-stone-900 border border-stone-800 px-1.5 py-0.5 rounded text-stone-300">{trait}</span>
                                            ))}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-stone-500 uppercase">Hit Die:</span>
                                                <span className="text-stone-300 font-mono">d{currentClassDef.hitDie}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-stone-500 uppercase">Speed:</span>
                                                <span className="text-stone-300 font-mono">{currentRaceDef.speed} ft</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: STATS */}
                            {step === 2 && (
                                <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
                                    <div className="bg-amber-900/10 p-3 rounded border border-amber-900/30 text-center mb-2 animate-pulse-amber">
                                        <span className={`font-mono text-xl font-bold ${remainingPoints === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {remainingPoints}
                                        </span>
                                        <span className="text-stone-500 text-xs uppercase tracking-widest block">Points Remaining</span>
                                    </div>

                                    <div className="space-y-2">
                                        {statConfig.map((stat) => {
                                            // Calculate bonuses
                                            const classBonus = currentClassDef.statBonuses[stat.key as keyof BaseStats] || 0;
                                            const raceBonus = currentRaceDef.statBonuses[stat.key as keyof BaseStats] || 0;
                                            const totalBonus = classBonus + raceBonus;
                                            
                                            const total = stats[stat.key as keyof BaseStats] + totalBonus;
                                            const modifier = getModifier(total);
                                            const modString = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                                            const modColor = modifier > 0 ? 'text-emerald-400' : modifier < 0 ? 'text-red-400' : 'text-stone-500';
                                            const modBg = modifier > 0 ? 'bg-emerald-950/30 border-emerald-900/50' : modifier < 0 ? 'bg-red-950/30 border-red-900/50' : 'bg-[#1c1917] border-[#292524]';

                                            return (
                                                <div key={stat.key} className="flex items-center justify-between p-2 rounded hover:bg-[#292524]/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`${stat.bg} p-1.5 rounded border ${stat.border}`}>
                                                            <stat.icon className={`w-4 h-4 ${stat.color}`} aria-hidden="true" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-stone-300 font-serif" id={`label-${stat.key}`}>{stat.label}</span>
                                                            {totalBonus > 0 && <span className="text-[10px] text-emerald-500">+{totalBonus} Bonus</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => decrement(stat.key as keyof BaseStats)}
                                                            className="w-8 h-8 rounded hover:bg-[#292524] text-stone-500 hover:text-stone-300 flex items-center justify-center border border-transparent hover:border-[#292524] transition-all disabled:opacity-20"
                                                            disabled={stats[stat.key as keyof BaseStats] <= 10}
                                                            aria-label={`Decrease ${stat.label}`}
                                                        >
                                                            -
                                                        </button>
                                                        <div className="flex flex-col items-center w-12">
                                                            <span className="text-stone-100 font-mono text-lg" aria-labelledby={`label-${stat.key}`}>{total}</span>
                                                            <div className={`text-[10px] font-mono px-1.5 rounded border ${modBg} ${modColor} transition-colors`}>
                                                                {modString}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => increment(stat.key as keyof BaseStats)}
                                                            className="w-8 h-8 rounded hover:bg-[#292524] text-stone-500 hover:text-stone-300 flex items-center justify-center border border-transparent hover:border-[#292524] transition-all disabled:opacity-20"
                                                            disabled={remainingPoints <= 0 || stats[stat.key as keyof BaseStats] >= 18}
                                                            aria-label={`Increase ${stat.label}`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: FEATS */}
                            {step === 3 && (
                                <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
                                    <div className="text-center text-stone-400 text-sm mb-4">
                                        Choose a special feat to distinguish your hero.
                                    </div>
                                    <div role="radiogroup" aria-label="Select a Feat" className="grid grid-cols-1 gap-3 max-h-[400px]">
                                        {featOptions.map((feat) => (
                                            <div
                                                key={feat.name}
                                                role="radio"
                                                aria-checked={selectedFeat?.name === feat.name}
                                                tabIndex={0}
                                                onClick={() => setSelectedFeat(feat)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedFeat(feat) }}
                                                className={`p-3 rounded cursor-pointer border transition-all duration-200 flex items-start gap-3 outline-none focus:ring-1 focus:ring-amber-500
                                            ${selectedFeat?.name === feat.name
                                                        ? 'bg-amber-900/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                                        : 'bg-[#0c0a09] border-[#292524] hover:border-stone-600'}
                                        `}
                                            >
                                                <div className={`mt-1 p-1 rounded-full ${selectedFeat?.name === feat.name ? 'text-amber-500' : 'text-stone-600'}`}>
                                                    {selectedFeat?.name === feat.name ? <Check className="w-4 h-4" aria-hidden="true" /> : <Star className="w-4 h-4" aria-hidden="true" />}
                                                </div>
                                                <div>
                                                    <h4 className={`font-display font-bold ${selectedFeat?.name === feat.name ? 'text-amber-100' : 'text-stone-300'}`}>{feat.name}</h4>
                                                    <p className="text-xs text-stone-400 italic mb-1">{feat.description}</p>
                                                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-wider">{feat.effect}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-6 pt-4 border-t border-[#292524] flex justify-between gap-4">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-2 rounded text-stone-400 hover:text-stone-200 border border-transparent hover:border-[#292524] flex items-center gap-2 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
                                </button>
                            ) : (
                                <div /> // Spacer
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (step === 1 && name && gender && age) setStep(2);
                                        if (step === 2 && remainingPoints === 0) setStep(3);
                                    }}
                                    disabled={(step === 1 && (!name || !gender || !age)) || (step === 2 && remainingPoints !== 0)}
                                    className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-stone-100 font-display font-bold rounded shadow-lg flex items-center gap-2 transition-all hover:scale-105 animate-pulse-amber"
                                >
                                    <BookOpen className="w-4 h-4" aria-hidden="true" /> Begin Adventure
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreator;