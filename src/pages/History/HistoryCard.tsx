import React from 'react';
import { CalendarBlank, Code, CheckCircle, Trash } from '@phosphor-icons/react';
import { ReportSummary } from '../../types';

interface HistoryCardProps {
    run: ReportSummary;
    isSelected: boolean;
    battleMode: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
    run,
    isSelected,
    battleMode,
    onClick,
    onDelete
}) => {
    const shortName = run.programFile.split('/').pop() || run.programFile;
    const shortId = run.filename.split('_')[0] || 'Unknown';

    return (
        <div
            onClick={onClick}
            className={`bg-card border rounded-xl p-5 transition-all shadow-sm flex flex-col gap-4 group cursor-pointer relative ${isSelected ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-500/5' : 'border-border-main hover:border-ring'
                }`}
        >
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-bg border border-border-main text-text-muted" title={run.filename}>
                    {shortId}...
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                        {isSelected && <CheckCircle size={16} weight="fill" className="text-amber-500 mr-1" />}
                        <CalendarBlank size={12} />
                        {new Date(run.timestamp * 1000).toLocaleDateString()}
                    </span>
                    {!battleMode && (
                        <button
                            onClick={onDelete}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-all text-text-muted"
                        >
                            <Trash size={16} />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <h4 className="text-text-main font-bold capitalize flex items-center gap-2 truncate">
                    <Code size={16} className="text-text-muted shrink-0" />
                    {shortName}
                </h4>
                <div className="text-xs font-medium">
                    <span className="text-emerald-500/80 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {run.variantId}
                    </span>
                </div>
            </div>
        </div>
    );
};
