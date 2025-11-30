import React, { useState } from 'react';
import { Sword, Scroll, Zap, Sparkles, Lock, ArrowRight, User, Mail, Shield, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth';
import PrivacyPolicyModal from './PrivacyPolicyModal';

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
        if (isLogin) {
            await authService.login(email, password);
        } else {
            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters.");
            }
            await authService.signup(email, password);
        }
    } catch (err: any) {
        console.error("Auth error:", err);
        let msg = "An error occurred.";
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            msg = "Invalid email or password.";
        } else if (err.code === 'auth/email-already-in-use') {
            msg = "Email already in use.";
        } else if (err.message) {
            msg = err.message;
        }
        setError(msg);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0c0a09] text-stone-300 font-serif relative overflow-hidden flex flex-col">
      {/* Background Atmospherics */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/foggy-birds.png')] opacity-10 pointer-events-none animate-mist" aria-hidden="true"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0c0a09] to-transparent z-10"></div>
      
      {/* Navigation */}
      <nav className="relative z-20 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
            <Sword className="w-6 h-6 text-amber-600" />
            <span className="font-display font-bold text-xl text-stone-100 tracking-wider">Infinite Adventure Engine</span>
        </div>
        <button 
            onClick={() => setShowPrivacy(true)}
            className="text-xs text-stone-500 hover:text-amber-500 uppercase tracking-widest transition-colors"
        >
            Privacy Policy
        </button>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-12 gap-16 items-center relative z-20">
        
        {/* Left Column: Hero Content */}
        <div className="flex-1 space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-block bg-amber-900/20 border border-amber-900/40 rounded-full px-4 py-1.5 text-xs text-amber-500 font-display tracking-widest uppercase mb-2">
                Powered by Gemini 2.5 + IndexedDB
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-stone-100 leading-[0.9]">
                Where Text <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-200 text-shimmer">Becomes Legend</span>
            </h1>
            
            <p className="text-xl text-stone-400 max-w-lg leading-relaxed">
                Experience a limitless RPG world generated in real-time. 
                Full D&D 5e mechanics, tactical combat, and generative visual scenes driven by state-of-the-art AI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {[
                    { icon: Sparkles, title: "Generative AI", desc: "Unique stories & visuals every turn" },
                    { icon: Zap, title: "Deep Mechanics", desc: "D20 rolls, Stats, Inventory & Loot" },
                    { icon: Scroll, title: "Dynamic World", desc: "NPCs and Quests that react to you" },
                    { icon: Lock, title: "Local Save", desc: "Your progress is synced to browser" }
                ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-[#1c1917]/50 border border-[#292524] rounded-lg hover:border-amber-900/30 transition-colors">
                        <feature.icon className="w-5 h-5 text-amber-600 mt-1" />
                        <div>
                            <h3 className="font-bold text-stone-200 text-sm">{feature.title}</h3>
                            <p className="text-xs text-stone-500 leading-tight mt-1">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Column: Auth Form */}
        <div className="w-full max-w-md animate-in slide-in-from-right duration-700 delay-200">
            <div className="bg-[#1c1917] border border-[#292524] p-8 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.5)] group-hover:w-48 transition-all duration-700"></div>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-stone-100">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-stone-500 text-sm mt-2">
                        {isLogin ? 'Enter the realm and resume your journey.' : 'Begin your legend today.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded flex items-start gap-2 text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-stone-500 uppercase tracking-widest font-bold ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-stone-600" />
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0c0a09] border border-[#292524] text-stone-200 p-3 pl-10 rounded focus:outline-none focus:border-amber-700/50 transition-colors"
                                placeholder="hero@realm.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-stone-500 uppercase tracking-widest font-bold ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-stone-600" />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0c0a09] border border-[#292524] text-stone-200 p-3 pl-10 rounded focus:outline-none focus:border-amber-700/50 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-stone-100 font-display font-bold py-3 rounded shadow-lg mt-6 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="animate-pulse">Authenticating...</span>
                        ) : (
                            <>
                                {isLogin ? 'Login' : 'Sign Up'} <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        type="button"
                        onClick={() => { setError(null); setIsLogin(!isLogin); }}
                        className="text-xs text-stone-500 hover:text-amber-500 transition-colors underline decoration-stone-700 hover:decoration-amber-500"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
      </main>

      <footer className="relative z-20 border-t border-[#292524] p-6 text-center">
        <p className="text-[10px] text-stone-600 uppercase tracking-widest">
            © 2023 Infinite Adventure Engine • Powered by Browser Storage & Gemini
        </p>
      </footer>

      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
};

export default LandingPage;
