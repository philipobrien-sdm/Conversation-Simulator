import React, { useState } from 'react';
import { AiPersona, Scenario } from '../types';
import { CloseIcon, SparklesIcon } from './icons';
import { getScenarioSuggestions } from '../services/geminiService';

interface CustomScenarioModalProps {
  onClose: () => void;
  onSubmit: (scenarioData: Omit<Scenario, 'id' | 'initialMetrics'>) => void;
}

const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    userObjective: '',
    aiPersonaName: '',
    aiPersonaRole: '',
    aiPersonaKeyTraits: '', // Stored as comma-separated string
    aiPersonaMotivations: '',
    initialAiMessage: '',
    suggestionsEnabled: true,
    trainerMode: false,
  });

  const [suggestionPrompt, setSuggestionPrompt] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const isFormValid = formData.title && formData.description && formData.userObjective && formData.aiPersonaName && formData.aiPersonaRole && formData.aiPersonaKeyTraits && formData.aiPersonaMotivations && formData.initialAiMessage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      const { aiPersonaName, aiPersonaRole, aiPersonaKeyTraits, aiPersonaMotivations, ...rest } = formData;
      const scenarioData = {
        ...rest,
        aiPersona: {
          name: aiPersonaName,
          role: aiPersonaRole,
          keyTraits: aiPersonaKeyTraits.split(',').map(trait => trait.trim()).filter(Boolean),
          motivations: aiPersonaMotivations,
        },
      };
      onSubmit(scenarioData);
    }
  };

  const handleSuggestScenario = async () => {
      if (!suggestionPrompt.trim()) return;
      setIsSuggesting(true);
      try {
          const suggestions = await getScenarioSuggestions(suggestionPrompt);
          setFormData(prev => ({
              ...prev,
              title: suggestions.title,
              description: suggestions.description,
              userObjective: suggestions.userObjective,
              aiPersonaName: suggestions.aiPersonaName,
              aiPersonaRole: suggestions.aiPersonaRole,
              aiPersonaKeyTraits: suggestions.aiPersonaKeyTraits.join(', '),
              aiPersonaMotivations: suggestions.aiPersonaMotivations,
              initialAiMessage: suggestions.initialAiMessage,
          }));
      } catch (error) {
          console.error("Failed to fetch scenario suggestions", error);
      } finally {
          setIsSuggesting(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
            <h2 className="text-2xl font-bold text-cyan-400">Create Custom Scenario</h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="p-4 bg-slate-900/50 rounded-lg">
                <label htmlFor="suggestion-prompt" className="block text-sm font-medium text-slate-300 mb-2">Need an idea? Let the AI help.</label>
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        id="suggestion-prompt"
                        value={suggestionPrompt}
                        onChange={(e) => setSuggestionPrompt(e.target.value)}
                        className="flex-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="e.g., A tough negotiation with a contractor..."
                    />
                    <button 
                        type="button" 
                        onClick={handleSuggestScenario}
                        disabled={isSuggesting || !suggestionPrompt.trim()}
                        className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 transition-colors flex items-center disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        {isSuggesting ? (
                             <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Suggest
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            <div className="border-t border-slate-700 my-2"></div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Scenario Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., Asking for a Raise" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Your Role / Scenario Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., You are an employee who has taken on more responsibility and wants to ask for a raise." required></textarea>
            </div>
            <div>
              <label htmlFor="userObjective" className="block text-sm font-medium text-slate-300 mb-1">Your Objective</label>
              <textarea name="userObjective" id="userObjective" value={formData.userObjective} onChange={handleChange} rows={2} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., Convince my manager I deserve a 20% salary increase." required></textarea>
            </div>
            
            <div className="p-4 bg-slate-900/50 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-slate-200">AI Persona Details</h3>
                <div>
                  <label htmlFor="aiPersonaName" className="block text-sm font-medium text-slate-300 mb-1">AI's Name</label>
                  <input type="text" name="aiPersonaName" id="aiPersonaName" value={formData.aiPersonaName} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., Sarah" required />
                </div>
                 <div>
                  <label htmlFor="aiPersonaRole" className="block text-sm font-medium text-slate-300 mb-1">AI's Role</label>
                  <input type="text" name="aiPersonaRole" id="aiPersonaRole" value={formData.aiPersonaRole} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., Hiring Manager" required />
                </div>
                <div>
                  <label htmlFor="aiPersonaKeyTraits" className="block text-sm font-medium text-slate-300 mb-1">AI's Key Traits (comma-separated)</label>
                  <input type="text" name="aiPersonaKeyTraits" id="aiPersonaKeyTraits" value={formData.aiPersonaKeyTraits} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., Budget-conscious, Values talent, Professional" required />
                </div>
                <div>
                  <label htmlFor="aiPersonaMotivations" className="block text-sm font-medium text-slate-300 mb-1">AI's Motivations</label>
                  <textarea name="aiPersonaMotivations" id="aiPersonaMotivations" value={formData.aiPersonaMotivations} onChange={handleChange} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., To hire the best candidate while staying within budget." required></textarea>
                </div>
            </div>

            <div>
              <label htmlFor="initialAiMessage" className="block text-sm font-medium text-slate-300 mb-1">AI's First Message</label>
              <textarea name="initialAiMessage" id="initialAiMessage" value={formData.initialAiMessage} onChange={handleChange} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 'Hi, thanks for coming in. What did you want to discuss?'" required></textarea>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
              <div className="space-y-2">
                 <div className="flex items-center">
                    <input type="checkbox" name="suggestionsEnabled" id="suggestionsEnabled" checked={formData.suggestionsEnabled} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500" />
                    <label htmlFor="suggestionsEnabled" className="ml-2 block text-sm text-slate-300">Enable 'Get Suggestions' (?) button</label>
                 </div>
                 <div className="flex items-center">
                    <input type="checkbox" name="trainerMode" id="trainerMode" checked={formData.trainerMode} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500" />
                    <label htmlFor="trainerMode" className="ml-2 block text-sm text-slate-300">Enable Trainer Mode (guided choices)</label>
                 </div>
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-900/50 flex justify-end sticky bottom-0">
            <button type="button" onClick={onClose} className="mr-3 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 transition-colors disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed">Save & Start</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomScenarioModal;
