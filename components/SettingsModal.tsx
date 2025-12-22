
import React, { useState } from 'react';
import { Save, Trash2, X, AlertTriangle, Volume2, VolumeX, Image as ImageIcon, ImageOff, Gauge, Zap, Type, Mic, Shield } from 'lucide-react';
import { ImageSize, FontSize } from '../types';
import { useGameStore } from '../store/gameStore';
import { audioService } from '../services/audio';
import Button from './design-system/Button';
import ConsentManager from './ConsentManager';

interface SettingsModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, isOpen }) => {
  // Store Selectors
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const setSoundEnabled = useGameStore(state => state.setSoundEnabled);
  const narratorEnabled = useGameStore(state => state.narratorEnabled);
  const setNarratorEnabled = useGameStore(state => state.setNarratorEnabled);
  const imageGenEnabled = useGameStore(state => state.imageGenEnabled);
  const setImageGenEnabled = useGameStore(state => state.setImageGenEnabled);
  const imageQuality = useGameStore(state => state.imageSize);
  const setImageQuality = useGameStore(state => state.setImageSize);
  const textSpeed = useGameStore(state => state.textSpeed);
  const setTextSpeed = useGameStore(state => state.setTextSpeed);
  const fontSize = useGameStore(state => state.fontSize);
  const setFontSize = useGameStore(state => state.setFontSize);
  const manualSave = useGameStore(state => state.manualSave);
  const resetCampaign = useGameStore(state => state.resetCampaign);

  const [showConsent, setShowConsent] = useState(false);
  
  // Confirmation State
  const [confirmation, setConfirmation] = useState<{
    type: 'save' | 'reset';
    title: string;
    description: string;
    action: () => void;
    variant: 'primary' | 'danger';
    icon: React.ElementType;
    confirmText: string;
  } | undefined>();

  const handleNarratorToggle = () => {
      const newState = !narratorEnabled;
      setNarratorEnabled(newState);
      if (newState) {
          // Prime audio context if enabling narrator
          audioService.resume();
      }
  };

  const handleSaveRequest = () => {
      audioService.playUiSound('click');
      setConfirmation({
          type: 'save',
          title: 'Save Progress?',
          description: 'This will overwrite your previous save file. Your legend continues from this point.',
          action: manualSave,
          variant: 'primary',
          icon: Save,
          confirmText: 'Save Game'
      });
  };

  const handleResetRequest = () => {
      audioService.playUiSound('click');
      setConfirmation({
          type: 'reset',
          title: 'Delete Campaign?',
          description: 'This action cannot be undone. Your character, items, and story progress will be permanently erased.',
          action: resetCampaign,
          variant: 'danger',
          icon: Trash2,
          confirmText: 'Delete Forever'
      });
  };

  const executeConfirmation = () => {
      audioService.playUiSound('click');
      if (confirmation) {
          confirmation.action();
          onClose();
          setConfirmation(undefined);
      }
  };

  const cancelConfirmation = () => {
      audioService.playUiSound('click');
      setConfirmation(undefined);
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
      <div className="bg-[#1c1917] border border-[#44403c] p-6 rounded-xl shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-stone-500 hover:text-stone-300 transition-colors z-10"
        >
            <X className="w-5 h-5" />
        </button>

        {confirmation ? (
            <div className="flex flex-col h-full items-center justify-center text-center space-y-6 py-4 animate-in slide-in-from-right-4 duration-300">
                <div className={`p-4 rounded-full ${confirmation.variant === 'danger' ? 'bg-red-900/20 text-red-500 border border-red-900/50' : 'bg-amber-900/20 text-amber-500 border border-amber-900/50'}`}>
                    <confirmation.icon className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold text-stone-100">{confirmation.title}</h3>
                    <p className="text-sm text-stone-400 leading-relaxed max-w-[260px] mx-auto">
                        {confirmation.description}
                    </p>
                </div>
                <div className="flex gap-3 w-full pt-2">
                    <Button 
                        variant="ghost" 
                        className="flex-1" 
                        onClick={cancelConfirmation}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant={confirmation.variant} 
                        className="flex-1" 
                        onClick={executeConfirmation}
                    >
                        {confirmation.confirmText}
                    </Button>
                </div>
            </div>
        ) : (
            <>
                <h2 className="text-xl font-display text-amber-500 border-b border-[#292524] pb-3 mb-4 text-center tracking-wide">
                    System Menu
                </h2>

                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1">
                    
                    {/* Preferences Section */}
                    <div className="space-y-3">
                        <div className="text-[10px] uppercase tracking-widest text-stone-600 font-bold mb-2">Audio & Visuals</div>
                        
                        {/* Audio Toggle */}
                        <button 
                            onClick={() => { audioService.playUiSound('click'); setSoundEnabled(!soundEnabled); }}
                            className="w-full flex items-center justify-between p-3 bg-[#0c0a09] border border-[#292524] rounded-lg text-stone-300 hover:border-amber-900/30 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-stone-600" />}
                                <span className="text-sm font-bold">Audio Effects</span>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${soundEnabled ? 'bg-emerald-900/50' : 'bg-stone-800'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${soundEnabled ? 'left-4.5 bg-emerald-400' : 'left-0.5 bg-stone-500'}`} style={{ left: soundEnabled ? '1.125rem' : '0.125rem' }}></div>
                            </div>
                        </button>

                        {/* Narrator Toggle */}
                        <button 
                            onClick={() => { audioService.playUiSound('click'); handleNarratorToggle(); }}
                            className="w-full flex items-center justify-between p-3 bg-[#0c0a09] border border-[#292524] rounded-lg text-stone-300 hover:border-amber-900/30 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Mic className={`w-4 h-4 ${narratorEnabled ? 'text-amber-500' : 'text-stone-600'}`} />
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-bold">AI Narrator</span>
                                    <span className="text-[9px] text-stone-500">Auto-read text</span>
                                </div>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${narratorEnabled ? 'bg-amber-900/50' : 'bg-stone-800'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${narratorEnabled ? 'left-4.5 bg-amber-400' : 'left-0.5 bg-stone-500'}`} style={{ left: narratorEnabled ? '1.125rem' : '0.125rem' }}></div>
                            </div>
                        </button>

                        {/* Image Gen Toggle */}
                        <button 
                            onClick={() => { audioService.playUiSound('click'); setImageGenEnabled(!imageGenEnabled); }}
                            className="w-full flex items-center justify-between p-3 bg-[#0c0a09] border border-[#292524] rounded-lg text-stone-300 hover:border-amber-900/30 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                {imageGenEnabled ? <ImageIcon className="w-4 h-4 text-blue-500" /> : <ImageOff className="w-4 h-4 text-stone-600" />}
                                <span className="text-sm font-bold">Scene Generation</span>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${imageGenEnabled ? 'bg-blue-900/50' : 'bg-stone-800'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${imageGenEnabled ? 'left-4.5 bg-blue-400' : 'left-0.5 bg-stone-500'}`} style={{ left: imageGenEnabled ? '1.125rem' : '0.125rem' }}></div>
                            </div>
                        </button>

                        {/* Image Quality Select */}
                        {imageGenEnabled && (
                            <div className="p-3 bg-[#0c0a09] border border-[#292524] rounded-lg text-stone-300">
                                <div className="flex items-center gap-2 mb-2 text-xs text-stone-500 uppercase tracking-widest font-bold">
                                    <Gauge className="w-3 h-3" /> Image Quality
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[ImageSize.Size_1K, ImageSize.Size_2K, ImageSize.Size_4K].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setImageQuality(size)}
                                            className={`text-xs py-1.5 rounded border transition-colors ${imageQuality === size ? 'bg-blue-900/20 border-blue-500 text-blue-400 font-bold' : 'border-[#292524] hover:bg-[#1c1917]'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Text Speed Select */}
                        <div className="p-3 bg-[#0c0a09] border border-[#292524] rounded-lg text-stone-300">
                            <div className="flex items-center gap-2 mb-2 text-xs text-stone-500 uppercase tracking-widest font-bold">
                                <Zap className="w-3 h-3" /> Text Speed
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['normal', 'fast', 'instant'] as const).map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => setTextSpeed(speed)}
                                        className={`text-xs py-1.5 rounded border capitalize transition-colors ${textSpeed === speed ? 'bg-amber-900/20 border-amber-500 text-amber-400 font-bold' : 'border-[#292524] hover:bg-[#1c1917]'}`}
                                    >
                                        {speed}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Size Select */}
                        <div className="p-3 bg-[#0c0a09] border border-[#292524] rounded-lg text-stone-300">
                            <div className="flex items-center gap-2 mb-2 text-xs text-stone-500 uppercase tracking-widest font-bold">
                                <Type className="w-3 h-3" /> Text Size
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(['small', 'medium', 'large'] as const).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setFontSize(size)}
                                        className={`text-xs py-1.5 rounded border capitalize transition-colors ${fontSize === size ? 'bg-amber-900/20 border-amber-500 text-amber-400 font-bold' : 'border-[#292524] hover:bg-[#1c1917]'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Game Data Section */}
                    <div className="space-y-4">
                        <div className="text-[10px] uppercase tracking-widest text-stone-600 font-bold mb-1">Data & Privacy</div>
                        
                        <Button
                            variant="secondary"
                            className="w-full justify-between"
                            onClick={handleSaveRequest}
                            leftIcon={<Save className="w-4 h-4" />}
                        >
                            Save Game
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start text-xs border border-transparent hover:border-[#292524]"
                            onClick={() => setShowConsent(true)}
                            leftIcon={<Shield className="w-3 h-3" />}
                        >
                            Privacy Preferences
                        </Button>

                        {/* Danger Zone */}
                        <div className="p-4 rounded-xl border border-red-900/30 bg-red-950/10 space-y-3">
                            <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Danger Zone
                            </div>
                            <p className="text-[10px] text-red-400/70 leading-tight">
                                Deleting your campaign is irreversible. Your character and all progress will be lost.
                            </p>
                            <Button
                                variant="danger"
                                size="sm"
                                className="w-full"
                                onClick={handleResetRequest}
                                leftIcon={<Trash2 className="w-3 h-3" />}
                            >
                                Delete Data
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
    
    <ConsentManager forceOpen={showConsent} onClose={() => setShowConsent(false)} />
    </>
  );
};

export default SettingsModal;
