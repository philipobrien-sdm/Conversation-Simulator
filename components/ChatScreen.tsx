import React, {
    useState,
    useRef,
    useEffect
} from 'react';
import {
    ChatMessage as ChatMessageType,
    Scenario,
    AiMetrics
} from '../types';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import MetricsDisplay from './MetricsDisplay';
import ReplayControls from './ReplayControls';
import TrainerInput from './TrainerInput'; // New import
import {
    getAiResponse,
    analyzeUserMessage,
    getSuggestions,
    getTrainerOptions // New import
} from '../services/geminiService';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface ChatScreenProps {
    scenario: Scenario;
    onExit: () => void;
}

const ChatScreen: React.FC < ChatScreenProps > = ({
    scenario,
    onExit
}) => {
    const [fullHistory, setFullHistory] = useState < ChatMessageType[] > ([]);
    const [currentMetrics, setCurrentMetrics] = useState < AiMetrics > (scenario.initialMetrics);
    const [isLoading, setIsLoading] = useState(false);
    const [isReplayMode, setIsReplayMode] = useState(false);
    const [replayStep, setReplayStep] = useState(0);
    const [trainerOptions, setTrainerOptions] = useState<{positive: string, neutral: string, negative: string} | null>(null);

    const chatContainerRef = useRef < HTMLDivElement > (null);

    const fetchTrainerOptions = async (history: ChatMessageType[]) => {
        if (scenario.trainerMode) {
            setTrainerOptions(null); // Clear old options
            const options = await getTrainerOptions(history, scenario);
            setTrainerOptions(options);
        }
    };

    // Initial message from AI
    useEffect(() => {
        const initialMessage: ChatMessageType = {
            id: '0',
            sender: 'ai',
            text: scenario.initialAiMessage,
            metrics: scenario.initialMetrics,
        };
        setFullHistory([initialMessage]);
        setCurrentMetrics(scenario.initialMetrics);
        setReplayStep(1);
        fetchTrainerOptions([initialMessage]); // Fetch options for the first turn
    }, [scenario]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [fullHistory, isReplayMode]);

    const handleSendMessage = async (message: string) => {
        setIsLoading(true);
        if (scenario.trainerMode) {
            setTrainerOptions(null);
        }

        const userMessage: ChatMessageType = {
            id: `${fullHistory.length}`,
            sender: 'user',
            text: message,
            metrics: currentMetrics, // Metrics before analysis
        };

        setFullHistory(prev => [...prev, userMessage, {
            id: 'loading',
            sender: 'ai',
            text: '...',
            metrics: currentMetrics
        }]);

        const analysisResult = await analyzeUserMessage(fullHistory, scenario, message);
        const userMessageWithAnalysis: ChatMessageType = {
            ...userMessage,
            metrics: analysisResult,
            analysis: {
                reason: analysisResult.changeReason || '',
                persuasion: analysisResult.deltas?.persuasion || 0,
                agreement: analysisResult.deltas?.agreement || 0,
                engagement: analysisResult.deltas?.engagement || 0,
                agitation: analysisResult.deltas?.agitation || 0,
            }
        };

        const historyWithAnalyzedUserMessage = [...fullHistory, userMessageWithAnalysis];
        
        const { text: aiText, insight: aiInsight } = await getAiResponse(historyWithAnalyzedUserMessage, scenario);
        const aiMessage: ChatMessageType = {
            id: `${historyWithAnalyzedUserMessage.length}`,
            sender: 'ai',
            text: aiText,
            insight: aiInsight,
            metrics: analysisResult,
        };

        const newFullHistory = [...historyWithAnalyzedUserMessage, aiMessage];
        setFullHistory(newFullHistory);
        setCurrentMetrics(analysisResult);
        setIsLoading(false);
        setReplayStep(newFullHistory.length);

        // Fetch next set of trainer options
        fetchTrainerOptions(newFullHistory);
    };

    const handleGetSuggestions = async () => {
        return getSuggestions(fullHistory, scenario);
    };

    const handleReplayStepChange = (step: number) => {
        setReplayStep(step);
    }
    
    const displayedHistory = isReplayMode ? fullHistory.slice(0, replayStep) : fullHistory;
    const displayedMetrics = isReplayMode ? (fullHistory[replayStep - 1]?.metrics || scenario.initialMetrics) : currentMetrics;

    const renderInput = () => {
        if (isReplayMode) {
            return (
                <ReplayControls
                    currentStep={replayStep}
                    totalSteps={fullHistory.filter(m => m.id !== 'loading').length}
                    onStepChange={handleReplayStepChange}
                />
            );
        }
        if (scenario.trainerMode) {
            return (
                <TrainerInput
                    options={trainerOptions}
                    onOptionSelect={handleSendMessage}
                    isLoading={isLoading}
                />
            );
        }
        return (
            <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                showSuggestions={scenario.suggestionsEnabled}
                onGetSuggestions={handleGetSuggestions}
                aiPersona={scenario.aiPersona}
            />
        );
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-white">
            <header className="bg-slate-800 p-4 border-b border-slate-700 shadow-md flex justify-between items-center space-x-4">
                <div className="flex-grow min-w-0">
                    <h1 className="text-xl font-bold text-cyan-400 truncate">{scenario.title}</h1>
                    <p className="text-sm text-slate-400 truncate">
                        vs. 
                        <span className="font-semibold text-slate-300 ml-1">
                          {scenario.aiPersona.name}
                        </span>
                    </p>
                </div>
                 <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="replay-toggle" className="text-sm font-medium text-slate-400">Replay</label>
                        <button
                            id="replay-toggle"
                            onClick={() => setIsReplayMode(!isReplayMode)}
                            className={`${
                                isReplayMode ? 'bg-cyan-600' : 'bg-slate-600'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                        >
                            <span className={`${
                                isReplayMode ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                    <button onClick={onExit} className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">End Session</button>
                </div>
            </header>

            <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayedHistory.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
            </main>
            
            <footer className="p-4 bg-slate-900/80 backdrop-blur-sm">
                <p className="text-sm text-slate-400 mb-2 font-medium">Your Objective: <span className="text-slate-300">{scenario.userObjective}</span></p>
                <MetricsDisplay metrics={displayedMetrics} />
                <div className="mt-4">{renderInput()}</div>
            </footer>
        </div>
    );
};

export default ChatScreen;