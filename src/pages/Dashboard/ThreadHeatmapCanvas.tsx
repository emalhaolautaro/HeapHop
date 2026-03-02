import React, { useEffect, useRef } from 'react';

interface ThreadHeatmapCanvasProps {
    heapMap: Map<number, { size: number, tid: number }>;
    gridSize: number;
    blockSize: number;
    padding: number;
}

export const ThreadHeatmapCanvas: React.FC<ThreadHeatmapCanvasProps> = ({
    heapMap,
    gridSize,
    blockSize,
    padding
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Hash a TID into a determinist random hex color
    const hashColor = (tid: number) => {
        const str = tid.toString() + "thread";
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + "00000".substring(0, 6 - c.length) + c;
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                ctx.strokeRect(i * (blockSize + padding), j * (blockSize + padding), blockSize, blockSize);
            }
        }

        // Allocations
        heapMap.forEach((block, addr) => {
            const idx = Math.abs(Math.floor(addr % (gridSize * gridSize)));
            const x = Math.floor(idx / gridSize);
            const y = idx % gridSize;

            const color = hashColor(block.tid);

            ctx.fillStyle = color;
            ctx.shadowBlur = 4;
            ctx.shadowColor = color;
            ctx.fillRect(x * (blockSize + padding), y * (blockSize + padding), blockSize, blockSize);
            ctx.shadowBlur = 0;
        });
    };

    useEffect(() => { draw(); }, [heapMap]);

    return (
        <div className="flex justify-center bg-[#0a0a0a] rounded-lg p-4 border border-border-main overflow-hidden">
            <canvas
                ref={canvasRef}
                width={gridSize * (blockSize + padding) - padding}
                height={gridSize * (blockSize + padding) - padding}
                className="image-render-pixel"
            />
        </div>
    );
};
