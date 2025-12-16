
import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/audio';

interface DiceAnimationProps {
  target: number;
  type: 'player' | 'enemy';
  isCrit: boolean;
  isFail: boolean;
  onComplete?: () => void;
  soundEnabled: boolean;
}

const DiceAnimation: React.FC<DiceAnimationProps> = ({ target, type, isCrit, isFail, onComplete, soundEnabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initAndRoll = async () => {
      // Use the ref directly to ensure we have the DOM element
      if (!containerRef.current) return;

      try {
        // Determine theme color based on roll result
        let themeColor = "#4b0082"; // Indigo (Default)
        if (isCrit) themeColor = "#f59e0b"; // Amber-500 (Gold)
        if (isFail) themeColor = "#dc2626"; // Red-600 (Danger)

        // Dynamic import to load the module from CDN
        const module = await import(/* @vite-ignore */ "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/dice-box.es.min.js");
        const DiceBox = module.default;

        // Initialize DiceBox with selector string
        // Removed 'lightIntensity' as it causes 'reading setValue' errors in internal Three.js shaders in this version
        const box = new DiceBox(
          '#dice-container', 
          {
            assetPath: "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/assets/",
            theme: "default",
            scale: 6,
            gravity: 3,
            themeColor: themeColor,
            textColor: "#ffffff",
            friction: 0.8,
            restitution: 0.5,
          }
        );

        await box.init();
        if (!mounted) return;

        boxRef.current = box;

        // Reveal canvas
        if (box.renderer?.domElement) {
          box.renderer.domElement.style.display = 'block';
        }

        // Small delay to ensure renderer is ready before rolling
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!mounted) return;

        // Construct roll configuration
        const rollConfig = {
            sides: 20,
            themeColor: themeColor,
            value: target 
        };

        try {
            await box.roll([rollConfig]);
        } catch (rollError) {
            console.warn("Dice roll error, attempting fallback", rollError);
            // Fallback: simple string roll if object config fails internal validation
            await box.roll("1d20");
        }

        // Wait for roll animation + reading time
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (mounted && onComplete) {
          onComplete();
        }

      } catch (error) {
        console.error("Dice Engine Critical Error:", error);
        // Fail gracefully so the game doesn't hang
        if (mounted && onComplete) onComplete();
      }
    };

    initAndRoll();

    return () => {
      mounted = false;
      // Cleanup
      if (boxRef.current) {
        try {
            // Hide canvas immediately
            if (boxRef.current.renderer?.domElement) {
                boxRef.current.renderer.domElement.style.display = 'none';
            }
            // Clear dice
            boxRef.current.clear();
        } catch (e) {
            // Ignore cleanup errors
        }
      }
      // Clean up DOM just in case the library left a canvas
      if (containerRef.current) {
          containerRef.current.innerHTML = '';
      }
    };
  }, [target, isCrit, isFail, onComplete]);

  return (
    <div 
      ref={containerRef}
      id="dice-container"
      className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center bg-black/10 backdrop-blur-[1px]"
    >
        {/* The library injects the canvas here */}
    </div>
  );
};

export default DiceAnimation;
