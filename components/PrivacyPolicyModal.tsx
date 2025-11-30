
import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#1c1917] border border-[#44403c] rounded-lg max-w-2xl w-full h-[80vh] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#292524] flex justify-between items-center bg-[#0c0a09]">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-display text-amber-500 tracking-wide">Privacy Policy</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-stone-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6 text-stone-300 font-serif leading-relaxed">
          <section>
            <h3 className="text-stone-100 font-bold mb-2">1. Introduction</h3>
            <p>Welcome to the Infinite Adventure Engine. This Privacy Policy explains how we handle your data within this text-based RPG simulation.</p>
          </section>

          <section>
            <h3 className="text-stone-100 font-bold mb-2">2. Data Collection</h3>
            <p>We strictly prioritize user privacy. The Infinite Adventure Engine is a client-side application. We do not store your personal data, game state, or chat logs on our own servers.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-400">
              <li>**Browser Storage:** Your game progress (Game State) and chat history are stored locally in your browser's <code>IndexedDB</code> database. Authentication state is stored in <code>localStorage</code>.</li>
              <li>**API Interaction:** Text inputs are sent to the Google Gemini API solely for the purpose of generating narrative responses.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-stone-100 font-bold mb-2">3. Third-Party Services</h3>
            <p>This application utilizes Google's Generative AI (Gemini) API. By using this app, you acknowledge that your prompt data is processed by Google in accordance with their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Privacy Policy</a>.</p>
          </section>

          <section>
            <h3 className="text-stone-100 font-bold mb-2">4. User Responsibility</h3>
            <p>Do not enter sensitive personal information (PII), passwords, or financial data into the chat interface. The AI model processing your input should be treated as a public processor.</p>
          </section>

          <section>
            <h3 className="text-stone-100 font-bold mb-2">5. Updates</h3>
            <p>We may update this policy periodically. Continued use of the application signifies your acceptance of any changes.</p>
          </section>
          
          <div className="pt-8 text-center text-xs text-stone-600">
            Last Updated: October 2023
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#292524] bg-[#0c0a09] flex justify-end">
           <button 
              onClick={onClose}
              className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition-colors"
           >
              Close
           </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
