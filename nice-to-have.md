# Nice-to-Have Features & Future Ideas

This document outlines potential features, improvements, and experimental ideas for the Infinite Adventure Engine. These are non-critical but would significantly enhance the player experience and technical robustness of the project.

## 🧠 AI & Narrative Enhancements

- [ ] **Multi-Model Support**:
    - Allow users to switch between different Gemini models (e.g., Flash for speed, Pro for reasoning) or even other providers (OpenAI, Anthropic) via configuration.
- [ ] **Long-Term Memory / Lorebook**:
    - Implement a vector database (like Pinecone or local embeddings) to store "facts" about the world, NPCs, and past events.
    - Retrieve relevant lore based on the current context to maintain consistency over very long campaigns.
- [ ] **Personality Traits for NPCs**:
    - Give key NPCs hidden personality stats (e.g., Trust, Fear, Greed) that evolve based on player interactions.
- [ ] **Procedural Map Generation**:
    - Instead of just text descriptions, generate a 2D grid or hex map of the local area or dungeon using a canvas overlay or a library like `rot.js`.

## 🎮 Advanced Gameplay Mechanics

- [ ] **Multiplayer / Party Mode**:
    - Allow multiple players to join the same campaign session via WebSockets or Firebase Realtime Database.
    - The AI acts as the GM for the entire group.
- [ ] **Complex Crafting System**:
    - Allow players to combine loot items to create new gear.
    - AI generates the stats/recipe for the new item dynamically.
- [ ] **Skill Trees & visual Progression**:
    - Visual representation of the skill tree instead of just a list.
    - Interactive selection of new perks upon leveling up.
- [ ] **Quest Log System**:
    - Explicitly track active, completed, and failed quests in a dedicated UI panel.
    - Parse quest objectives from the AI narrative.

## 🎨 Immersive UI/UX

- [ ] **Voice Input (Speech-to-Text)**:
    - Allow players to speak their actions instead of typing.
- [ ] **Text-to-Speech (TTS)**:
    - Have the GM narrate the story and NPCs speak with distinct AI-generated voices (e.g., using ElevenLabs or browser APIs).
- [ ] **Dynamic Avatar Generation**:
    - Generate visual avatars for the player character based on their race, class, and equipment.
    - Update the avatar as equipment changes.
- [ ] **Theme Customization**:
    - Allow users to switch UI themes (e.g., Dark Fantasy, Sci-Fi, Parchment/Paper style).

## 🛠️ Technical Improvements

- [ ] **Offline PWA Support**:
    - Make the app a fully installable Progressive Web App (PWA) with offline capabilities (caching assets, queuing actions).
- [ ] **Performance Optimization**:
    - Virtualize long chat lists to improve rendering performance.
    - Optimize image loading and caching strategies.
- [ ] **Accessibility (a11y)**:
    - Ensure full keyboard navigation support.
    - Improve ARIA labels and screen reader compatibility.
- [ ] **Analytics**:
    - Track anonymous usage statistics (e.g., average session length, most popular classes) to guide future balancing.

## 🧪 Experimental

- [ ] **Dungeon Master Mode**:
    - A mode where the *player* is the DM and the *AI* plays the adventurers.
- [ ] **Campaign Export**:
    - Export the entire chat log as a formatted PDF or E-book "novel" of the adventure.
