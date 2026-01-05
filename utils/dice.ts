
import { DieType, RollData } from '../types';

export const rollDie = (type: DieType, source: 'player' | 'enemy' = 'player'): RollData => {
    const sides = parseInt(type.substring(1));
    const value = Math.floor(Math.random() * sides) + 1;
    
    return {
        value,
        sides,
        type,
        isCrit: value === sides && sides === 20,
        isFail: value === 1 && sides === 20,
        source,
        label: type.toUpperCase()
    };
};

export const rollDice = (count: number, type: DieType, source: 'player' | 'enemy' = 'player'): RollData[] => {
    return Array.from({ length: count }, () => rollDie(type, source));
};
