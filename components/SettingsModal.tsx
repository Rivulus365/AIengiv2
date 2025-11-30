import React from 'react';
import { Save, Trash2, X, AlertTriangle, Volume2, VolumeX, Image as ImageIcon, ImageOff, Gauge, Zap } from 'lucide-react';
import { ImageSize } from '../types';
import { useGameStore } from '../store/gameStore';

interface SettingsModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, isOpen }) => {
  // Store Selectors
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const setSoundEnabled = useGameStore(state => state.setSoundEnabled);
  const imageGenEnabled = useGameStore(state => state.imageGenEnabled);
  const setImageGenEnabled = useGameStore(state => state.setImageGenEnabled);
  const imageQuality = useGameStore(state => state.imageSize);
  const setImageQuality = useGameStore(state => state.setImageSize);
  const textSpeed = useGameStore(state => state.textSpeed);
  const setTextSpeed = useGameStore(state => state.setTextSpeed);
  const manualSave = useGameStore(state => state.manualSave);
  const resetCampaign = useGameStore(state => state.resetCampaign);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
      <div className="bg-[#1c1917] border border-[#44403c] p-6 rounded-lg shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200">
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-stone-500 hover:text-stone-300 transition-colors"
        >
            <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-display text-amber-500 border-b border-[#292524] pb-2 mb-6 text-center tracking-wide">
            System Menu
        </h2>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            
            {/* Preferences Section */}
            <div className="space-y-3 mb-6">
                <div className="text-[10px] uppercase tracking-widest text-stone-600 font-bold mb-2">Audio & Visuals</div>
                
                {/* Audio Toggle */}
                <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="w-full flex items-center justify-between p-3 bg-[#0c0a09] border border-[#292524] rounded text-stone-300 hover:border-amber-900/30 transition-all"
                >
                    <div className="flex items-center gap-3">
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-stone-600" />}
                        <span className="text-sm">Audio Effects</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${soundEnabled ? 'bg-emerald-900/50' : 'bg-stone-800'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${soundEnabled ? 'left-4.5 bg-emerald-400' : 'left-0.5 bg-stone-500'}`} style={{ left: soundEnabled ? '1.125rem' : '0.125rem' }}></div>
                    </div>
                </button>

                {/* Image Gen Toggle */}
                <button 
                    onClick={() => setImageGenEnabled(!imageGenEnabled)}
                    className="w-full flex items-center justify-between p-3 bg-[#0c0a09] border border-[#292524] rounded text-stone-300 hover:border-amber-900/30 transition-all"
                >
                    <div className="flex items-center gap-3">
                        {imageGenEnabled ? <ImageIcon className="w-4 h-4 text-blue-500" /> : <ImageOff className="w-4 h-4 text-stone-600" />}
                        <span className="text-sm">Scene Generation</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${imageGenEnabled ? 'bg-blue-900/50' : 'bg-stone-800'}`}>
                         <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${imageGenEnabled ? 'left-4.5 bg-blue-400' : 'left-0.5 bg-stone-500'}`} style={{ left: imageGenEnabled ? '1.125rem' : '0.125rem' }}></div>
                    </div>
                </button>

                {/* Image Quality Select */}
                {imageGenEnabled && (
                    <div className="p-3 bg-[#0c0a09] border border-[#292524] rounded text-stone-300">
                        <div className="flex items-center gap-2 mb-2 text-xs text-stone-500 uppercase tracking-widest">
                            <Gauge className="w-3 h-3" /> Image Quality
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[ImageSize.Size_1K, ImageSize.Size_2K, ImageSize.Size_4K].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setImageQuality(size)}
                                    className={`text-xs py-1 rounded border ${imageQuality === size ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'border-[#292524] hover:bg-[#1c1917]'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                 {/* Text Speed Select */}
                 <div className="p-3 bg-[#0c0a09] border border-[#292524] rounded text-stone-300">
                    <div className="flex items-center gap-2 mb-2 text-xs text-stone-500 uppercase tracking-widest">
                        <Zap className="w-3 h-3" /> Text Speed
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {(['normal', 'fast', 'instant'] as const).map((speed) => (
                            <button
                                key={speed}
                                onClick={() => setTextSpeed(speed)}
                                className={`text-xs py-1 rounded border capitalize ${textSpeed === speed ? 'bg-amber-900/20 border-amber-500 text-amber-400' : 'border-[#292524] hover:bg-[#1c1917]'}`}
                            >
                                {speed}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Game Data Section */}
            <div className="text-[10px] uppercase tracking-widest text-stone-600 font-bold mb-2">Data Management</div>
            
            <button
                onClick={() => {
                    manualSave();
                    onClose();
                }}
                className="w-full flex items-center justify-center gap-3 p-4 bg-[#0c0a09] border border-[#292524] rounded text-stone-300 hover:border-emerald-700/50 hover:text-emerald-400 hover:bg-emerald-950/10 transition-all group"
            >
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                    <div className="font-bold text-sm uppercase tracking-wider">Save Game</div>
                    <div className="text-[10px] text-stone-600 group-hover:text-emerald-400/60">Manually persist your progress</div>
                </div>
            </button>

            <button
                onClick={() => {
                    if (window.confirm("Are you sure? This will delete your character and all progress permanently.")) {
                        resetCampaign();
                        onClose();
                    }
                }}
                className="w-full flex items-center justify-center gap-3 p-4 bg-[#1a0f0f] border border-red-900/20 rounded text-red-400/80 hover:border-red-600/50 hover:text-red-400 hover:bg-red-950/30 transition-all group"
            >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                    <div className="font-bold text-sm uppercase tracking-wider">Reset Campaign</div>
                    <div className="text-[10px] text-red-500/40 group-hover:text-red-400/60">Permanently delete save data</div>
                </div>
            </button>
            
            <div className="mt-4 p-3 bg-amber-900/10 border border-amber-900/20 rounded text-[10px] text-amber-500/60 flex gap-2 items-start">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                <p>The game automatically saves after every turn.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;