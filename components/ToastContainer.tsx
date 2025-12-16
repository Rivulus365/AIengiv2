
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
    const toasts = useGameStore(state => state.toasts);
    const removeToast = useGameStore(state => state.removeToast);

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div 
                    key={toast.id}
                    className="bg-[#1c1917] border border-[#292524] p-4 rounded shadow-[0_4px_20px_rgba(0,0,0,0.5)] w-80 pointer-events-auto animate-in slide-in-from-right fade-in duration-300 relative overflow-hidden group"
                >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        toast.type === 'success' ? 'bg-emerald-500' : 
                        toast.type === 'error' ? 'bg-red-500' : 
                        toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    
                    <div className="flex gap-3">
                        <div className={`mt-0.5 ${
                            toast.type === 'success' ? 'text-emerald-500' : 
                            toast.type === 'error' ? 'text-red-500' : 
                            toast.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                        }`}>
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                            {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-display font-bold text-stone-200 text-sm">{toast.title}</h4>
                            {toast.message && <p className="text-stone-400 text-xs mt-1 leading-relaxed">{toast.message}</p>}
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="text-stone-600 hover:text-stone-300 -mt-1 -mr-1 self-start"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
