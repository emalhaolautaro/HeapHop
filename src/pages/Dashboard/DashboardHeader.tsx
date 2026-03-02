import React from 'react';
import { ChartLineUp } from '@phosphor-icons/react';

interface DashboardHeaderProps {
    runId?: string | null;
    isLive: boolean;
    onBack?: () => void;
}

const cleanRunId = (id: string | null) => {
    if (!id) return null;
    const parts = id.split('_');
    if (parts.length > 3) {
        return parts.slice(1).join(' ').replace('.json', '').replace(/__/g, ' » ');
    }
    return id.replace('.json', '');
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ runId, isLive, onBack }) => (
    <header className="flex items-center justify-between bg-card border border-border-main p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-card2 rounded-lg flex items-center justify-center text-amber-500 border border-ring">
                <ChartLineUp size={24} weight="bold" />
            </div>
            <div>
                <h2 className="text-text-main font-bold tracking-tight uppercase text-[10px] opacity-50 mb-0.5">Lab Results</h2>
                <h3 className="text-lg text-amber-500 font-bold tracking-tight leading-none">
                    {runId ? cleanRunId(runId) : 'TELEMETRY LIVE STREAM'}
                </h3>
            </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
            {isLive && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-500 text-[10px] uppercase tracking-widest font-bold">Live</span>
                </div>
            )}
            <button
                onClick={onBack}
                className="bg-card2 hover:bg-ring border border-ring text-text-main px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
                NEW EXPERIMENT
            </button>
        </div>
    </header>
);
