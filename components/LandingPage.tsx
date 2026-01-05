
import React, { useState, useEffect } from 'react';
import { Sword, Scroll, Zap, Sparkles, Lock, ArrowRight, Mail, AlertCircle, ArrowLeft, User as UserIcon, Key } from 'lucide-react';
import { authService } from '../services/auth';
import { isFirebaseConfigured } from '../services/firebase';
import { useGameStore } from '../store/gameStore';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { NoiseTexture } from './VisualAssets';
import Button from './design-system/Button';

const BANNER_URL = "https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6";

type LogoVariant = 'nav' | 'hero';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FallbackLogo = ({ variant }: { variant: LogoVariant }) => (
    <div className={`flex items-center gap-3 ${variant === 'hero' ? 'flex-col md:flex-row' : ''} select-none`}>
        <div className={`relative flex items-center justify-center ${variant === 'hero' ? 'w-20 h-20' : 'w-10 h-10'} bg-gradient-to-br from-amber-900/80 to-stone-900 rounded-lg border border-amber-600/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] overflow-hidden group`}>
            <div className="absolute inset-0 bg-amber-500/10 rotate-45 transform scale-150 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
            <Sword className={`${variant === 'hero' ? 'w-10 h-10' : 'w-5 h-5'} text-amber-500 drop-shadow-md`} />
        </div>
        <div className={`flex flex-col ${variant === 'hero' ? 'items-center md:items-start text-center md:text-left' : ''}`}>
            <span className={`${variant === 'hero' ? 'text-3xl' : 'text-xl'} font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 tracking-wide leading-none`}>
                INFINITE
            </span>
            <span className={`${variant === 'hero' ? 'text-sm' : 'text-[0.6rem]'} font-serif text-stone-500 uppercase tracking-[0.35em] leading-tight`}>
                Adventure Engine
            </span>
        </div>
    </div>
);

const Logo: React.FC<{ className?: string, variant?: LogoVariant }> = ({ className = "", variant = 'nav' }) => {
    const [error, setError] = useState(false);
    const logoSrc = BANNER_URL;

    if (error) {
        return <FallbackLogo variant={variant as (LogoVariant)} />;
    }

    return (
        <img 
            src={logoSrc} 
            alt="Infinite Adventure Engine" 
            className={`${className} object-contain transition-all hover:brightness-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]`}
            onError={() => setError(true)}
        />
    );
};

const LandingPage: React.FC = () => {
  const setUser = useGameStore(state => state.setUser);
  
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<string>('');
  
  // Check if API key is already present in env vars, otherwise check for user selection
  const [apiKeySelected, setApiKeySelected] = useState(!!process.env.API_KEY);

  useEffect(() => {
    const checkKey = async () => {
        // If key is in env vars, we are set
        if (process.env.API_KEY) return;

        if (window.aistudio) {
            const selected = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(selected);
        }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Guidelines specify assuming success and proceeding to mitigate race conditions
        setApiKeySelected(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeySelected) {
        setError("Please select a valid paid Gemini API key before entering the realm.");
        return;
    }
    if (!isFirebaseConfigured) {
        setError("System Error: Firebase configuration invalid.");
        return;
    }

    setLoading(true);
    setError('');
    setResetSuccess('');
    
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
        let msg = "Authentication failed.";
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            msg = "Invalid email or password.";
        } else if (err.code === 'auth/email-already-in-use') {
            msg = "Email already in use.";
        } else if (err.message) {
            msg = err.message;
        }
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!apiKeySelected) {
        setError("Please select a valid paid Gemini API key before entering the realm.");
        return;
    }
    if (!isFirebaseConfigured) {
        setError("System Error: Firebase API Key missing.");
        return;
    }

    setLoading(true);
    setError('');
    try {
        await authService.loginWithGoogle();
    } catch (err: any) {
        console.error("Google Auth error:", err);
        let msg = "Failed to sign in with Google.";
        if (err.code === 'auth/popup-closed-by-user') {
            msg = "Sign in cancelled.";
        } else if (err.message) {
            msg = err.message;
        }
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (!apiKeySelected) {
        setError("Please select a valid paid Gemini API key before entering the realm.");
        return;
    }
    setLoading(true);
    setError('');
    try {
        if (isFirebaseConfigured) {
            try {
                await authService.loginAnonymously();
                return; 
            } catch (err: any) {
                console.warn("Firebase Anonymous Auth failed, falling back to local guest.", err);
            }
        }

        let guestId = localStorage.getItem('ia_guest_id');
        if (!guestId) {
            guestId = `guest_${crypto.randomUUID()}`;
            localStorage.setItem('ia_guest_id', guestId);
        }
        
        await setUser({
            uid: guestId,
            email: null,
            displayName: 'Guest Traveler',
            photoURL: null,
            isAnonymous: true
        });
        
    } catch (err: any) {
        console.error("Guest login critical error:", err);
        setError("Failed to initialize guest session.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0c0a09] text-stone-300 font-serif relative overflow-y-auto custom-scrollbar flex flex-col">
      {/* Background Atmospherics */}
      <NoiseTexture className="fixed inset-0 animate-mist text-stone-500 z-0" opacity={0.08} />
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0c0a09] to-transparent z-10 pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="relative z-20 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full shrink-0">
        <Logo className="h-12 w-auto" variant="nav" />
        <Button 
            variant="ghost"
            size="sm"
            onClick={() => setShowPrivacy(true)}
        >
            Privacy Policy
        </Button>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-12 gap-16 items-center relative z-20">
        
        {/* Left Column: Hero Content */}
        <div className="flex-1 space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-block bg-amber-900/20 border border-amber-900/40 rounded-full px-4 py-1.5 text-xs text-amber-500 font-display tracking-widest uppercase mb-2">
                Powered by Gemini 3.0
            </div>
            
            {/* Hero Logo Placement */}
            <div className="w-full max-w-[500px]">
                <Logo className="w-full h-auto max-h-[180px]" variant="hero" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold text-stone-100 leading-[0.9]">
                Where Text <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-200 text-shimmer">Becomes Legend</span>
            </h1>
            
            <p className="text-xl text-stone-400 max-w-lg leading-relaxed">
                Experience a limitless RPG world generated in real-time. 
                Full D&D 5e mechanics, tactical combat, and generative visual scenes driven by state-of-the-art AI.
            </p>

            {!apiKeySelected ? (
                <div className="p-6 bg-[#1c1917] border border-amber-900/30 rounded-xl space-y-4 animate-slide-up max-w-md">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <Key className="w-6 h-6" />
                        <h2 className="text-xl font-display font-bold">API Key Selection</h2>
                    </div>
                    <p className="text-sm text-stone-400 leading-relaxed">
                        To access high-quality generative features, you must select your own paid API key from Google AI Studio. 
                        This ensures a premium experience without limits.
                    </p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-400 transition-colors block underline">
                        View Billing Documentation
                    </a>
                    <Button onClick={handleOpenKeyDialog} variant="primary" className="w-full mt-2" leftIcon={<Sparkles className="w-4 h-4" />}>
                        Select API Key
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 animate-in fade-in duration-500">
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
            )}
        </div>

        {/* Right Column: Auth Form */}
        <div className={`w-full max-w-md animate-in slide-in-from-right duration-700 delay-200 ${!apiKeySelected ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <div className="bg-[#1c1917] border border-[#292524] p-8 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.5)] group-hover:w-48 transition-all duration-700"></div>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-stone-100">
                        {isForgotPassword ? 'Account Recovery' : (isLogin ? 'Welcome Back' : 'Create Account')}
                    </h2>
                    <p className="text-stone-500 text-sm mt-2">
                        {isLogin ? 'Enter the realm and resume your journey.' : 'Begin your legend today.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded flex items-start gap-2 text-red-400 text-xs animate-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading || !isFirebaseConfigured}
                    className="w-full bg-white hover:bg-stone-100 text-stone-900 py-3 rounded border border-stone-300 transition-all flex items-center justify-center gap-3 mb-3 group shadow-md"
                >
                    <GoogleIcon />
                    <span className="text-sm font-bold">Sign in with Google</span>
                </button>

                <button
                    onClick={handleGuestLogin}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 py-3 rounded border border-stone-800 hover:border-stone-600 transition-all flex items-center justify-center gap-3 mb-4 group"
                >
                    <UserIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">Continue as Guest</span>
                </button>

                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#292524]"></div></div>
                    <div className="relative flex justify-center text-xs"><span className="px-2 bg-[#1c1917] text-stone-500 uppercase tracking-widest">Or continue with email</span></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-stone-600" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0c0a09] border border-[#292524] text-stone-200 p-3 pl-10 rounded focus:border-amber-700/50 transition-colors outline-none" placeholder="Email" required />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-stone-600" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0c0a09] border border-[#292524] text-stone-200 p-3 pl-10 rounded focus:border-amber-700/50 transition-colors outline-none" placeholder="Password" required />
                    </div>
                    <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>{isLogin ? 'Login' : 'Sign Up'}</Button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-xs text-stone-500 hover:text-amber-500 transition-colors underline decoration-stone-700">
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
      </main>

      <footer className="relative z-20 border-t border-[#292524] p-6 text-center shrink-0">
        <p className="text-[10px] text-stone-600 uppercase tracking-widest">
            © 2024 Infinite Adventure Engine • Powered by Gemini
        </p>
      </footer>

      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
};

export default LandingPage;
