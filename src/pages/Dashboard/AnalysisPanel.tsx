import React from 'react';
import { HeapAnalysis } from '../../types';
import { Cube, Clock, ArrowsOutSimple, ChartBar } from '@phosphor-icons/react';
import { FreedRatioTooltip } from './FreedRatioTooltip';

interface AnalysisPanelProps {
    analysis?: HeapAnalysis | null;
    idleRssKb?: number | null;
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, idleRssKb }) => {
    if (!analysis) return null;

    const rawRatio = analysis.mallocCount > 0 ? (analysis.freeCount / analysis.mallocCount) * 100 : 0;
    const isGcOvershoot = rawRatio > 100;

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full animate-in slide-in-from-top-4 duration-500">
            <MetricCard icon={<ArrowsOutSimple size={14} />} label="Total Allocated" color="amber" value={formatBytes(analysis.totalAllocatedBytes)} />
            <MetricCard icon={<Cube size={14} />} label="Total Calls" color="emerald" value={`${analysis.mallocCount}`} unit="ops" />
            <MetricCard icon={<Clock size={14} />} label="Avg Lifespan" color="indigo" value={analysis.avgLifespanMs.toFixed(2)} unit="ms" />
            {idleRssKb != null && (
                <MetricCard icon={<Cube size={14} />} label="Idle Memory" color="violet" value={formatBytes(idleRssKb * 1024)} />
            )}
            <div className={`bg-card border border-border-main p-4 rounded-xl flex flex-col gap-2 shadow-sm hover:border-rose-500/30 transition-colors relative ${idleRssKb == null ? 'md:col-span-2' : ''}`}>
                <div className="flex items-center justify-between text-rose-500 opacity-80 uppercase text-[10px] font-bold tracking-widest">
                    <span className="flex items-center gap-2"><ChartBar size={14} /> Freed Ratio</span>
                    {isGcOvershoot && <div className="absolute top-4 right-4"><FreedRatioTooltip /></div>}
                </div>
                <div className="text-xl font-bold text-text-main font-mono">
                    {rawRatio.toFixed(2)}%
                    <span className="text-[10px] opacity-40 font-normal ml-1">freed</span>
                </div>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; color: string; value: string; unit?: string }> = ({ icon, label, color, value, unit }) => (
    <div className={`bg-card border border-border-main p-4 rounded-xl flex flex-col gap-2 shadow-sm hover:border-${color}-500/30 transition-colors`}>
        <div className={`flex items-center gap-2 text-${color}-500 opacity-80 uppercase text-[10px] font-bold tracking-widest`}>
            {icon} {label}
        </div>
        <div className="text-xl font-bold text-text-main font-mono">
            {value} {unit && <span className="text-[10px] opacity-40 font-normal">{unit}</span>}
        </div>
    </div>
);
