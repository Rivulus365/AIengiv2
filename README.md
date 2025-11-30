<div align="center">
<img width="1200" height="475" alt="Infinite Adventure Engine Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Infinite Adventure Engine

**Infinite Adventure Engine** is an AI-powered Role-Playing Game (RPG) engine that brings the tabletop experience to your browser. Powered by **Google Gemini**, it acts as an infinite Game Master, generating dynamic storylines, vivid descriptions, and reactive world-building on the fly.

## 🌟 Features

*   **AI Game Master**: Experience a never-ending campaign where your choices truly matter. The AI adapts the story, NPCs, and world events based on your actions.
*   **Deep Character Creation**: Build your hero with a robust system including:
    *   **Races**: Choose from diverse races with unique traits and bonuses.
    *   **Classes & Subclasses**: Define your playstyle with classic RPG classes and specialized subclasses.
    *   **Stats & Feats**: Customize your abilities and unlock powerful feats.
*   **Immersive Atmosphere**:
    *   **Dynamic Audio**: Ambient soundscapes that adapt to your location (dungeons, forests, taverns).
    *   **Visuals**: AI-generated imagery brings scenes and characters to life.
*   **Interactive Gameplay**:
    *   **Chat Interface**: Communicate naturally with the GM and NPCs.
    *   **Dice Rolling**: Integrated 3D dice animations for skill checks and combat.
    *   **Inventory & Equipment**: Manage your gear and loot.
*   **Persistence**: Save your progress and resume your adventure anytime with Firebase integration.

## 🛠️ Tech Stack

*   **Frontend**: [React](https://react.dev/) (v19), [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI**: [Google Gemini API](https://ai.google.dev/)
*   **Backend/Auth**: [Firebase](https://firebase.google.com/) (Auth, Firestore)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to run the Infinite Adventure Engine locally.

### Prerequisites

*   **Node.js**: Ensure you have Node.js installed (v18+ recommended).
*   **Firebase Project**: You need a Firebase project for authentication and database features.
*   **Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    *   Create a `.env.local` file in the root directory.
    *   Add your keys:
        ```env
        GEMINI_API_KEY=your_gemini_key
        FIREBASE_API_KEY=your_firebase_key
        FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
        FIREBASE_PROJECT_ID=your_project_id
        FIREBASE_STORAGE_BUCKET=your_project.appspot.com
        FIREBASE_MESSAGING_SENDER_ID=your_sender_id
        FIREBASE_APP_ID=your_app_id
        FIREBASE_MEASUREMENT_ID=your_measurement_id
        ```

4.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

5.  **Open in Browser**:
    Navigate to `http://localhost:3000` (or the URL shown in your terminal).

## 🚢 Production Deployment

To deploy this application to production (e.g., Vercel, Netlify, or Firebase Hosting):

1.  **Set Environment Variables**: In your hosting provider's dashboard, set the following environment variables (using the keys from your `.env.local`):
    *   `GEMINI_API_KEY`
    *   `FIREBASE_API_KEY`
    *   `FIREBASE_AUTH_DOMAIN`
    *   `FIREBASE_PROJECT_ID`
    *   `FIREBASE_STORAGE_BUCKET`
    *   `FIREBASE_MESSAGING_SENDER_ID`
    *   `FIREBASE_APP_ID`
    *   `FIREBASE_MEASUREMENT_ID`

2.  **Build Command**:
    ```bash
    npm run build
    ```

3.  **Output Directory**: `dist`

## 🎮 How to Play

1.  **Sign In**: Log in using your Google account (via Firebase Auth).
2.  **Create a Character**: Select your race, class, stats, and background.
3.  **Start Adventure**: The AI GM will set the scene. Type your actions in the chat!
4.  **Roll Dice**: When asked for a check (e.g., "Roll for initiative"), the game will handle the dice rolls.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT License](LICENSE)