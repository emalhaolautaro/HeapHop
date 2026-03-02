import React from 'react';
import { Cube } from '@phosphor-icons/react';
import { HeatmapCanvas } from './HeatmapCanvas';
import { useHeapEvents } from '../../hooks/useHeapEvents';

interface HeapHeatmapProps {
    initialData?: Record<string, number> | null;
}

export const HeapHeatmap: React.FC<HeapHeatmapProps> = ({ initialData }) => {
    const { heapData, eventsCount } = useHeapEvents(initialData);

    return (
        <div className="bg-card border border-border-main rounded-xl p-5 shadow-sm flex flex-col gap-4 max-h-[500px]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-main font-bold">
                    <Cube size={20} className="text-amber-500" />
                    <span>Heap Map</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted bg-card2 px-2 py-0.5 rounded border border-ring">
                    {eventsCount} eBPF EVENTS
                </span>
            </div>

            <HeatmapCanvas heapMap={heapData} gridSize={40} blockSize={10} padding={1} />

            <div className="flex items-center justify-center gap-6 text-[10px] font-medium text-text-muted border-t border-border-main pt-4">
                {[
                    { color: 'bg-blue-500', label: 'Small (<1KB)' },
                    { color: 'bg-violet-500', label: 'Medium (<1MB)' },
                    { color: 'bg-pink-500', label: 'Large (>1MB)' }
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-sm ${item.color}`}></span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
