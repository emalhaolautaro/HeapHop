import React from 'react';
import { ShareNetwork, Lightning, Users, TrendUp } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ThreadMetrics } from '../../types';

interface ConcurrencyPanelProps {
    concurrency?: ThreadMetrics | null;
}

export const ConcurrencyPanel: React.FC<ConcurrencyPanelProps> = ({ concurrency }) => {
    if (!concurrency) return null;

    const totalSwitches = concurrency.voluntary + concurrency.nonvoluntary;
    const contentionRatio = totalSwitches > 0
        ? ((concurrency.nonvoluntary / totalSwitches) * 100).toFixed(1)
        : '0.0';

    const chartData = [
        { name: 'Voluntary', value: concurrency.voluntary, color: '#60a5fa' },
        { name: 'Nonvoluntary', value: concurrency.nonvoluntary, color: '#ec4899' },
    ];

    return (
        <div className="bg-card border border-border-main rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-text-main font-bold">
                <ShareNetwork size={20} className="text-blue-500" />
                <span>Thread Concurrency & Contentions</span>
            </div>

            {/* Thread stats row */}
            <div className="grid grid-cols-4 gap-3">
                <StatCard icon={<Users size={12} />} label="Threads" value={concurrency.threadCount.toString()} color="text-cyan-400" />
                <StatCard icon={<TrendUp size={12} />} label="Peak" value={concurrency.threadsPeak.toString()} color="text-violet-400" />
                <StatCard icon={<Lightning size={12} />} label="Voluntary" value={concurrency.voluntary.toLocaleString()} color="text-blue-400" />
                <StatCard icon={<Lightning size={12} className="text-pink-500" />} label="Forced" value={concurrency.nonvoluntary.toLocaleString()} color="text-pink-500" />
            </div>

            {/* Context switches chart */}
            <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={90} fontSize={10} stroke="#718096" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111315', borderColor: '#2D3748', borderRadius: '8px', color: '#E2E8F0' }}
                            itemStyle={{ color: '#E2E8F0' }}
                            formatter={(value: number | string | undefined) => [Number(value ?? 0).toLocaleString(), 'Switches']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="text-xs text-text-muted pt-2 border-t border-border-main flex justify-between">
                <span>Total: <strong className="text-text-main">{totalSwitches.toLocaleString()}</strong></span>
                <span>Contention: <strong className={parseFloat(contentionRatio) > 30 ? 'text-pink-500' : 'text-emerald-500'}>{contentionRatio}%</strong></span>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-card2 border border-ring p-3 rounded-lg flex flex-col items-center gap-1">
        <span className="text-text-muted text-[9px] font-bold tracking-widest uppercase flex items-center gap-1">
            {icon} {label}
        </span>
        <span className={`text-lg font-extrabold tracking-tight ${color}`}>{value}</span>
    </div>
);
