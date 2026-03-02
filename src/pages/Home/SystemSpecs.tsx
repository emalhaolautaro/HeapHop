import React from 'react';
import { Cpu, Cards, Memory } from '@phosphor-icons/react';

export const SystemSpecs: React.FC = () => {
    return (
        <div className="bg-card border border-border-main p-6 rounded-xl flex flex-col gap-4 shadow-sm w-full">
            <h3 className="font-bold text-text-main flex items-center gap-2">
                <Cpu size={20} className="text-text-muted" />
                System Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-bg border border-border-main p-4 rounded-lg flex flex-col gap-1">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-1.5"><Cpu size={14} /> PROCESSOR</span>
                    <span className="text-sm text-text-main font-medium">12 Threads</span>
                </div>

                <div className="bg-bg border border-border-main p-4 rounded-lg flex flex-col gap-1">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-1.5"><Cards size={14} /> GRAPHICS</span>
                    <span className="text-sm text-text-main font-medium">RTX 3050 Ti</span>
                </div>

                <div className="bg-bg border border-border-main p-4 rounded-lg flex flex-col gap-1">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-1.5"><Memory size={14} /> MEMORY</span>
                    <span className="text-sm text-text-main font-medium">16 GB</span>
                </div>
            </div>

            <div className="text-xs text-text-muted font-medium italic mt-2">
                * Note: Real-time hardware detection requires Tauri backend implementation.
            </div>
        </div>
    );
};
