
import { create } from 'zustand';
import { ToastMessage } from '../types';

interface UIState {
    isLoading: boolean;
    isCharacterSheetOpen: boolean;
    isLiveActive: boolean;
    isMicMuted: boolean;
    toasts: ToastMessage[];

    setIsLoading: (loading: boolean) => void;
    setToggleCharacterSheet: (open: boolean) => void;
    setIsLiveActive: (active: boolean) => void;
    setIsMicMuted: (muted: boolean) => void;
    addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
    removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    isLoading: false,
    isCharacterSheetOpen: false,
    isLiveActive: false,
    isMicMuted: false,
    toasts: [],

    setIsLoading: (isLoading) => set({ isLoading }),
    setToggleCharacterSheet: (isCharacterSheetOpen) => set({ isCharacterSheetOpen }),
    setIsLiveActive: (isLiveActive) => set({ isLiveActive }),
    setIsMicMuted: (isMicMuted) => set({ isMicMuted }),
    
    addToast: (title, message, type = 'info') => {
        const id = crypto.randomUUID();
        set(state => ({ toasts: [...state.toasts, { id, title, message, type }] }));
        setTimeout(() => get().removeToast(id), 5000);
    },
    removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));
