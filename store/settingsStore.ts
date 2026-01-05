
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ImageSize, FontSize } from '../types';

interface SettingsState {
    soundEnabled: boolean;
    narratorEnabled: boolean;
    imageGenEnabled: boolean;
    imageSize: ImageSize;
    fontSize: FontSize;
    textSpeed: 'normal' | 'fast' | 'instant';
    
    setSoundEnabled: (enabled: boolean) => void;
    setNarratorEnabled: (enabled: boolean) => void;
    setImageGenEnabled: (enabled: boolean) => void;
    setImageSize: (size: ImageSize) => void;
    setFontSize: (size: FontSize) => void;
    setTextSpeed: (speed: 'normal' | 'fast' | 'instant') => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            soundEnabled: true,
            narratorEnabled: true,
            imageGenEnabled: true,
            imageSize: ImageSize.Size_1K,
            fontSize: 'medium',
            textSpeed: 'normal',

            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            setNarratorEnabled: (enabled) => set({ narratorEnabled: enabled }),
            setImageGenEnabled: (enabled) => set({ imageGenEnabled: enabled }),
            setImageSize: (size) => set({ imageSize: size }),
            setFontSize: (size) => set({ fontSize: size }),
            setTextSpeed: (speed) => set({ textSpeed: speed }),
        }),
        { name: 'ia-settings' }
    )
);
