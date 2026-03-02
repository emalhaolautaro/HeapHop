import React from 'react';
import { TelemetryDataPoint } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HardwareEfficiencyProps {
    data?: TelemetryDataPoint[] | null;
}

export const HardwareEfficiency: React.FC<HardwareEfficiencyProps> = ({ data }) => {
    return (
        <div className="bg-card border border-border-main p-6 rounded-xl shadow-sm w-full h-full min-h-[400px] flex flex-col">
            <h3 className="text-text-main font-bold mb-4 flex items-center gap-2">Page Faults (The Metal)</h3>

            <div className="flex-1 w-full min-h-0">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorMinor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMajor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                            <XAxis
                                dataKey="timeMs"
                                stroke="#718096"
                                fontSize={10}
                                tickFormatter={(val) => `${val}ms`}
                            />
                            <YAxis
                                stroke="#718096"
                                fontSize={10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111315', borderColor: '#2D3748', borderRadius: '8px', color: '#E2E8F0' }}
                                itemStyle={{ fontWeight: 500 }}
                                labelFormatter={(label) => `Time: ${label}ms`}
                            />
                            <Area
                                type="step"
                                dataKey="faultsMinor"
                                name="Minor Faults"
                                stroke="#f59e0b"
                                fillOpacity={1}
                                fill="url(#colorMinor)"
                                strokeWidth={2}
                            />
                            <Area
                                type="step"
                                dataKey="faultsMajor"
                                name="Major Faults"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorMajor)"
                                strokeWidth={2}
                            />
                        </AreaChart>
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
