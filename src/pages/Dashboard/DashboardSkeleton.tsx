import React from 'react';
import {ChartBar, Info} from '@phosphor-icons/react';

export const DashboardSkeleton: React.FC = () => {
 return (
 <div className="flex-1 w-full h-full flex flex-col items-center justify-center border border-dashed border-border-main rounded-2xl bg-card/50 p-8 text-center animate-pulse">
 <div className="w-16 h-16 bg-card2 rounded-full flex items-center justify-center mb-6 shadow-sm border border-ring">
 <ChartBar size={32} className="text-text-muted" weight="duotone" />
 </div>

 <h2 className="text-xl font-bold text-text-main mb-2">No Active Telemetry</h2>
 <p className="text-text-muted text-sm max-w-sm mb-8 leading-relaxed">
 The real-time observatory is currently idle. Configure your lab setup and run a test to start visualizing memory allocations and hardware efficiency.
 </p>

 <div className="bg-bg border border-border-main px-4 py-3 rounded-lg flex items-center gap-3 w-full max-w-md">
 <Info size={20} className="text-amber-500 shrink-0" weight="fill" />
 <span className="text-xs text-text-muted font-medium text-left">
 Head over to the <strong className="text-text-main">Settings</strong> tab to configure your compiler flags and select a binary to benchmark.
 </span>
 </div>
 </div>
 );
};
