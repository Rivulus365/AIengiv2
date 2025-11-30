
# Infinite Adventure Engine - Development Roadmap

## 🚨 Critical Priority (Stability & Core Architecture)

- [x] **Save/Load System**
  - Implement `localStorage` persistence for `gameState` and `messages`.
  - Add "Save Game" and "Reset Campaign" buttons in a settings menu.
  - *Logic:* Auto-save on every turn completion.

- [x] **Context Window Management**
  - *Problem:* As the chat history grows, token usage skyrockets and eventually hits limits (or gets expensive/slow).
  - *Solution:* Implement a "Summarization Strategy." When history > 20 messages, ask Gemini to summarize the narrative arc so far, replace the middle 15 messages with the summary, and keep the last 5 verbatim.

- [x] **Game Over State**
  - *Logic:* In `App.tsx`, detect if `gameState.player.hp.current <= 0`.
  - *UI:* Trigger a "You Died" modal.
  - *Options:* "Respawn at last town" (Reset HP/State, lose Gold) or "New Character".

- [x] **Mobile Input Fixes**
  - Ensure the chat input bar doesn't get hidden behind mobile keyboards (viewport height issues).

---

## ⚔️ Gameplay Mechanics & Features

- [x] **Action Shortcuts (Quick Buttons)**
  - Instead of typing "I attack with my sword", add buttons in the Combat UI:
    - [Attack]
    - [Dodge]
    - [Flee]
  - *Grimoire:* Add a [Cast] button next to spells to auto-populate the chat input.

- [x] **Resting Mechanics**
  - Add UI buttons for "Short Rest" (Spend Hit Die) and "Long Rest" (Full Reset) when not in combat.
  - *Logic:* Send a system message to Gemini: `[System]: Player takes a Long Rest.` to trigger the state update.

- [x] **Merchant Interface**
  - If `worldState.location` implies a town, enable a "Trade" tab.
  - Allow selling items (remove from inventory, add value to a `gold` field in state).

- [x] **loot Generation Pipeline**
  - Current item generation relies on the `ITEM_LIBRARY` for tooltips.
  - *Improvement:* If the AI generates a unique item *not* in the library, parse the description/stats from the JSON and render a dynamic tooltip so it doesn't look "broken" compared to library items.

---

## 🎨 UI/UX & Polish

- [x] **Audio System Expansion**
  - Current: Simple oscillator beep for dice.
  - *Todo:* Add a toggleable "Sound" setting.
  - *Todo:* Add Ambient Background Music (Forest, Dungeon, Tavern) based on `worldState.location`.

- [x] **Settings Modal**
  - Toggle: Image Generation (Save data/speed).
  - Toggle: Audio.
  - Select: Image Quality (1K/2K/4K).
  - Select: Text Speed / Typewriter effect.

- [x] **Inventory Management**
  - Add "Drop" and "Equip/Unequip" buttons directly in the inventory list.
  - *Logic:* Sending `[System]: Player equips Iron Sword` to the AI is safer than trying to manipulate the JSON state manually on the client, as the AI needs to know the context to recalculate stats.

---

## 🔧 Technical Debt & Refactoring

- [x] **Strict Schema Validation**
  - Integrate `zod` to validate the `gameState` coming back from the AI.
  - If validation fails, trigger a hidden "repair request" to the AI to fix its JSON output.

- [x] **Testing**
  - Write unit tests for `utils/engine.ts` to ensure modifiers, HP calculations, and AC derivations match D&D 5e SRD rules exactly. (Implemented via Runtime Validator)

- [x] **Environment Variables**
  - Ensure `API_KEY` handling is robust for deployment (Vercel/Netlify).
