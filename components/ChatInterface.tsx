
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ImageSize, GameState, FontSize, RollData, DieType } from '../types';
import { Send, Image as ImageIcon, Sparkles, ArrowDown, Copy, Check, Mic, MicOff, Square, Dices, ChevronUp, ChevronDown, Volume2, Loader2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useSettingsStore } from '../store/settingsStore';
import DiceAnimation from './DiceAnimation';
import { audioService } from '../services/audio';
import { useActionSuggestions } from '../hooks/useActionSuggestions';
import ConfidenceChip from './design-system/ConfidenceChip';

const getFontSizeClass = (size: FontSize) => {
    switch (size) {
        case 'small': return 'text-sm';
        case 'large': return 'text-xl';
        case 'medium':
        default: return 'text-base';
    }
}

const LOADING_TIPS = [
    "Consulting the ancient scrolls...",
    "Rolling for initiative...",
    "The Dungeon Master is plotting...",
    "Weaving the threads of fate...",
    "Summoning sprites...",
    "Calculating damage modifiers...",
    "Listening to the whispers of the void...",
    "Polishing the dice..."
];

const MessageBubble = React.memo(({ msg, fontSize, onImageLoad }: { msg: ChatMessage, fontSize: FontSize, onImageLoad?: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const speakMessage = useGameStore(state => state.speakMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
      if (isAudioLoading) return;
      setIsAudioLoading(true);
      await speakMessage(msg.text);
      setIsAudioLoading(false);
  };

  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  const hasRolls = (msg.gameStateSnapshot?.lastRolls?.length || 0) > 0;
  const confidenceScore = hasRolls ? 0.75 : 0.95;

  if (isSystem) {
      return (
          <div className="py-2 flex justify-center animate-fade-in" role="status">
              <div className="bg-stone-900/40 border border-stone-800 rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">
                  {msg.text.replace('[System]: ', '')}
              </div>
          </div>
      );
  }

  return (
    <div className={`group relative w-full animate-slide-up ${isUser ? 'flex justify-end py-4' : 'py-6'}`}>
      <div className={`relative max-w-4xl w-full ${isUser ? 'w-auto' : ''}`}>
        {isUser ? (
            <div className="bg-[#1c1917] border border-[#292524] rounded-2xl rounded-tr-none px-6 py-4 shadow-lg max-w-[85vw] md:max-w-xl">
                <p className="text-stone-200 font-sans text-lg leading-relaxed">{msg.text.replace('[System]: ', '')}</p>
            </div>
        ) : (
            <div className={`space-y-6 ${getFontSizeClass(fontSize)} text-[#d6d3d1]`}>
                {msg.image && (
                    <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-stone-800 group-hover:border-stone-700 transition-colors animate-scale-in">
                        <img
                            src={msg.image}
                            alt={msg.text.slice(0, 100) + '...'} 
                            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                            loading="lazy"
                            decoding="async"
                            onLoad={onImageLoad}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                    </div>
                )}
                <div className="prose prose-invert prose-p:text-stone-300 prose-headings:text-amber-500 prose-headings:font-display prose-strong:text-amber-400 prose-em:text-stone-400 max-w-none px-2 md:px-8">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                <div className="px-8 mt-2 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <ConfidenceChip score={confidenceScore} />
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={handleSpeak} 
                            className={`p-2 text-stone-600 hover:text-amber-500 transition-colors ${isAudioLoading ? 'cursor-wait opacity-50' : ''}`}
                            title="Play Narration"
                            aria-label="Play Narration"
                            disabled={isAudioLoading}
                        >
                            {isAudioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button 
                            onClick={handleCopy} 
                            className="p-2 text-stone-600 hover:text-amber-500 transition-colors" 
                            title="Copy to clipboard"
                            aria-label="Copy message text"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
});

const DiceBag = ({ onRoll }: { onRoll: (count: number, type: DieType) => void }) => {
    const [count, setCount] = useState(1);
    const diceTypes: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

    return (
        <div className="glass-panel p-4 rounded-xl shadow-2xl border-amber-900/30 flex flex-col gap-4 min-w-[200px] animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Dice Bag</span>
                <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5">
                    <button 
                        onClick={() => setCount(Math.max(1, count - 1))} 
                        className="text-stone-500 hover:text-white"
                        aria-label="Decrease dice count"
                    >
                        -
                    </button>
                    <span className="text-xs font-mono font-bold text-stone-200" aria-label={`Current count: ${count}`}>{count}</span>
                    <button 
                        onClick={() => setCount(Math.min(10, count + 1))} 
                        className="text-stone-500 hover:text-white"
                        aria-label="Increase dice count"
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {diceTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => onRoll(count, type)}
                        aria-label={`Roll ${count} ${type}`}
                        className="py-2 px-1 bg-[#1c1917] border border-[#292524] rounded-lg hover:border-amber-600/50 hover:text-amber-400 transition-all text-xs font-bold font-mono"
                    >
                        {type.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ChatInterface: React.FC = () => {
  const { messages, gameState, processTurn, toggleLiveMode, toggleMicMute, manualRoll } = useGameStore();
  
  // UI Store
  const isLoading = useUIStore(state => state.isLoading);
  const isLiveActive = useUIStore(state => state.isLiveActive);
  const isMicMuted = useUIStore(state => state.isMicMuted);

  // Settings Store
  const imageSize = useSettingsStore(state => state.imageSize);
  const setImageSize = useSettingsStore(state => state.setImageSize);
  const fontSize = useSettingsStore(state => state.fontSize);
  const soundEnabled = useSettingsStore(state => state.soundEnabled);

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showDiceBag, setShowDiceBag] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [rollQueue, setRollQueue] = useState<RollData[][]>([]);
  const [currentBatch, setCurrentBatch] = useState<RollData[]>([]);
  const processedBatchIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if ((lastMsg.role === 'model' || lastMsg.role === 'system') && !processedBatchIds.current.has(lastMsg.id)) {
      const rolls = lastMsg.gameStateSnapshot?.lastRolls;
      if (rolls && rolls.length > 0) {
        setRollQueue(prev => [...prev, rolls]);
      }
      processedBatchIds.current.add(lastMsg.id);
    }
  }, [messages]);

  useEffect(() => {
    if (currentBatch.length === 0 && rollQueue.length > 0) {
      const nextBatch = rollQueue[0];
      setCurrentBatch(nextBatch);
      setRollQueue(prev => prev.slice(1));
    }
  }, [rollQueue, currentBatch]);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
        interval = setInterval(() => setLoadingTipIndex(prev => (prev + 1) % LOADING_TIPS.length), 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);
  
  useEffect(() => { 
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (!isLoading && !isMobile) {
          inputRef.current?.focus(); 
      }
  }, [isLoading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      audioService.resume();
      audioService.playUiSound('click');
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      processTurn(input);
      setInput('');
    }
  };

  const handleManualRoll = (count: number, type: DieType) => {
      setShowDiceBag(false);
      audioService.resume();
      manualRoll(count, type);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
          e.preventDefault();
          const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          if (history[newIndex]) setInput(history[newIndex]);
      } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const newIndex = Math.min(history.length - 1, historyIndex + 1);
          setHistoryIndex(newIndex);
          if (newIndex === history.length) {
              setHistoryIndex(-1);
              setInput('');
          } else if (history[newIndex]) {
              setInput(history[newIndex]);
          }
      }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute top-4 right-6 z-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="glass-panel rounded-full px-3 py-1 flex items-center gap-2 text-xs">
          <ImageIcon className="w-3 h-3 text-stone-400" />
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value as ImageSize)}
            className="bg-transparent text-stone-300 outline-none cursor-pointer uppercase font-bold tracking-wider"
            aria-label="Image Quality Selector"
          >
            <option value={ImageSize.Size_1K}>Standard</option>
            <option value={ImageSize.Size_2K}>High Res</option>
            <option value={ImageSize.Size_4K}>Ultra</option>
          </select>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-[15%] pt-8 pb-32 scroll-smooth custom-scrollbar"
        role="log"
        aria-live="polite"
      >
        <div className="h-8"></div>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} fontSize={fontSize} />
        ))}
        {isLoading && (
          <div className="py-12 flex justify-center animate-pulse" role="status" aria-label="Loading response">
            <div className="flex flex-col items-center gap-3 text-amber-700/60 font-display uppercase tracking-widest text-xs">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
              <span>{LOADING_TIPS[loadingTipIndex]}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {showScrollButton && (
        <button 
            onClick={scrollToBottom}
            className="absolute bottom-32 right-8 z-30 p-3 glass-panel rounded-full text-amber-500 hover:text-amber-400 hover:scale-110 transition-all shadow-lg animate-fade-in"
            aria-label="Scroll to bottom"
        >
            <ArrowDown className="w-5 h-5" />
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-4xl mx-auto space-y-3 relative">
            
            {showDiceBag && (
                <div className="absolute bottom-full mb-4 left-0 z-50">
                    <DiceBag onRoll={handleManualRoll} />
                </div>
            )}

            {!isLiveActive && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mask-gradient px-1" role="toolbar" aria-label="Quick Actions">
                    <button
                        onClick={() => setShowDiceBag(!showDiceBag)}
                        className={`glass-button px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2 ${showDiceBag ? 'bg-amber-900/20 border-amber-500 text-amber-400' : 'text-stone-400 hover:text-stone-200'}`}
                        aria-expanded={showDiceBag}
                        aria-label="Open Dice Bag"
                    >
                        <Dices className="w-3 h-3" /> Dice Bag
                    </button>
                    {useActionSuggestions(gameState).map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setShowDiceBag(false);
                                if (isLoading) return;
                                audioService.resume();
                                audioService.playUiSound('click');
                                const text = action.isSystem ? `[System]: ${action.text}` : action.text;
                                if (action.autoSend) {
                                    processTurn(text);
                                } else {
                                    setInput(text);
                                    inputRef.current?.focus();
                                }
                            }}
                            disabled={isLoading}
                            className={`glass-button px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2 ${action.color || 'text-stone-400 hover:text-stone-200'}`}
                        >
                            <action.icon className="w-3 h-3" /> {action.label}
                        </button>
                    ))}
                </div>
            )}

            {isLiveActive && (
                <div className={`w-full h-16 glass-panel rounded-xl flex items-center justify-between px-6 border-${isMicMuted ? 'amber' : 'emerald'}-500/30 shadow-[0_0_20px_rgba(${isMicMuted ? '245,158,11' : '16,185,129'},0.2)] animate-pulse-glow transition-all duration-500`}>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1 items-end h-8">
                            {[...Array(5)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-1.5 rounded-full ${isMicMuted ? 'bg-amber-500/50 h-2' : 'bg-emerald-500 animate-[bounce_1s_infinite]'}`} 
                                    style={isMicMuted ? {} : { height: '100%', animationDelay: `${i * 0.1}s` }}
                                ></div>
                            ))}
                        </div>
                        <span className={`${isMicMuted ? 'text-amber-500' : 'text-emerald-400'} font-display tracking-widest uppercase text-sm`}>
                            {isMicMuted ? 'Mic Paused' : 'Listening...'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={toggleMicMute} 
                            className={`p-2 rounded-full border transition-all ${isMicMuted ? 'bg-amber-500 text-black border-amber-400' : 'bg-black/40 text-stone-400 border-stone-700 hover:text-white'}`} 
                            title={isMicMuted ? "Resume Listening" : "Pause Listening"}
                            aria-label={isMicMuted ? "Resume Listening" : "Pause Listening"}
                        >
                            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button 
                            onClick={toggleLiveMode} 
                            className="p-2 rounded-full bg-red-950/50 border border-red-900/50 text-red-500 hover:bg-red-900/80 hover:text-white transition-all" 
                            title="Stop Session"
                            aria-label="Stop Voice Session"
                        >
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    </div>
                </div>
            )}
            <div className={`relative transition-all duration-500 ${isLiveActive ? 'hidden' : 'opacity-100'}`}>
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute inset-0 bg-amber-500/5 rounded-2xl blur-xl group-focus-within:bg-amber-500/10 transition-all duration-500"></div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || isLiveActive}
                        placeholder={isLoading ? "The story is unfolding..." : "What do you do?"}
                        className="w-full glass-panel bg-black/60 rounded-2xl py-4 pl-6 pr-32 text-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-700/50 focus:ring-1 focus:ring-amber-900/20 transition-all font-serif"
                        autoComplete="off"
                        aria-label="Chat Input"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button 
                            type="button" 
                            onClick={toggleLiveMode} 
                            className={`p-2 rounded-xl transition-all ${isLiveActive ? 'text-red-500 bg-red-950/30' : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'}`} 
                            title="Voice Mode"
                            aria-label="Enable Voice Mode"
                        >
                            {isLiveActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isLoading} 
                            className="p-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl shadow-lg transition-all disabled:opacity-0 disabled:scale-75"
                            aria-label="Send Message"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>

      {currentBatch.length > 0 && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-black/40 backdrop-blur-md animate-in fade-in" aria-hidden="true">
          <DiceAnimation
            rolls={currentBatch}
            soundEnabled={soundEnabled}
            onComplete={() => setCurrentBatch([])}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
