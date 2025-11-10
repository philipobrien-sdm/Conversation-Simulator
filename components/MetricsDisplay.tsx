import React from 'react';
import { AiMetrics } from '../types';

interface MetricBarProps {
  label: string;
  value: number;
  color: string;
  delta?: number;
  reason?: string;
}

const MetricBar: React.FC<MetricBarProps> = ({ label, value, color, delta, reason }) => {
  const deltaColor = delta && delta > 0 ? 'text-green-400' : 'text-red-400';
  const deltaSign = delta && delta > 0 ? '+' : '';

  return (
    <div className="flex-1 tooltip-container">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-slate-300">{label}</span>
        <div className="flex items-center space-x-2">
            {delta !== undefined && (
                <span className={`text-xs font-bold ${deltaColor}`}>{deltaSign}{delta}%</span>
            )}
            <span className="text-xs font-bold text-white">{value}%</span>
        </div>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500 ease-out`} style={{ width: `${value}%` }}></div>
      </div>
      {reason && (
        <>
            <div className="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-slate-800 text-white text-xs rounded-lg py-2 px-3 pointer-events-none z-20 shadow-lg">
              {reason}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
            </div>
        </>
      )}
    </div>
  );
};


const MetricsDisplay: React.FC<{ metrics: AiMetrics }> = ({ metrics }) => {
  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-4">
      <MetricBar label="Persuasion" value={metrics.persuasion} color="bg-blue-500" delta={metrics.deltas?.persuasion} reason={metrics.changeReason} />
      <MetricBar label="Agreement" value={metrics.agreement} color="bg-green-500" delta={metrics.deltas?.agreement} reason={metrics.changeReason}/>
      <MetricBar label="Engagement" value={metrics.engagement} color="bg-yellow-400" delta={metrics.deltas?.engagement} reason={metrics.changeReason}/>
      <MetricBar label="Agitation" value={metrics.agitation} color="bg-red-500" delta={metrics.deltas?.agitation} reason={metrics.changeReason}/>
    </div>
  );
};

export default MetricsDisplay;