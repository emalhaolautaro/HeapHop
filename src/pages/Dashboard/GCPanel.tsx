import React from 'react';
import { Recycle } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GcMetrics, TelemetryDataPoint } from '../../types';

import { GCPanelPython } from './GCPanelPython';
import { GCPanelNative } from './GCPanelNative';

interface GCPanelProps {
    gc?: GcMetrics | null;
    telemetry?: TelemetryDataPoint[] | null;
}

export const GCPanel: React.FC<GCPanelProps> = ({ gc, telemetry }) => {
    if (!gc) return null;

    const isPython = gc.tracemallocPeakKb != null;

    let overheadPct = 0;
    if (telemetry && telemetry.length > 0) {
        const lastTelemetry = telemetry[telemetry.length - 1];
        if (lastTelemetry.timeMs > 0) {
            overheadPct = (gc.totalPauseMs / lastTelemetry.timeMs) * 100;
        }
    }

    const heapChartData = [
        { name: 'Before GC', value: gc.heapBeforeMb, color: '#f59e0b' },
        { name: 'After GC', value: gc.heapAfterMb, color: '#10b981' },
    ];

    return (
        <div className="bg-card border border-border-main rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-text-main font-bold">
                <Recycle size={20} className="text-emerald-500" />
                <span>{isPython ? 'Python Memory (tracemalloc)' : 'Garbage Collector'}</span>
            </div>

            {isPython ? (
                <GCPanelPython gc={gc} overheadPct={overheadPct} />
            ) : (
                <GCPanelNative gc={gc} overheadPct={overheadPct} />
            )}

            {gc.heapBeforeMb > 0 && (
                <div className="h-[100px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={heapChartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={80} fontSize={10} stroke="#E2E8F0" tick={{ fill: '#E2E8F0' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#202020ff', borderColor: '#2D3748', borderRadius: '8px', color: '#E2E8F0' }}
                                itemStyle={{ color: '#E2E8F0' }}
                                formatter={(value: number | string | undefined) => [`${Number(value ?? 0).toFixed(2)} MB`, 'Heap']}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {heapChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export const formatMB = (mb: number) => mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
export const formatKB = (kb: number) => kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb} KB`;

export const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-card2 border border-ring p-3 rounded-lg flex flex-col items-center gap-1 overflow-hidden">
        <span className="text-text-muted text-[9px] font-bold tracking-widest uppercase flex items-center gap-1 whitespace-nowrap">
            {icon} {label}
        </span>
        <span className={`text-sm md:text-base font-extrabold tracking-tight w-full text-center break-words ${color}`} title={value}>
            {value}
        </span>
    </div>
);
