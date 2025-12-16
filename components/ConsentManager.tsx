
import React, { useState, useEffect } from 'react';
import Button from './design-system/Button';
import { Shield, Lock, Check } from 'lucide-react';

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  aiTraining: boolean;
  timestamp: number;
}

interface ConsentManagerProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const ConsentManager: React.FC<ConsentManagerProps> = ({ forceOpen = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    necessary: true, // Always required
    analytics: false, // Default OFF (Privacy by Default)
    aiTraining: false, // Default OFF
    timestamp: 0
  });

  useEffect(() => {
    const stored = localStorage.getItem('ia_privacy_consent');
    if (!stored || forceOpen) {
      setIsOpen(true);
      if (stored) {
          setPreferences(JSON.parse(stored));
      }
    }
  }, [forceOpen]);

  const handleSave = () => {
    const newState = { ...preferences, timestamp: Date.now() };
    localStorage.setItem('ia_privacy_consent', JSON.stringify(newState));
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c0a09] border border-[#292524] rounded-xl max-w-md w-full shadow-2xl relative overflow-hidden animate-scale-in">
        
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 text-amber-500 mb-2">
                <Shield className="w-6 h-6" />
                <h2 className="text-xl font-display font-bold tracking-wide">Privacy Choices</h2>
            </div>
            
            <p className="text-stone-400 text-sm leading-relaxed">
                We practice <strong>Privacy by Design</strong>. Your adventure data is stored locally. 
                Please select how you want to interact with our AI systems.
            </p>

            <div className="space-y-4">
                {/* Necessary */}
                <div className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-white/5 opacity-70">
                    <div className="mt-1">
                        <Lock className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-stone-200 text-sm">Essential</h4>
                            <span className="text-[10px] uppercase text-emerald-500 font-bold">Required</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                            Local storage for game saves and authentication.
                        </p>
                    </div>
                </div>

                {/* Analytics */}
                <label className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:border-amber-500/30 transition-colors">
                    <div className="mt-1">
                        <input 
                            type="checkbox" 
                            checked={preferences.analytics}
                            onChange={(e) => setPreferences(p => ({...p, analytics: e.target.checked}))}
                            className="accent-amber-500 w-4 h-4"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-200 text-sm">Analytics</h4>
                        <p className="text-xs text-stone-500 mt-1">
                            Anonymous usage stats to improve game mechanics.
                        </p>
                    </div>
                </label>

                {/* AI Training */}
                <label className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:border-amber-500/30 transition-colors">
                    <div className="mt-1">
                        <input 
                            type="checkbox" 
                            checked={preferences.aiTraining}
                            onChange={(e) => setPreferences(p => ({...p, aiTraining: e.target.checked}))}
                            className="accent-amber-500 w-4 h-4"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-200 text-sm">AI Quality</h4>
                        <p className="text-xs text-stone-500 mt-1">
                            Allow non-sensitive prompt data to be used for model fine-tuning.
                        </p>
                    </div>
                </label>
            </div>
        </div>

        <div className="p-6 bg-[#1c1917] border-t border-[#292524] flex gap-3">
            <Button 
                variant="ghost" 
                onClick={() => {
                    setPreferences(p => ({ ...p, analytics: false, aiTraining: false }));
                    // Use timeout to allow state update before saving
                    setTimeout(handleSave, 0);
                }}
                className="flex-1"
            >
                Reject Optional
            </Button>
            <Button 
                variant="primary" 
                onClick={handleSave}
                className="flex-1"
                leftIcon={<Check className="w-4 h-4" />}
            >
                Save Preferences
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentManager;
