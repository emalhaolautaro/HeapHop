import React from 'react';
import { Recycle, Clock, TrendDown, TrendUp } from '@phosphor-icons/react';
import { GcMetrics } from '../../types';
import { StatCard } from './GCPanel';

interface GCPanelNativeProps {
    gc: GcMetrics;
    overheadPct: number;
}

export const GCPanelNative: React.FC<GCPanelNativeProps> = ({ gc, overheadPct }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <StatCard icon={<Recycle size={12} />} label="GC Cycles" value={gc.gcCount.toString()} color="text-emerald-400" />
            <StatCard icon={<Clock size={12} />} label="Avg Pause" value={`${gc.avgPauseMs.toFixed(2)}ms`} color="text-amber-400" />
            <StatCard icon={<TrendUp size={12} />} label="Max Pause" value={`${gc.maxPauseMs.toFixed(2)}ms`} color="text-pink-500" />
            <StatCard icon={<TrendUp size={12} />} label="Std Dev" value={`${gc.pauseStdDevMs.toFixed(2)}ms`} color="text-violet-400" />
            <StatCard icon={<TrendDown size={12} />} label="Total Pause" value={`${gc.totalPauseMs.toFixed(1)}ms`} color="text-blue-400" />
            <StatCard icon={<TrendUp size={12} />} label="Overhead" value={`${overheadPct.toFixed(2)}%`} color="text-rose-400" />
        </div>
    );
};
