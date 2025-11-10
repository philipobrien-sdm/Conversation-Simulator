import React, { useState } from 'react';
import { Scenario } from '../types';
import { SCENARIOS } from '../constants';
import { PlusIcon, ChevronDownIcon } from './icons';
import CustomScenarioModal from './CustomScenarioModal';

interface SetupScreenProps {
  onScenarioSelect: (scenario: Scenario) => Promise<void>;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; id: string; }> = ({ checked, onChange, id }) => (
    <button
        id={id}
        onClick={onChange}
        className={`${
            checked ? 'bg-cyan-600' : 'bg-slate-600'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500`}
    >
        <span className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
    </button>
);


const SetupScreen: React.FC<SetupScreenProps> = ({ onScenarioSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configuredScenarios, setConfiguredScenarios] = useState<Scenario[]>(SCENARIOS);
  const [loadingScenarioId, setLoadingScenarioId] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleToggleChange = (scenarioId: string, field: 'suggestionsEnabled' | 'trainerMode', value: boolean) => {
    setConfiguredScenarios(prevScenarios =>
      prevScenarios.map(sc =>
        sc.id === scenarioId ? { ...sc, [field]: value } : sc
      )
    );
  };

  const handleStartScenario = async (scenario: Scenario) => {
    setLoadingScenarioId(scenario.id);
    await onScenarioSelect(scenario);
    // No need to setLoading(false) as the component will unmount
  };

  const handleCustomScenarioSubmit = (customScenario: Omit<Scenario, 'id' | 'initialMetrics'>) => {
    const newScenario: Scenario = {
      ...customScenario,
      id: `custom-${Date.now()}`,
      initialMetrics: { persuasion: 50, agreement: 50, engagement: 50, agitation: 10 },
    };
    setIsModalOpen(false);
    handleStartScenario(newScenario);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Conversation Simulator</h1>
          <p className="text-lg text-slate-400">Hone your communication skills in realistic scenarios.</p>
        </div>
        
        <div className="w-full max-w-3xl mx-auto mb-10">
          <div className="border border-slate-700 rounded-lg">
            <button
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700/50 rounded-t-lg transition-colors"
            >
              <h2 className="text-lg font-semibold text-slate-300">About & How to Use</h2>
              <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isAboutOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAboutOpen && (
              <div className="p-6 bg-slate-800/50 border-t border-slate-700 text-slate-400 space-y-4">
                <p><strong className="text-slate-200">What is this?</strong> This is an AI-powered simulator designed to help you practice and improve your communication skills. You'll engage in a role-play conversation with an AI persona in a specific scenario.</p>
                <div>
                  <strong className="text-slate-200">How to Use:</strong>
                  <ol className="list-decimal list-inside space-y-2 mt-2">
                    <li><span className="font-semibold">Choose a Scenario:</span> Select one of the pre-built scenarios or click "Create Your Own" to define a custom situation.</li>
                    <li><span className="font-semibold">Configure Options:</span> Use the toggles on each card to enable "Trainer Mode" for guided responses or "Show Suggestions" for on-demand conversational tips.</li>
                    <li><span className="font-semibold">Start the Conversation:</span> Click "Start Scenario" to enter the chat. The AI will provide its first message.</li>
                    <li><span className="font-semibold">Analyze & Respond:</span> As you chat, pay attention to the metrics at the bottom. Hover over messages and metrics to get AI-powered insights and analysis to guide your strategy.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {configuredScenarios.map((scenario) => (
            <div key={scenario.id} className="bg-slate-800 rounded-lg p-6 flex flex-col border border-slate-700 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
              <h2 className="text-2xl font-semibold text-white mb-3">{scenario.title}</h2>
              <p className="text-slate-400 flex-grow mb-4">{scenario.description}</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-700/50 mb-6">
                  <div className="flex items-center justify-between">
                      <label htmlFor={`suggestions-${scenario.id}`} className="text-sm font-medium text-slate-300 cursor-pointer">Show Suggestions (?)</label>
                      <ToggleSwitch 
                        id={`suggestions-${scenario.id}`}
                        checked={scenario.suggestionsEnabled} 
                        onChange={() => handleToggleChange(scenario.id, 'suggestionsEnabled', !scenario.suggestionsEnabled)} 
                      />
                  </div>
                  <div className="flex items-center justify-between">
                      <label htmlFor={`trainer-${scenario.id}`} className="text-sm font-medium text-slate-300 cursor-pointer">Trainer Mode</label>
                      <ToggleSwitch 
                        id={`trainer-${scenario.id}`}
                        checked={scenario.trainerMode}
                        onChange={() => handleToggleChange(scenario.id, 'trainerMode', !scenario.trainerMode)}
                      />
                  </div>
              </div>

              <button
                onClick={() => handleStartScenario(scenario)}
                disabled={!!loadingScenarioId}
                className="mt-auto bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 transition-colors w-full flex items-center justify-center disabled:bg-slate-600 disabled:cursor-wait"
              >
                {loadingScenarioId === scenario.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Start Scenario'
                )}
              </button>
            </div>
          ))}
          {/* Custom Scenario Card */}
          <div 
            onClick={() => !loadingScenarioId && setIsModalOpen(true)}
            className={`bg-slate-800/50 rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 transition-all duration-300 group ${loadingScenarioId ? 'cursor-not-allowed opacity-50' : 'hover:border-cyan-500 hover:bg-slate-800 cursor-pointer'}`}
          >
            <PlusIcon className="w-12 h-12 text-slate-600 group-hover:text-cyan-500 transition-colors mb-4" />
            <h2 className="text-2xl font-semibold text-slate-500 group-hover:text-white transition-colors">Create Your Own</h2>
          </div>
        </div>
        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Select a scenario or create your own to begin.</p>
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
      {isModalOpen && (
        <CustomScenarioModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleCustomScenarioSubmit} 
        />
      )}
    </>
  );
};

export default SetupScreen;