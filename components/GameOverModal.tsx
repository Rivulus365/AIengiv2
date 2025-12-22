
import React, { useState } from 'react';
import { Skull, RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import Button from './design-system/Button';

interface GameOverModalProps {
  isOpen: boolean;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen }) => {
  const respawn = useGameStore(state => state.respawn);
  const resetCampaign = useGameStore(state => state.resetCampaign);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-1000">
      {showConfirm ? (
         <div className="bg-[#1c1917] border border-red-900/50 p-8 rounded-xl max-w-sm w-full text-center space-y-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto border border-red-900/50">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-stone-100 uppercase tracking-wide">Delete Campaign?</h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                    This action is permanent. Your character, items, and story progress will be lost forever.
                </p>
            </div>
            <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button variant="danger" className="flex-1" onClick={resetCampaign}>Confirm</Button>
            </div>
        </div>
      ) : (
      <div className="text-center space-y-8 p-8 max-w-lg w-full">
        <Skull className="w-24 h-24 text-red-900 mx-auto animate-pulse" />
        
        <h1 className="text-6xl font-display font-bold text-red-800 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(153,27,27,0.8)] animate-in zoom-in duration-500">
            You Died
        </h1>
        
        <p className="text-stone-500 font-serif italic text-lg">
            The adventure ends here... or does it?
        </p>

        <div className="flex flex-col gap-4 pt-8 w-full">
            <button 
                onClick={() => respawn()}
                className="group relative w-full py-4 bg-[#1a0f0f] border border-red-900/30 hover:border-red-600 hover:bg-red-950/30 text-red-500/80 hover:text-red-400 font-display tracking-widest uppercase transition-all"
            >
                <div className="flex items-center justify-center gap-3">
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Rise Again (Respawn)</span>
                </div>
                <div className="text-[10px] text-red-900 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Return to safety with 50% HP</div>
            </button>

            <button 
                onClick={() => setShowConfirm(true)}
                className="group w-full py-4 bg-transparent border border-stone-800 hover:border-stone-600 text-stone-600 hover:text-stone-300 font-display tracking-widest uppercase transition-all"
            >
                <div className="flex items-center justify-center gap-3">
                    <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform" />
                    <span>Begin Anew</span>
                </div>
            </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default GameOverModal;
