import React from 'react';

const RewindIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0111.25 8.688v8.123z" /></svg>;
const ForwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" /></svg>;

interface ReplayControlsProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}

const ReplayControls: React.FC<ReplayControlsProps> = ({ currentStep, totalSteps, onStepChange }) => {

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStepChange(parseInt(e.target.value, 10));
  };

  const handleStepBackward = () => {
    onStepChange(Math.max(0, currentStep - 1));
  };

  const handleStepForward = () => {
    onStepChange(Math.min(totalSteps, currentStep + 1));
  };
  
  const buttonClass = "p-2 text-slate-300 hover:text-cyan-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-2 flex items-center justify-center space-x-4 rounded-b-lg">
      <button onClick={handleStepBackward} disabled={currentStep === 0} className={buttonClass} title="Step Backward">
        <RewindIcon />
      </button>
      
      <div className="flex-1 flex items-center space-x-3">
          <span className="text-sm text-slate-400 w-8 text-center">{currentStep}</span>
          <input
            type="range"
            min="0"
            max={totalSteps}
            value={currentStep}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span className="text-sm text-slate-400 w-8 text-center">{totalSteps}</span>
      </div>
      
       <button onClick={handleStepForward} disabled={currentStep === totalSteps} className={buttonClass} title="Step Forward">
        <ForwardIcon />
      </button>
    </div>
  );
};

export default ReplayControls;
