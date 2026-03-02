import React from 'react';
import { ArtifactFootprint } from '../../types';
import { Archive, Code, Database } from '@phosphor-icons/react';

interface ArtifactFootprintPanelProps {
    footprint?: ArtifactFootprint | null;
}

export const ArtifactFootprintPanel: React.FC<ArtifactFootprintPanelProps> = ({ footprint }) => {
    const formatBytes = (bytes: number | null | undefined) => {
        if (bytes == null || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Si no hay datos (ej. Java, Python), mostramos N/A con la aclaración solicitada
    const hasData = footprint && (footprint.binarySizeBytes != null || footprint.textSizeBytes != null);

    if (!hasData) {
        return (
            <div className="bg-card w-full border border-border-main p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                <h3 className="text-text-main font-bold flex items-center gap-2 text-xs uppercase tracking-widest opacity-60 m-0">
                    <Archive size={16} /> Huella del Artefacto
                </h3>
                <div className="flex-1 text-center text-text-muted text-sm font-medium">
                    <span className="text-rose-400 font-mono font-bold mr-2">N/A</span>
                    <span className="opacity-70 text-xs">Aplica a lenguajes no gestionados (C/Rust) sin runtime VM.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-in slide-in-from-top-4 duration-500">
            {/* Binary Size */}
            <div className="bg-card border border-border-main p-4 rounded-xl flex flex-col gap-2 shadow-sm relative group overflow-hidden hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-2 text-blue-500 opacity-80 uppercase text-[10px] font-bold tracking-widest z-10">
                    <Archive size={14} /> Binary Size (stripped)
                </div>
                <div className="text-xl font-bold text-text-main font-mono z-10">
                    {footprint?.binarySizeBytes ? formatBytes(footprint.binarySizeBytes) : 'N/A'}
                </div>
                <div className="absolute -bottom-4 -right-4 text-blue-500 opacity-[0.03] group-hover:opacity-10 transition-opacity z-0 pointer-events-none">
                    <Archive size={80} weight="fill" />
                </div>
            </div>

            {/* Code Size */}
            <div className="bg-card border border-border-main p-4 rounded-xl flex flex-col gap-2 shadow-sm relative group overflow-hidden hover:border-violet-500/30 transition-colors">
                <div className="flex items-center gap-2 text-violet-500 opacity-80 uppercase text-[10px] font-bold tracking-widest z-10">
                    <Code size={14} /> Code Size (.text)
                </div>
                <div className="text-xl font-bold text-text-main font-mono z-10">
                    {footprint?.textSizeBytes ? formatBytes(footprint.textSizeBytes) : 'N/A'}
                </div>
                <div className="absolute -bottom-4 -right-4 text-violet-500 opacity-[0.03] group-hover:opacity-10 transition-opacity z-0 pointer-events-none">
                    <Code size={80} weight="fill" />
                </div>
            </div>

            {/* Data Size */}
            <div className="bg-card border border-border-main p-4 rounded-xl flex flex-col gap-2 shadow-sm relative group overflow-hidden hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-2 text-amber-500 opacity-80 uppercase text-[10px] font-bold tracking-widest z-10">
                    <Database size={14} /> Data Size (.data + .bss)
                </div>
                <div className="text-xl font-bold text-text-main font-mono z-10">
                    {footprint?.dataSizeBytes ? formatBytes(footprint.dataSizeBytes) : 'N/A'}
                </div>
                <div className="absolute -bottom-4 -right-4 text-amber-500 opacity-[0.03] group-hover:opacity-10 transition-opacity z-0 pointer-events-none">
                    <Database size={80} weight="fill" />
                </div>
            </div>
        </div>
    );
};
