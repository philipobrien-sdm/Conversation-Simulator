import React, { useState } from 'react';
import { AiPersona } from '../types';
import { SendIcon, HelpIcon, CloseIcon, PersonIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  showSuggestions: boolean;
  onGetSuggestions: () => Promise<string[]>;
  aiPersona: AiPersona;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, showSuggestions, onGetSuggestions, aiPersona }) => {
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isPersonaVisible, setIsPersonaVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      setSuggestions(null); // Close popovers on send
      setIsPersonaVisible(false);
    }
  };

  const handleSuggestionClick = async () => {
    setIsPersonaVisible(false); // Close other popover
    setSuggestionsLoading(true);
    const result = await onGetSuggestions();
    setSuggestions(result);
    setSuggestionsLoading(false);
  }

  const handlePersonaClick = () => {
    setSuggestions(null); // Close other popover
    setIsPersonaVisible(!isPersonaVisible);
  }

  return (
    <div className="relative">
      {isPersonaVisible && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg z-10">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-semibold text-cyan-400">{aiPersona.name}'s Persona</h3>
                <button onClick={() => setIsPersonaVisible(false)} className="text-slate-400 hover:text-white">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <div><span className="font-semibold text-slate-400">Role: </span>{aiPersona.role}</div>
              <div><span className="font-semibold text-slate-400">Key Traits: </span>{aiPersona.keyTraits.join(', ')}</div>
              <div><span className="font-semibold text-slate-400">Motivations: </span>{aiPersona.motivations}</div>
            </div>
            {(aiPersona.dos || aiPersona.donts) && (
              <div className="border-t border-slate-700 mt-3 pt-3 space-y-3 text-sm">
                {aiPersona.dos && (
                  <div>
                    <h4 className="font-semibold text-green-400 mb-1">Do:</h4>
                    <ul className="list-none space-y-1">
                      {aiPersona.dos.map((tip, i) => (
                        <li key={`do-${i}`} className="flex items-start"><CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span className="text-slate-300">{tip}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiPersona.donts && (
                  <div>
                    <h4 className="font-semibold text-red-400 mb-1">Don't:</h4>
                    <ul className="list-none space-y-1">
                      {aiPersona.donts.map((tip, i) => (
                        <li key={`dont-${i}`} className="flex items-start"><XCircleIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" /><span className="text-slate-300">{tip}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
        </div>
      )}
      {suggestions && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg z-10">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-cyan-400">Suggestions</h3>
                <button onClick={() => setSuggestions(null)} className="text-slate-400 hover:text-white">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <ul className="space-y-2">
                {suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 bg-slate-700/50 p-2 rounded-md">{s}</li>
                ))}
            </ul>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <button
            type="button"
            onClick={handlePersonaClick}
            disabled={isLoading}
            className="bg-slate-700 text-white rounded-full p-3 hover:bg-slate-600 disabled:opacity-50 transition-colors"
            title="View Persona Details"
        >
            <PersonIcon className="w-6 h-6" />
        </button>
        {showSuggestions && (
            <button
                type="button"
                onClick={handleSuggestionClick}
                disabled={isLoading || suggestionsLoading}
                className="bg-slate-700 text-white rounded-full p-3 hover:bg-slate-600 disabled:opacity-50 transition-colors"
                title="Get Suggestions"
            >
                {suggestionsLoading ? (
                    <div className="w-6 h-6 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <HelpIcon className="w-6 h-6" />
                )}
            </button>
        )}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-full py-3 px-5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="bg-cyan-600 text-white rounded-full p-3 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          title="Send Message"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;