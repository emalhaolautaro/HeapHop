import React, { useState } from 'react';
import { TelemetryDataPoint } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MainGraphProps {
    data?: TelemetryDataPoint[] | null;
}

const formatMemory = (kb: number) => {
    if (kb >= 1024 * 1024) {
        return `${(kb / 1024 / 1024).toFixed(2)} GB`;
    } else if (kb >= 1024) {
        return `${(kb / 1024).toFixed(1)} MB`;
    }
    return `${kb.toFixed(0)} KB`;
};

export const MainGraph: React.FC<MainGraphProps> = ({ data }) => {
    const [hiddenLines, setHiddenLines] = useState<string[]>([]);

    const toggleLine = (dataKey: string) => {
        setHiddenLines(prev =>
            prev.includes(dataKey)
                ? prev.filter(key => key !== dataKey)
                : [...prev, dataKey]
        );
    };

    return (
        <div className="bg-card border border-border-main p-6 rounded-xl shadow-sm w-full h-[300px] flex flex-col">
            <h3 className="text-text-main font-bold mb-4 flex items-center gap-2">Memory Pressure (Heartbeat)</h3>

            <div className="flex-1 w-full min-h-0">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 20, right: 10, left: 15, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                            <XAxis
                                dataKey="timeMs"
                                stroke="#718096"
                                fontSize={12}
                                tickFormatter={(val) => `${val}ms`}
                            />
                            <YAxis
                                stroke="#718096"
                                fontSize={12}
                                tickFormatter={(val) => formatMemory(val)}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111315', borderColor: '#2D3748', borderRadius: '8px', color: '#E2E8F0' }}
                                itemStyle={{ fontWeight: 500 }}
                                formatter={(value: number | string | undefined) => [formatMemory(Number(value ?? 0)), undefined]}
                                labelFormatter={(label) => `Time: ${label}ms`}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }}
                                onClick={(e) => {
                                    if (e.dataKey) toggleLine(String(e.dataKey));
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="rssKb"
                                name="RSS (Resident Set Size)"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#10b981', stroke: '#050505', strokeWidth: 2 }}
                                hide={hiddenLines.includes('rssKb')}
                            />
                            <Line
                                type="monotone"
                                dataKey="vmKb"
                                name="Virtual Memory"
                                stroke="#6366f1"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={false}
                                hide={hiddenLines.includes('vmKb')}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                        No telemetry data available.
                    </div>
                )}
            </div>
        </div>
    );
};
