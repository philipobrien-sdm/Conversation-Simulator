import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import ChatScreen from './components/ChatScreen';
import { Scenario } from './types';
import { getPersonaTips } from './services/geminiService';
import './index.css';

const App: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);

  const handleScenarioSelect = async (scenario: Scenario) => {
    try {
      const tips = await getPersonaTips(scenario);
      const scenarioWithTips: Scenario = {
        ...scenario,
        aiPersona: {
          ...scenario.aiPersona,
          ...tips,
        }
      };
      setCurrentScenario(scenarioWithTips);
    } catch (error) {
      console.error("Failed to get persona tips, starting scenario without them.", error);
      // Fallback to starting the scenario without tips if the API call fails
      setCurrentScenario(scenario);
    }
  };
  
  const handleExitChat = () => {
    setCurrentScenario(null);
  };

  return (
    <div className="App">
      {!currentScenario ? (
        <SetupScreen onScenarioSelect={handleScenarioSelect} />
      ) : (
        <ChatScreen scenario={currentScenario} onExit={handleExitChat} />
      )}
    </div>
  );
};

export default App;