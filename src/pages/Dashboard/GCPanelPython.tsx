import React from 'react';
import { Recycle, Clock, TrendDown, TrendUp, Drop } from '@phosphor-icons/react';
import { GcMetrics } from '../../types';
import { formatMB, formatKB, StatCard } from './GCPanel';

interface GCPanelPythonProps {
    gc: GcMetrics;
    overheadPct: number;
}

export const GCPanelPython: React.FC<GCPanelPythonProps> = ({ gc, overheadPct }) => {
    return (
        <>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <StatCard icon={<Drop size={14} />} label="Current" value={formatMB(gc.heapAfterMb)} color="text-blue-400" />
                <StatCard icon={<TrendUp size={14} />} label="Peak" value={formatKB(gc.tracemallocPeakKb!)} color="text-amber-400" />
            </div>
            {gc.gcCount > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <StatCard icon={<Recycle size={12} />} label="GC Cycles" value={gc.gcCount.toString()} color="text-emerald-400" />
                    <StatCard icon={<Clock size={12} />} label="Avg Pause" value={`${gc.avgPauseMs.toFixed(2)}ms`} color="text-amber-400" />
                    <StatCard icon={<TrendUp size={12} />} label="Max Pause" value={`${gc.maxPauseMs.toFixed(2)}ms`} color="text-pink-500" />
                    <StatCard icon={<TrendDown size={12} />} label="Total Pause" value={`${gc.totalPauseMs.toFixed(1)}ms`} color="text-blue-400" />
                    <StatCard icon={<TrendUp size={12} />} label="Overhead" value={`${overheadPct.toFixed(2)}%`} color="text-rose-400" />
                </div>
            )}
        </>
    );
};
