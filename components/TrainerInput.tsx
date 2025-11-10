import React from 'react';

interface TrainerInputProps {
  options: {
    positive: string;
    neutral: string;
    negative: string;
  } | null;
  onOptionSelect: (optionText: string) => void;
  isLoading: boolean;
}

const TrainerInput: React.FC<TrainerInputProps> = ({ options, onOptionSelect, isLoading }) => {
  if (isLoading && !options) {
    return (
      <div className="text-center text-slate-400">
        <p>Analyzing AI's response and generating your options...</p>
         <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!options) {
    return null; // Or some other placeholder
  }

  // To prevent the order from always being the same
  const shuffledOptions = React.useMemo(() => {
    return [
      { type: 'positive', text: options.positive, color: 'border-green-500 hover:bg-green-500/10' },
      { type: 'neutral', text: options.neutral, color: 'border-yellow-500 hover:bg-yellow-500/10' },
      { type: 'negative', text: options.negative, color: 'border-red-500 hover:bg-red-500/10' },
    ].sort(() => Math.random() - 0.5);
  }, [options]);

  return (
    <div className="space-y-3">
        <p className="text-center text-sm text-slate-400 mb-3">Choose your response:</p>
        {shuffledOptions.map((option) => (
            <button
            key={option.type}
            onClick={() => onOptionSelect(option.text)}
            disabled={isLoading}
            className={`w-full text-left p-4 rounded-lg border-2 bg-slate-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${option.color}`}
            >
            {option.text}
            </button>
        ))}
    </div>
  );
};

export default TrainerInput;