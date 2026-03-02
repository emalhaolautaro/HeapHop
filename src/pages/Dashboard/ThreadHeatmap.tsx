import React, { useEffect, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { ShareNetwork } from '@phosphor-icons/react';
import { ThreadHeatmapCanvas } from './ThreadHeatmapCanvas';

interface AllocationEvent {
    pid: number; tid: number; address: number; size: number; isFree: number; timestamp: number;
}

export const ThreadHeatmap: React.FC = () => {
    const [eventsCount, setEventsCount] = useState(0);
    const [uniqueThreads, setUniqueThreads] = useState(0);
    const [heapData, setHeapData] = useState<Map<number, { size: number, tid: number }>>(new Map());

    const heapMapRef = useRef<Map<number, { size: number, tid: number }>>(new Map());
    const threadsSetRef = useRef<Set<number>>(new Set());
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const unlisten = listen<AllocationEvent>('heap-activity', (event) => {
            const { address, size, tid, isFree } = event.payload;

            if (isFree === 1) {
                heapMapRef.current.delete(address);
            } else {
                heapMapRef.current.set(address, { size, tid });
                threadsSetRef.current.add(tid);
            }
        });

        // Throttle UI updates using requestAnimationFrame
        const renderLoop = () => {
            setHeapData(new Map(heapMapRef.current));
            setEventsCount(heapMapRef.current.size);
            setUniqueThreads(threadsSetRef.current.size);
            frameRef.current = requestAnimationFrame(renderLoop);
        };
        frameRef.current = requestAnimationFrame(renderLoop);

        const unlistenReset = listen('heap-reset', () => {
            heapMapRef.current = new Map();
            threadsSetRef.current = new Set();
            setHeapData(new Map());
            setEventsCount(0);
            setUniqueThreads(0);
        });

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            unlisten.then(f => f());
            unlistenReset.then(f => f());
        };
    }, []);

    return (
        <div className="bg-card border border-border-main rounded-xl p-5 shadow-sm flex flex-col gap-4 max-h-[500px]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-main font-bold">
                    <ShareNetwork size={20} className="text-blue-500" />
                    <span>Thread Allocation Map</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-mono font-bold text-text-muted bg-card2 px-2 py-0.5 rounded border border-ring">
                        {uniqueThreads} THREADS
                    </span>
                    <span className="text-[10px] font-mono text-text-muted bg-card2 px-2 py-0.5 rounded border border-ring">
                        {eventsCount} LIVE BLOCKS
                    </span>
                </div>
            </div>

            <ThreadHeatmapCanvas heapMap={heapData} gridSize={40} blockSize={10} padding={1} />

            <div className="flex items-center justify-center gap-6 text-[10px] font-medium text-text-muted border-t border-border-main pt-4">
                <div>Each color represents a unique Thread ID (TID) allocating memory simultaneously.</div>
            </div>
        </div>
    );
};
