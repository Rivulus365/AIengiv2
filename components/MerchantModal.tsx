
import React, { useMemo } from 'react';
import { X, Coins, ShoppingBag, Package, Trash2, ArrowRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Item } from '../types';
import Button from './design-system/Button';

interface MerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STOCK: Partial<Item>[] = [
    { name: "Potion of Healing", value: 50, description: "Restores 2d4+2 HP.", rarity: "common", type: "consumable" },
    { name: "Iron Longsword", value: 15, dmg: "1d8", rarity: "common", type: "melee" },
    { name: "Leather Armor", value: 10, ac: 11, rarity: "common", type: "light" },
    { name: "Rations", value: 1, description: "A day's worth of food.", rarity: "common", type: "consumable" },
    { name: "Shield", value: 10, ac: 2, rarity: "common", type: "shield" }
];

const MerchantModal: React.FC<MerchantModalProps> = ({ isOpen, onClose }) => {
  const gameState = useGameStore(state => state.gameState);
  const processTurn = useGameStore(state => state.processTurn);
  const addToast = useGameStore(state => state.addToast);

  const buy = (item: Partial<Item>) => {
    if (gameState.player.gold < (item.value || 0)) {
        addToast("Insufficient Funds", "You don't have enough gold.", "error");
        return;
    }
    processTurn(`[System]: Player buys ${item.name} for ${item.value} gold.`);
    onClose();
  };

  const sell = (item: Item) => {
    processTurn(`[System]: Player sells ${item.name} for ${Math.floor((item.value || 0) * 0.5)} gold.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#1c1917] border border-[#44403c] rounded-2xl max-w-4xl w-full flex flex-col h-[80vh] shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#292524] bg-[#0c0a09] flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-900/20 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-display text-stone-100">Local Merchant</h2>
                    <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
                        <Coins className="w-4 h-4" />
                        <span>{gameState.player.gold} Gold Pieces</span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 text-stone-500 hover:text-stone-300 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Buy Column */}
            <div className="flex-1 p-6 border-r border-[#292524] flex flex-col">
                <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Available Wares
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {STOCK.map((item, i) => (
                        <div key={i} className="group p-4 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center hover:border-amber-500/30 transition-all">
                            <div>
                                <div className="font-bold text-stone-200">{item.name}</div>
                                <div className="text-[10px] text-stone-500">{item.description || "A quality item."}</div>
                            </div>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => buy(item)}
                                className="font-mono text-amber-500"
                            >
                                {item.value}g
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sell Column */}
            <div className="flex-1 p-6 bg-[#0c0a09]/30 flex flex-col">
                <h3 className="text-xs uppercase font-bold text-stone-500 tracking-widest mb-4 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Your Inventory
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {gameState.inventory.map((item, i) => (
                        <div key={i} className="p-4 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center group">
                             <div>
                                <div className="font-bold text-stone-300">{item.name}</div>
                                <div className="text-[10px] text-stone-600 uppercase tracking-tighter">{item.qty || 1} in possession</div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => sell(item)}
                                className="group-hover:text-red-400"
                            >
                                Sell {Math.floor((item.value || 0) * 0.5)}g
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-4 bg-black/40 border-t border-[#292524] text-center text-[10px] text-stone-600 uppercase tracking-widest">
            "Everything has a price, traveler. Some cost gold, others... something else."
        </div>
      </div>
    </div>
  );
};

export default MerchantModal;
