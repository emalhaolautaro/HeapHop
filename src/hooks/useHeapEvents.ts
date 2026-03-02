import { useEffect, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';

interface AllocationEvent {
    pid: number; address: number; size: number; isFree: number; timestamp: number;
}

export function useHeapEvents(initialData?: Record<string, number> | null) {
    const [eventsCount, setEventsCount] = useState(0);
    const [heapData, setHeapData] = useState<Map<number, number>>(new Map());
    const heapMapRef = useRef<Map<number, number>>(new Map());
    const eventsCountRef = useRef<number>(0);
    const frameRef = useRef<number>(0);

    // Initialize with snapshot if provided
    useEffect(() => {
        if (initialData) {
            const map = new Map<number, number>();
            Object.entries(initialData).forEach(([addr, size]) => {
                map.set(parseInt(addr), size);
            });
            heapMapRef.current = map;
            eventsCountRef.current = map.size;
            setHeapData(new Map(map));
            setEventsCount(map.size);
        } else {
            heapMapRef.current = new Map();
            eventsCountRef.current = 0;
            setHeapData(new Map());
            setEventsCount(0);
        }
    }, [initialData]);

    // Live event subscription
    useEffect(() => {
        if (initialData) return;

        const unlisten = listen<AllocationEvent>('heap-activity', (event) => {
            const { address, size, isFree } = event.payload;
            if (isFree === 1) {
                heapMapRef.current.delete(address);
            } else {
                heapMapRef.current.set(address, size);
            }
            eventsCountRef.current += 1;
        });

        const renderLoop = () => {
            setHeapData(new Map(heapMapRef.current));
            setEventsCount(eventsCountRef.current);
            frameRef.current = requestAnimationFrame(renderLoop);
        };
        frameRef.current = requestAnimationFrame(renderLoop);

        const unlistenReset = listen('heap-reset', () => {
            heapMapRef.current = new Map();
            eventsCountRef.current = 0;
            setHeapData(new Map());
            setEventsCount(0);
        });

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            unlisten.then(f => f());
            unlistenReset.then(f => f());
        };
    }, [initialData]);

    return { heapData, eventsCount };
}
