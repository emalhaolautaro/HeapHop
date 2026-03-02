import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HeapAnalysis } from '../../types';

interface SizeDistributionHistogramProps {
    analysis?: HeapAnalysis | null;
}

export const SizeDistributionHistogram: React.FC<SizeDistributionHistogramProps> = ({ analysis }) => {
    if (!analysis || !analysis.sizeDistribution || Object.keys(analysis.sizeDistribution).length === 0) {
        return (
            <div className="bg-card border border-border-main p-6 rounded-xl shadow-sm w-full h-[350px] flex flex-col">
                <h3 className="text-text-main font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest opacity-60">
                    Block Size Distribution
                </h3>
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
                    No distribution data available.
                </div>
            </div>
        );
    }

    // Convert Record<number, number> to Array<{size: string, count: number}>
    // And group by buckets (e.g. power of 2) for better visualization
    const rawData = Object.entries(analysis.sizeDistribution).map(([size, count]) => ({
        size: parseInt(size),
        count: count
    })).sort((a, b) => a.size - b.size);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0B';
        const k = 1024;
        if (bytes < k) return `${bytes}B`;
        if (bytes < k * k) return `${(bytes / k).toFixed(0)}K`;
        return `${(bytes / (k * k)).toFixed(0)}M`;
    };

    return (
        <div className="bg-card border border-border-main p-6 rounded-xl shadow-sm w-full h-[400px] flex flex-col">
            <h3 className="text-text-main font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest opacity-60">
                Block Size Distribution
            </h3>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rawData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                        <XAxis
                            dataKey="size"
                            tickFormatter={formatBytes}
                            fontSize={10}
                            stroke="#718096"
                        />
                        <YAxis
                            fontSize={10}
                            stroke="#718096"
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111315', borderColor: '#2D3748', borderRadius: '8px', color: '#E2E8F0' }}
                            labelFormatter={(val) => `Block Size: ${formatBytes(val as number)}`}
                        />
                        <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]}>
                            {rawData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(35, 90%, ${Math.max(30, 70 - index * 5)}%)`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
