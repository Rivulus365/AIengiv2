import React, { useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ImageSize, GameState } from '../types';
import { Send, Image as ImageIcon, Sparkles, Sword, Shield, Wind, Eye, Tent, Moon, Search, MessageSquare, FlaskConical } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import DiceAnimation from './DiceAnimation';

// Extracted and Memoized Message Component to prevent re-renders on typing
const MessageBubble = React.memo(({ msg }: { msg: ChatMessage }) => {
  return (
    <div
      className={`flex flex-col max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
    >
      {/* Image attachment if exists */}
      {msg.image && (
        <div className="mb-6 rounded-sm overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border-[8px] border-[#1c1917] w-full max-w-3xl">
          <img
            src={msg.image}
            alt={`Scene illustration for: ${msg.text.slice(0, 50)}...`}
            className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
            loading="lazy"
          />
        </div>
      )}

      {/* Text Bubble */}
      <div
        className={`
                    max-w-full md:max-w-3xl px-8 py-6 text-lg leading-relaxed relative
                    ${msg.role === 'user'
            ? 'bg-[#1c1917] text-stone-300 rounded-lg rounded-tr-none border border-[#292524] shadow-lg font-sans'
            : 'bg-transparent text-[#d6d3d1] font-serif pl-8 border-l-2 border-amber-900/40'
          }
                `}
      >
        {msg.role === 'user' ? (
          <p>{msg.text.replace('[System]: ', '')}</p>
        ) : (
          <div className="prose prose-invert prose-p:text-[#d6d3d1] prose-p:leading-8 prose-strong:text-amber-500 prose-headings:text-amber-500 prose-headings:font-display max-w-none">
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
});

const ChatInterface: React.FC = () => {
  // Store Selectors
  const messages = useGameStore(state => state.messages);
  const isLoading = useGameStore(state => state.isLoading);
  const gameState = useGameStore(state => state.gameState);
  const imageSize = useGameStore(state => state.imageSize);
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const processTurn = useGameStore(state => state.processTurn);
  const setImageSize = useGameStore(state => state.setImageSize);

  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dice Animation State
  const [diceQueue, setDiceQueue] = React.useState<{ target: number; type: 'player' | 'enemy'; isCrit: boolean; isFail: boolean }[]>([]);
  const [currentDice, setCurrentDice] = React.useState<{ target: number; type: 'player' | 'enemy'; isCrit: boolean; isFail: boolean } | null>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());

  // 1. Scan for new rolls and add to queue
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'model' && !processedMessageIds.current.has(lastMsg.id)) {

      // Regex to find all occurrences of (Rolled X...)
      // Matches: (Rolled 20), (Rolled 15 + 5 = 20), etc.
      const regex = /\(Rolled\s+(\d+)[^)]*\)/gi;
      const matches = [...lastMsg.text.matchAll(regex)];

      if (matches.length > 0) {
        const newRolls = matches.map(match => {
          const rawRoll = parseInt(match[1], 10);
          const isCrit = rawRoll === 20 || match[0].toLowerCase().includes('critical hit');
          const isFail = rawRoll === 1 || match[0].toLowerCase().includes('critical miss');
          const type: 'player' | 'enemy' = 'player';
          return { target: rawRoll, type, isCrit, isFail };
        });

        setDiceQueue(prev => [...prev, ...newRolls]);
        processedMessageIds.current.add(lastMsg.id);
      }
    }
  }, [messages]);

  // 2. Process Queue
  useEffect(() => {
    if (!currentDice && diceQueue.length > 0) {
      const nextRoll = diceQueue[0];
      setCurrentDice(nextRoll);
      setDiceQueue(prev => prev.slice(1));
    }
  }, [diceQueue, currentDice]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      processTurn(input);
      setInput('');
    }
  };

  const handleShortcut = (action: string, isSystem: boolean = false, autoSend: boolean = true) => {
    if (isLoading) return;
    const text = isSystem ? `[System]: ${action}` : action;

    if (autoSend) {
      processTurn(text);
    } else {
      setInput(text);
      inputRef.current?.focus();
    }
  };

  const suggestions = useMemo(() => {
    const s: { label: string; text: string; icon: React.ElementType; isSystem?: boolean; color?: string; autoSend?: boolean }[] = [];

    // 1. COMBAT CONTEXT
    if (gameState.combat.isActive) {
      // Attack Action
      const weapon = gameState.equipment.mainHand?.name || "Unarmed Strike";
      s.push({
        label: "Attack",
        text: `Player attacks with ${weapon}!`,
        icon: Sword,
        color: "text-red-300 border-red-900/50 bg-red-950/30 hover:bg-red-900/50",
        isSystem: true,
        autoSend: false
      });

      // Dodge (Defensive)
      s.push({
        label: "Dodge",
        text: "Player takes the Dodge action.",
        icon: Shield,
        color: "text-amber-300 border-amber-900/50 bg-amber-950/30 hover:bg-amber-900/50",
        isSystem: true,
        autoSend: false
      });

      // Flee (Escape)
      s.push({
        label: "Flee",
        text: "Player attempts to flee!",
        icon: Wind,
        color: "text-stone-400 border-stone-700/50 bg-stone-900/50 hover:bg-stone-800",
        isSystem: true,
        autoSend: false
      });

      // Spellcasting (if capable)
      if (gameState.player.activeSpells.length > 0 && gameState.player.resources.spellSlots.current > 0) {
        const spell = gameState.player.activeSpells[0]; // Suggest first spell
        s.push({ label: "Cast Spell", text: `I cast ${spell}!`, icon: Sparkles, color: "text-violet-300 border-violet-900/50 bg-violet-950/30 hover:bg-violet-900/50" });
      }

      // Healing (if injured and has potion)
      const isInjured = gameState.player.hp.current < gameState.player.hp.max;
      const hasPotion = gameState.inventory.some(i => i.name.toLowerCase().includes('potion'));
      if (isInjured && hasPotion) {
        s.push({ label: "Drink Potion", text: "I drink a potion of healing.", icon: FlaskConical, color: "text-emerald-300 border-emerald-900/50 bg-emerald-950/30 hover:bg-emerald-900/50" });
      }
    }
    // 2. EXPLORATION CONTEXT
    else {
      // Basic Perception
      s.push({ label: "Look", text: "Look around carefully.", icon: Eye, color: "text-stone-300 border-stone-700/50 bg-stone-900/50 hover:bg-stone-800" });
      s.push({ label: "Investigate", text: "I investigate the area closely for secrets or loot.", icon: Search, color: "text-blue-300 border-blue-900/50 bg-blue-950/30 hover:bg-blue-900/50" });

      // Social (if in civilization)
      const loc = gameState.worldState.location.toLowerCase();
      if (loc.match(/(town|village|city|tavern|camp|outpost)/)) {
        s.push({ label: "Rumors", text: "I listen for rumors and news.", icon: MessageSquare, color: "text-amber-300 border-amber-900/50 bg-amber-950/30 hover:bg-amber-900/50" });
      }

      // Resting Logic
      if (gameState.player.hp.current < gameState.player.hp.max) {
        s.push({ label: "Short Rest", text: "Player takes a Short Rest.", icon: Tent, isSystem: true, color: "text-stone-400 border-stone-700/50 bg-stone-900/30 hover:bg-stone-800" });
      }
      s.push({ label: "Long Rest", text: "Player takes a Long Rest.", icon: Moon, isSystem: true, color: "text-stone-400 border-stone-700/50 bg-stone-900/30 hover:bg-stone-800" });
    }
    return s;
  }, [gameState]);

  return (
    <div className="flex flex-col h-full bg-[#0c0a09] relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1c1917] via-[#0c0a09] to-[#000000]">
      {/* Mist Animation Layer */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/foggy-birds.png')] opacity-10 pointer-events-none animate-mist" aria-hidden="true"></div>

      {/* Header / Toolbar */}
      <div className="absolute top-0 right-0 p-4 z-10 flex gap-2">
        <div className="bg-[#1c1917]/90 backdrop-blur rounded-sm border border-[#292524] flex items-center text-xs shadow-lg">
          <ImageIcon className="w-3 h-3 text-stone-500 ml-3 mr-2" aria-hidden="true" />
          <label htmlFor="image-quality" className="sr-only">Image Quality</label>
          <select
            id="image-quality"
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value as ImageSize)}
            className="bg-transparent text-stone-400 p-2 outline-none cursor-pointer hover:text-amber-500 font-sans uppercase tracking-wider text-[10px]"
          >
            <option value={ImageSize.Size_1K}>1K Canvas</option>
            <option value={ImageSize.Size_2K}>2K Canvas (HQ)</option>
            <option value={ImageSize.Size_4K}>4K Canvas (Ultra)</option>
          </select>
        </div>
      </div>

      {/* Messages Area - LIVE REGION */}
      <div
        className="flex-1 overflow-y-auto p-4 md:p-12 space-y-12 scroll-smooth relative z-0"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Adventure Log"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-center items-center p-12 opacity-70" role="status">
            <div className="flex items-center gap-4 text-amber-700/80 font-display animate-pulse tracking-widest uppercase text-sm">
              <Sparkles className="w-4 h-4 animate-spin-slow" aria-hidden="true" />
              <span className="text-shimmer">Weaving Fate...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09] to-transparent max-w-5xl mx-auto w-full relative z-10">

        {/* Suggested Actions Bar */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar mask-gradient px-1" role="toolbar" aria-label="Suggested Actions">
          {suggestions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleShortcut(action.text, action.isSystem, action.autoSend)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 border rounded text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap hover:scale-105 active:scale-95 shadow-lg ${action.color}`}
            >
              <action.icon className="w-3 h-3" aria-hidden="true" />
              {action.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-900/20 via-stone-800/20 to-amber-900/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" aria-hidden="true"></div>
          <label htmlFor="chat-input" className="sr-only">Your Action</label>
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "The story unfolds..." : "Declare your action..."}
            className="relative w-full bg-[#09090b] text-stone-200 placeholder-stone-600 border border-[#292524] rounded-lg py-5 pl-8 pr-16 focus:outline-none focus:border-amber-900/50 focus:ring-1 focus:ring-amber-900/20 transition-all text-xl font-serif disabled:opacity-50 shadow-2xl focus:shadow-[0_0_20px_rgba(251,191,36,0.05)]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send Message"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-amber-500 disabled:opacity-0 transition-all disabled:pointer-events-none"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        </form>
        <div className="text-center mt-3 text-[10px] text-stone-700 font-display tracking-[0.2em] uppercase opacity-50" aria-hidden="true">
          Infinite Adventure Engine
        </div>
      </div>
      {/* Dice Animation Overlay */}
      {currentDice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <DiceAnimation
            {...currentDice}
            soundEnabled={soundEnabled}
            onComplete={() => setCurrentDice(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;