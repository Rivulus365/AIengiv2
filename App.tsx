
import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { authService } from './services/auth';
import { audioService } from './services/audio';
import { Menu, X, Settings, LogOut, Loader2, ShoppingCart } from 'lucide-react';
import { useGameStore } from './store/gameStore';
import { useUIStore } from './store/uiStore';
import { useSettingsStore } from './store/settingsStore';
import ToastContainer from './components/ToastContainer';
import { NoiseTexture } from './components/VisualAssets';
import ConsentManager from './components/ConsentManager';
import MerchantModal from './components/MerchantModal';

const CharacterCreator = lazy(() => import('./components/CharacterCreator'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const GameStateSidebar = lazy(() => import('./components/GameStateSidebar'));
const LevelUpModal = lazy(() => import('./components/LevelUpModal'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const GameOverModal = lazy(() => import('./components/GameOverModal'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const CharacterSheetModal = lazy(() => import('./components/CharacterSheetModal'));

const LoadingScreen = () => (
    <div role="status" aria-label="Loading Game" className="h-screen bg-[#050404] flex items-center justify-center text-stone-500 font-serif animate-fade-in relative overflow-hidden">
        <NoiseTexture className="opacity-10" />
        <div className="flex flex-col items-center gap-6 z-10">
            <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 animate-pulse"></div>
                <Loader2 className="w-12 h-12 animate-spin text-amber-600 relative z-10" />
            </div>
            <span className="tracking-[0.3em] uppercase text-xs font-display text-amber-500/50">Initializing Realm...</span>
        </div>
    </div>
);

const App: React.FC = () => {
    const user = useGameStore(state => state.user);
    const setUser = useGameStore(state => state.setUser);
    const isCharacterCreated = useGameStore(state => state.isCharacterCreated);
    const gameState = useGameStore(state => state.gameState);
    const isGameLoaded = useGameStore(state => state.isGameLoaded);
    
    // UI State
    const isCharacterSheetOpen = useUIStore(state => state.isCharacterSheetOpen);
    const setToggleCharacterSheet = useUIStore(state => state.setToggleCharacterSheet);
    
    // Settings State
    const soundEnabled = useSettingsStore(state => state.soundEnabled);
    
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showMerchant, setShowMerchant] = useState(false);
    const [screenShake, setScreenShake] = useState(false);
    const prevHpRef = useRef(gameState.player.hp.current);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange(async (currentUser) => {
            await setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [setUser]);

    useEffect(() => {
        if (gameState.player.hp.current < prevHpRef.current) {
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 500);
        }
        prevHpRef.current = gameState.player.hp.current;
    }, [gameState.player.hp.current]);

    const isDead = isGameLoaded && isCharacterCreated && gameState.player.hp.current <= 0;
    const isInSettlement = gameState.worldState.location.toLowerCase().match(/(town|village|city|tavern|outpost|camp|market)/);

    useEffect(() => {
        if (!user || !isCharacterCreated) return;
        audioService.setSoundEnabled(soundEnabled);
        if (soundEnabled) {
            audioService.resume();
            audioService.updateAmbientBasedOnLocation(gameState.worldState.location);
        }
    }, [gameState.worldState.location, soundEnabled, isCharacterCreated, user]);

    if (loadingAuth) return <LoadingScreen />;
    if (!user) return <Suspense fallback={<LoadingScreen />}><LandingPage /></Suspense>;

    return (
        <div className={`relative h-[100dvh] w-full bg-[#050404] text-[#e7e5e4] overflow-hidden flex flex-col ${screenShake ? 'animate-shake' : ''}`}>
            <div className="absolute inset-0 z-0 pointer-events-none">
                <NoiseTexture className="opacity-[0.03]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
                <div className={`absolute inset-0 transition-opacity duration-300 ${screenShake ? 'opacity-100' : 'opacity-0'} bg-[radial-gradient(circle_at_center,transparent_0%,rgba(153,27,27,0.4)_100%)] mix-blend-overlay`}></div>
            </div>

            <header className="relative z-50 h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <div className="md:hidden">
                    <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 text-stone-400 hover:text-amber-500 transition-colors">
                        {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex items-center gap-3 select-none opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
                    <span className="font-display font-bold tracking-widest text-sm md:text-base text-stone-200">
                        INFINITE <span className="text-amber-600">ADVENTURE</span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {isInSettlement && (
                        <button 
                            onClick={() => setShowMerchant(true)}
                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/20 border border-amber-500/30 text-xs text-amber-500 hover:bg-amber-900/40 transition-all animate-pulse"
                        >
                            <ShoppingCart className="w-3 h-3" /> Visit Merchant
                        </button>
                    )}
                    <button onClick={() => setShowSettings(true)} className="text-stone-500 hover:text-amber-500 transition-colors"><Settings className="w-4 h-4" /></button>
                    <button onClick={() => authService.logout()} className="text-stone-500 hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></button>
                </div>
                
                <div className="md:hidden flex items-center gap-2">
                    {isInSettlement && <button onClick={() => setShowMerchant(true)} className="p-2 text-amber-500"><ShoppingCart className="w-5 h-5" /></button>}
                    <button onClick={() => setShowSettings(true)} className="p-2 text-stone-400"><Settings className="w-5 h-5" /></button>
                </div>
            </header>

            <main className="relative z-40 flex-1 flex overflow-hidden">
                <div className="flex-1 relative flex flex-col min-w-0 bg-transparent">
                    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-stone-700"/></div>}>
                        <ChatInterface />
                    </Suspense>
                </div>

                <aside className={`fixed inset-y-0 right-0 w-80 md:w-96 bg-[#0c0a09]/95 md:bg-black/40 backdrop-blur-xl border-l border-white/5 transform transition-transform duration-300 ease-out z-50 md:relative md:transform-none md:z-auto ${showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                    <Suspense fallback={<div className="p-8 text-center text-stone-600 text-xs">Loading HUD...</div>}>
                        <GameStateSidebar />
                    </Suspense>
                    <button onClick={() => setShowSidebar(false)} className="md:hidden absolute top-4 right-4 p-2 bg-stone-900 rounded-full border border-stone-800 text-stone-400"><X className="w-4 h-4" /></button>
                </aside>
                {showSidebar && <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setShowSidebar(false)} />}
            </main>

            <Suspense fallback={null}>
                {showSettings && <SettingsModal isOpen={true} onClose={() => setShowSettings(false)} />}
                {isDead && <GameOverModal isOpen={true} />}
                {!isCharacterCreated && isGameLoaded && <CharacterCreator />}
                {isCharacterCreated && gameState.player.unspentStatPoints > 0 && <LevelUpModal />}
                {showMerchant && <MerchantModal isOpen={true} onClose={() => setShowMerchant(false)} />}
                <CharacterSheetModal isOpen={isCharacterSheetOpen} onClose={() => setToggleCharacterSheet(false)} />
            </Suspense>

            <ConsentManager />
            <ToastContainer />
        </div>
    );
};

export default App;
