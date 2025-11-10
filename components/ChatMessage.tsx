import React from 'react';
import { ChatMessage } from '../types';
import { InfoIcon } from './icons';

interface ChatMessageProps {
  message: ChatMessage;
}

const AnalysisTooltipContent: React.FC<{ analysis: ChatMessage['analysis'] }> = ({ analysis }) => {
    if (!analysis) return null;

    const formatDelta = (delta: number) => {
        const sign = delta > 0 ? '+' : '';
        const color = delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-slate-400';
        return <span className={color}>{sign}{delta}%</span>;
    };

    return (
        <div>
            <p className="mb-2"><span className="font-bold text-cyan-400">Analysis: </span>{analysis.reason}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
                <span>Persuasion:</span><span className="text-right">{formatDelta(analysis.persuasion)}</span>
                <span>Agreement:</span><span className="text-right">{formatDelta(analysis.agreement)}</span>
                <span>Engagement:</span><span className="text-right">{formatDelta(analysis.engagement)}</span>
                <span>Agitation:</span><span className="text-right">{formatDelta(analysis.agitation)}</span>
            </div>
        </div>
    );
};

const ChatMessageBubble: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAi = message.sender === 'ai';
  const isLoading = message.text === '...';

  const bubbleClasses = isUser
    ? 'bg-cyan-600 text-white self-end'
    : 'bg-slate-700 text-slate-200 self-start';
  
  const hasInsight = isAi && message.insight;
  const hasAnalysis = isUser && message.analysis;

  if (isLoading) {
     return (
        <div className="flex justify-start">
            <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md ${bubbleClasses}`}>
                 <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
     );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="tooltip-container">
        <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md ${bubbleClasses}`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        {(hasInsight || hasAnalysis) && (
          <>
            <div className={`absolute top-0 ${isUser ? '-left-5' : '-right-5'} cursor-pointer`}>
              <InfoIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 pointer-events-none z-20 shadow-lg">
              {hasInsight && <><span className="font-bold text-cyan-400">Insight: </span>{message.insight}</>}
              {hasAnalysis && <AnalysisTooltipContent analysis={message.analysis} />}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;