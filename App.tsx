import React, { useState, useEffect, Suspense, lazy } from 'react';
import { User, authService } from './services/auth';
import { audioService } from './services/audio';
import { Menu, X, Settings, AlertOctagon, LogOut, Loader2 } from 'lucide-react';
import { useGameStore } from './store/gameStore';

// --- Lazy Load Components for Performance ---
const CharacterCreator = lazy(() => import('./components/CharacterCreator'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const GameStateSidebar = lazy(() => import('./components/GameStateSidebar'));
const LevelUpModal = lazy(() => import('./components/LevelUpModal'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const GameOverModal = lazy(() => import('./components/GameOverModal'));
const LandingPage = lazy(() => import('./components/LandingPage'));

const LoadingScreen = () => (
    <div className="h-screen bg-[#0c0a09] flex items-center justify-center text-stone-500 font-serif animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="tracking-widest uppercase text-xs">Loading Realm...</span>
        </div>
    </div>
);

const App: React.FC = () => {
    // --- Store Selectors ---
    const user = useGameStore(state => state.user);
    const setUser = useGameStore(state => state.setUser);
    const isCharacterCreated = useGameStore(state => state.isCharacterCreated);
    const gameState = useGameStore(state => state.gameState);
    const soundEnabled = useGameStore(state => state.soundEnabled);
    const isGameLoaded = useGameStore(state => state.isGameLoaded);
    
    // Auth loading state local to App logic
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        // Subscribe to Auth state
        const unsubscribe = authService.onAuthStateChange(async (currentUser) => {
            await setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [setUser]);

    // --- UI State ---
    const [showSidebar, setShowSidebar] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // --- Game Logic Triggers ---
    // Only check for death if game is fully loaded and character exists to prevent flash of modal
    const isDead = isGameLoaded && isCharacterCreated && gameState.player.hp.current <= 0;

    // --- Audio Logic ---
    useEffect(() => {
        if (!user || !isCharacterCreated) {
            audioService.setMute(true);
            return;
        }

        audioService.setMute(!soundEnabled);
        if (soundEnabled) {
            audioService.updateAmbientBasedOnLocation(gameState.worldState.location);
        }
    }, [gameState.worldState.location, soundEnabled, isCharacterCreated, user]);

    const handleLogout = () => {
        authService.logout();
        audioService.setMute(true);
    };

    // --- Render ---
    if (loadingAuth) return <LoadingScreen />;
    
    // Unauthenticated View
    if (!user) {
        return (
            <Suspense fallback={<LoadingScreen />}>
                <LandingPage />
            </Suspense>
        );
    }

    // Authenticated Game View
    return (
        <div className="flex h-[100dvh] w-full bg-[#0c0a09] overflow-hidden text-[#e7e5e4]">
            {/* 1. System Alerts */}
            {!process.env.API_KEY && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-red-900/90 text-white text-center p-2 text-sm font-bold flex items-center justify-center gap-2" role="alert">
                    <AlertOctagon className="w-4 h-4" /> CRITICAL ERROR: No Gemini API Key Found.
                </div>
            )}

            {/* 2. Controls & Menus */}
            <div className="md:hidden fixed top-4 left-4 z-50 flex gap-2">
                <button onClick={() => setShowSidebar(!showSidebar)} className="bg-[#292524] p-2 rounded text-amber-500 shadow-lg border border-[#44403c]" aria-label="Menu">
                    {showSidebar ? <X /> : <Menu />}
                </button>
                <button onClick={() => setShowSettings(true)} className="bg-[#292524] p-2 rounded text-stone-400 shadow-lg border border-[#44403c]" aria-label="Settings">
                    <Settings className="w-6 h-6" />
                </button>
            </div>

            <div className="hidden md:flex absolute top-4 right-4 z-50 gap-2">
                <div className="flex items-center gap-2 bg-[#1c1917]/80 px-3 rounded-full border border-[#292524] text-xs text-stone-500 mr-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    {user.email}
                </div>
                <button onClick={() => setShowSettings(true)} className="bg-[#1c1917]/90 p-2 rounded-full text-stone-500 hover:text-amber-500 hover:rotate-90 transition-all shadow-lg border border-[#292524]" title="Settings">
                    <Settings className="w-5 h-5" />
                </button>
                <button onClick={handleLogout} className="bg-[#1c1917]/90 p-2 rounded-full text-stone-500 hover:text-red-500 transition-all shadow-lg border border-[#292524]" title="Logout">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* 3. Modals & Overlays (Lazy Loaded) */}
            <Suspense fallback={null}>
                {showSettings && (
                    <SettingsModal isOpen={true} onClose={() => setShowSettings(false)} />
                )}

                {isDead && (
                    <GameOverModal isOpen={true} />
                )}

                {!isCharacterCreated && isGameLoaded && (
                    <CharacterCreator />
                )}

                {isCharacterCreated && gameState.player.unspentStatPoints > 0 && (
                    <LevelUpModal />
                )}
            </Suspense>

            {/* 4. Main Game Layout */}
            <div className="flex-1 h-full relative flex">
                <div className="flex-1 h-full w-full">
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-stone-700"/></div>}>
                        <ChatInterface />
                    </Suspense>
                </div>

                <aside
                    className={`fixed inset-y-0 right-0 w-80 bg-[#1c1917] transform transition-transform duration-300 ease-in-out z-40 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-l border-[#292524] md:relative md:transform-none md:translate-x-0 ${showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
                    aria-hidden={!showSidebar && window.innerWidth < 768}
                >
                    <Suspense fallback={<div className="p-4 text-xs text-stone-600 text-center uppercase tracking-widest">Loading Archives...</div>}>
                        <GameStateSidebar />
                    </Suspense>
                </aside>

                {showSidebar && <div className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-sm" onClick={() => setShowSidebar(false)} />}
            </div>
        </div>
    );
};

export default App;