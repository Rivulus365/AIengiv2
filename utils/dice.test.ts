
import { describe, it, expect, vi } from 'vitest';
import { rollDie, rollDice } from './dice';

describe('Dice Mechanics', () => {
    it('rolls within bounds for a d20', () => {
        for (let i = 0; i < 100; i++) {
            const result = rollDie('d20');
            expect(result.value).toBeGreaterThanOrEqual(1);
            expect(result.value).toBeLessThanOrEqual(20);
            expect(result.sides).toBe(20);
        }
    });

    it('rolls within bounds for a d6', () => {
        for (let i = 0; i < 100; i++) {
            const result = rollDie('d6');
            expect(result.value).toBeGreaterThanOrEqual(1);
            expect(result.value).toBeLessThanOrEqual(6);
            expect(result.sides).toBe(6);
        }
    });

    it('identifies critical hits on d20', () => {
        // Mock Math.random to return 0.99 (which floors to 19 + 1 = 20 for d20)
        const mathSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const result = rollDie('d20');
        expect(result.value).toBe(20);
        expect(result.isCrit).toBe(true);
        expect(result.isFail).toBe(false);
        mathSpy.mockRestore();
    });

    it('identifies critical fails on d20', () => {
        // Mock Math.random to return 0 (which floors to 0 + 1 = 1)
        const mathSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
        const result = rollDie('d20');
        expect(result.value).toBe(1);
        expect(result.isCrit).toBe(false);
        expect(result.isFail).toBe(true);
        mathSpy.mockRestore();
    });

    it('does not flag crit/fail on non-d20s', () => {
        const mathSpy = vi.spyOn(Math, 'random');
        
        // Force max value on d6 (returns 6)
        mathSpy.mockReturnValue(0.99); 
        const maxD6 = rollDie('d6');
        expect(maxD6.value).toBe(6);
        expect(maxD6.isCrit).toBe(false);

        // Force min value on d6 (returns 1)
        mathSpy.mockReturnValue(0);
        const minD6 = rollDie('d6');
        expect(minD6.value).toBe(1);
        expect(minD6.isFail).toBe(false);

        mathSpy.mockRestore();
    });

    it('generates multiple rolls correctly', () => {
        const results = rollDice(5, 'd10');
        expect(results).toHaveLength(5);
        results.forEach(r => {
            expect(r.type).toBe('d10');
            expect(r.sides).toBe(10);
        });
    });
});
