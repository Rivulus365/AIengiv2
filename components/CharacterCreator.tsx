import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASS_DEFINITIONS, RACE_DEFINITIONS, FEAT_OPTIONS, BACKGROUND_DEFINITIONS } from '../constants';
import { BaseStats, Feat, CharacterCreationData } from '../types';
import { calculateStatCost } from '../utils/engine';
import { generateFantasyName } from '../utils/nameGenerator';
import { Sword, Shield, Scroll, User, Dices, ChevronRight, ChevronLeft, Sparkles, BookOpen, Crown } from 'lucide-react';
import Button from './design-system/Button';

const STAT_NAMES: (keyof BaseStats)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const DEFAULT_STATS: BaseStats = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };

const CharacterCreator: React.FC = () => {
    const createCharacter = useGameStore(state => state.createCharacter);
    const [step, setStep] = useState(1);
    
    // Character Data State
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState(25);
    const [race, setRace] = useState('Human');
    const [charClass, setCharClass] = useState('Warrior');
    const [subclass, setSubclass] = useState('');
    const [background, setBackground] = useState('Acolyte');
    const [stats, setStats] = useState<BaseStats>({ ...DEFAULT_STATS });
    const [pointsRemaining, setPointsRemaining] = useState(27);
    const [selectedFeat, setSelectedFeat] = useState<Feat>(FEAT_OPTIONS[0]);

    const handleGenerateName = () => setName(generateFantasyName(race, gender));

    const handleStatChange = (stat: keyof BaseStats, increment: boolean) => {
        const currentVal = stats[stat];
        const nextVal = increment ? currentVal + 1 : currentVal - 1;
        
        if (increment) {
            if (currentVal >= 15) return;
            const costDiff = calculateStatCost(nextVal) - calculateStatCost(currentVal);
            if (pointsRemaining >= costDiff) {
                setStats(prev => ({ ...prev, [stat]: nextVal }));
                setPointsRemaining(prev => prev - costDiff);
            }
        } else {
            if (currentVal <= 8) return;
            const costDiff = calculateStatCost(currentVal) - calculateStatCost(nextVal);
            setStats(prev => ({ ...prev, [stat]: nextVal }));
            setPointsRemaining(prev => prev + costDiff);
        }
    };

    const handleSubmit = () => {
        if (!name || !gender || !charClass || !race || !background) return;
        createCharacter({ name, gender, age, race, charClass, stats, feat: selectedFeat, subclass, background });
    };

    const steps = [
        { id: 1, title: "Identity", icon: User },
        { id: 2, title: "Lineage", icon: Crown },
        { id: 3, title: "Class", icon: Sword },
        { id: 4, title: "Background", icon: BookOpen },
        { id: 5, title: "Stats", icon: Dices },
        { id: 6, title: "Feat", icon: Sparkles },
    ];

    const selectedClassDef = CLASS_DEFINITIONS[charClass];
    const subclasses = useMemo(() => selectedClassDef.subclasses ? Object.values(selectedClassDef.subclasses) : [], [selectedClassDef]);

    useEffect(() => {
        if (subclasses.length > 0 && (!subclass || !subclasses.find(s => s.name === subclass))) {
            setSubclass(subclasses[0].name);
        } else if (subclasses.length === 0) {
            setSubclass('');
        }
    }, [charClass, subclasses, subclass]);

    const progress = (step / steps.length) * 100;

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.05)_0%,transparent_70%)] pointer-events-none"></div>

            <div className="relative w-full max-w-5xl h-full max-h-[85dvh] flex flex-col md:flex-row glass-panel rounded-2xl overflow-hidden shadow-2xl animate-scale-in border border-white/10">
                
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col shrink-0">
                    <h2 className="text-2xl font-display font-bold text-stone-100 mb-2">Creation</h2>
                    <p className="text-xs text-stone-500 mb-8">Forge your legend.</p>
                    
                    <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar md:block hidden">
                        {steps.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => step > s.id && setStep(s.id)}
                                disabled={step < s.id}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all text-left ${
                                    step === s.id 
                                    ? 'bg-amber-900/20 text-amber-400 border border-amber-900/30' 
                                    : step > s.id 
                                        ? 'text-emerald-500 hover:bg-white/5' 
                                        : 'text-stone-600 cursor-not-allowed'
                                }`}
                            >
                                <s.icon className="w-4 h-4" />
                                {s.title}
                                {step > s.id && <CheckIcon className="w-3 h-3 ml-auto" />}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Progress Bar */}
                    <div className="md:hidden w-full h-1 bg-stone-800 rounded-full mb-4">
                        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Main Content Area - Flex Column with proper overflow handling */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0c0a09]/50 overflow-hidden">
                    
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        {step === 1 && (
                            <div className="space-y-8 animate-fade-in">
                                <h3 className="text-3xl font-display text-stone-100">Who are you?</h3>
                                <div className="space-y-6 max-w-lg">
                                    <div>
                                        <label htmlFor="charName" className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-2 block">Character Name</label>
                                        <div className="flex gap-2">
                                            <input 
                                                id="charName"
                                                type="text" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="flex-1 bg-black/40 border border-stone-800 rounded-lg p-4 text-lg text-stone-200 focus:border-amber-600 focus:outline-none transition-colors placeholder-stone-700"
                                                placeholder="Enter a name..."
                                            />
                                            <button onClick={handleGenerateName} className="p-4 bg-stone-900 border border-stone-800 rounded-lg hover:text-amber-500 transition-colors" title="Randomize" aria-label="Generate Random Name">
                                                <Dices className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="charGender" className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-2 block">Gender</label>
                                            <select 
                                                id="charGender"
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full bg-black/40 border border-stone-800 rounded-lg p-4 text-stone-300 focus:border-amber-600 focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select...</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Non-Binary">Non-Binary</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="charAge" className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-2 block">Age</label>
                                            <input 
                                                id="charAge"
                                                type="number" 
                                                value={age}
                                                onChange={(e) => setAge(Number(e.target.value))}
                                                className="w-full bg-black/40 border border-stone-800 rounded-lg p-4 text-stone-300 focus:border-amber-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-3xl font-display text-stone-100">Choose your Ancestry</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Object.values(RACE_DEFINITIONS).map(r => (
                                        <button
                                            key={r.name}
                                            onClick={() => setRace(r.name)}
                                            className={`relative min-h-[140px] p-5 rounded-xl border text-left transition-all overflow-hidden group ${race === r.name ? 'bg-amber-900/20 border-amber-500/50 ring-1 ring-amber-500/20' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                                        >
                                            {/* Normal Content */}
                                            <div className="h-full flex flex-col transition-all duration-300 group-hover:opacity-0 group-hover:scale-95">
                                                <div className={`font-bold text-lg mb-2 ${race === r.name ? 'text-amber-200' : 'text-stone-300'}`}>{r.name}</div>
                                                <div className="text-xs text-stone-500 leading-relaxed line-clamp-4">{r.description}</div>
                                                
                                                {race === r.name && (
                                                    <div className="mt-auto pt-4">
                                                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> 
                                                            Selected
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-[#151413] p-5 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-105 group-hover:scale-100 z-10">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Traits</span>
                                                    <div className="text-xs text-stone-300 leading-snug">
                                                        {r.traits.join(", ")}
                                                    </div>
                                                </div>
                                                {r.statBonuses && (
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Bonuses</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {Object.entries(r.statBonuses).map(([s, v]) => (
                                                                <span key={s} className="px-1.5 py-0.5 bg-stone-800 rounded text-[10px] text-emerald-400 font-mono uppercase">{s} +{v}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-3xl font-display text-stone-100">Select your Path</h3>
                                
                                {/* Horizontal Class Scroller */}
                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mask-gradient">
                                    {Object.values(CLASS_DEFINITIONS).map(c => (
                                        <button
                                            key={c.name}
                                            onClick={() => setCharClass(c.name)}
                                            className={`px-6 py-3 rounded-lg border whitespace-nowrap font-bold transition-all ${charClass === c.name ? 'bg-amber-900/20 border-amber-500 text-amber-100' : 'bg-black/20 border-white/5 text-stone-500 hover:text-stone-300'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>

                                <div className="glass-panel p-6 rounded-xl space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xl font-display text-amber-500">{selectedClassDef.name}</h4>
                                            <span className="text-[10px] bg-stone-800 px-2 py-1 rounded text-stone-400 uppercase tracking-widest">Hit Die: d{selectedClassDef.hitDie}</span>
                                        </div>
                                        <p className="text-lg text-stone-300 font-serif italic">"{selectedClassDef.description}"</p>
                                    </div>
                                    
                                    <div className="h-px bg-white/5 w-full"></div>
                                    
                                    {subclasses.length > 0 && (
                                        <div>
                                            <label className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-3 block">Subclass Specialization</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {subclasses.map(s => (
                                                    <button
                                                        key={s.name}
                                                        onClick={() => setSubclass(s.name)}
                                                        className={`relative min-h-[140px] p-4 rounded-xl border text-left transition-all overflow-hidden group ${subclass === s.name ? 'bg-amber-950/40 border-amber-600/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                                                    >
                                                        {/* Normal View */}
                                                        <div className="h-full flex flex-col transition-all duration-300 group-hover:opacity-0 group-hover:scale-95">
                                                            <div className={`font-bold text-sm mb-1 ${subclass === s.name ? 'text-amber-200' : 'text-stone-300'}`}>{s.name}</div>
                                                            <div className="text-xs text-stone-500 leading-relaxed">{s.description}</div>
                                                            
                                                            {subclass === s.name && (
                                                                <div className="mt-auto pt-3">
                                                                    <span className="text-[9px] uppercase font-bold text-amber-500 tracking-widest flex items-center gap-2">
                                                                        <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></div> 
                                                                        Active
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Hover Overlay */}
                                                        <div className="absolute inset-0 bg-[#151413] p-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-105 group-hover:scale-100 z-10 justify-center">
                                                            {s.features && s.features.length > 0 && (
                                                                <div>
                                                                    <span className="text-[9px] uppercase font-bold text-stone-500 block mb-1">Features</span>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {s.features.map(f => (
                                                                            <span key={f} className="px-1.5 py-0.5 bg-stone-800 rounded text-[9px] text-stone-300 border border-white/5">{f}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {s.statBonuses && (
                                                                <div className="mt-1">
                                                                    <span className="text-[9px] uppercase font-bold text-stone-500 block mb-1">Bonuses</span>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {Object.entries(s.statBonuses).map(([stat, val]) => (
                                                                            <span key={stat} className="px-1.5 py-0.5 bg-stone-800 rounded text-[9px] text-emerald-400 font-mono uppercase">{stat} +{val}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-3xl font-display text-stone-100">Character Origin</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {Object.values(BACKGROUND_DEFINITIONS).map(bg => (
                                        <button
                                            key={bg.name}
                                            onClick={() => setBackground(bg.name)}
                                            className={`p-4 rounded-xl border text-left transition-all ${background === bg.name ? 'bg-amber-900/20 border-amber-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                                        >
                                            <div className={`font-bold ${background === bg.name ? 'text-amber-200' : 'text-stone-400'}`}>{bg.name}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="glass-panel p-4 rounded-xl">
                                    <div className="text-stone-300 mb-2">{BACKGROUND_DEFINITIONS[background]?.description}</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {BACKGROUND_DEFINITIONS[background]?.skillProficiencies.map(sk => (
                                            <span key={sk} className="px-2 py-1 rounded bg-stone-800 text-xs text-stone-300">{sk}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                                <div className="text-center space-y-1">
                                    <div className="text-5xl font-display font-bold text-amber-500 drop-shadow-glow">{pointsRemaining}</div>
                                    <div className="text-xs uppercase tracking-widest text-stone-500">Points Remaining</div>
                                </div>

                                <div className="space-y-3">
                                    {STAT_NAMES.map(stat => {
                                        const racial = RACE_DEFINITIONS[race]?.statBonuses[stat] || 0;
                                        const current = stats[stat];
                                        const total = current + racial;
                                        const costNext = calculateStatCost(current + 1) - calculateStatCost(current);
                                        const costPrev = calculateStatCost(current) - calculateStatCost(current - 1);

                                        return (
                                            <div key={stat} className="flex items-center gap-4 glass-panel p-3 rounded-xl">
                                                <div className="w-12 font-bold uppercase text-stone-400">{stat}</div>
                                                <div className="flex-1 h-2 bg-stone-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-stone-600" style={{ width: `${(total/20)*100}%` }}></div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => handleStatChange(stat, false)}
                                                        className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 flex items-center justify-center transition-colors disabled:opacity-30"
                                                        disabled={current <= 8}
                                                        aria-label={`Decrease ${stat}`}
                                                    >
                                                        -
                                                    </button>
                                                    <div className="w-8 text-center font-mono font-bold text-xl text-stone-200">{total}</div>
                                                    <button 
                                                        onClick={() => handleStatChange(stat, true)}
                                                        className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 flex items-center justify-center transition-colors disabled:opacity-30"
                                                        disabled={current >= 15 || pointsRemaining < costNext}
                                                        aria-label={`Increase ${stat}`}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-3xl font-display text-stone-100">Select a Feat</h3>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {FEAT_OPTIONS.map((feat, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedFeat(feat)}
                                            className={`w-full p-4 rounded-xl border text-left transition-all group ${selectedFeat.name === feat.name ? 'bg-amber-900/20 border-amber-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold ${selectedFeat.name === feat.name ? 'text-amber-200' : 'text-stone-300'}`}>{feat.name}</span>
                                                <span className="text-[10px] uppercase tracking-widest text-stone-600 bg-black/40 px-2 py-0.5 rounded">{feat.type}</span>
                                            </div>
                                            <div className="text-sm text-stone-500 group-hover:text-stone-400 transition-colors">{feat.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls - Fixed at bottom of flex column */}
                    <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur flex justify-between items-center shrink-0">
                        <Button 
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1}
                            variant="ghost"
                            leftIcon={<ChevronLeft className="w-4 h-4" />}
                        >
                            Back
                        </Button>

                        <div className="flex gap-2">
                            {steps.map(s => (
                                <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'bg-amber-500 w-4' : step > s.id ? 'bg-emerald-500' : 'bg-stone-800'}`}></div>
                            ))}
                        </div>

                        {step < 6 ? (
                            <Button 
                                onClick={() => setStep(Math.min(6, step + 1))}
                                disabled={step === 1 && (!name || !gender)}
                                variant="secondary"
                                rightIcon={<ChevronRight className="w-4 h-4" />}
                            >
                                Next Step
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit}
                                variant="primary"
                                leftIcon={<Sparkles className="w-4 h-4" />}
                            >
                                Begin Adventure
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

export default CharacterCreator;