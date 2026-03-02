import React from 'react';
import { Archive, Sword } from '@phosphor-icons/react';

interface HistoryHeaderProps {
    battleMode: boolean;
    onToggleBattleMode: () => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({
    battleMode,
    onToggleBattleMode
}) => (
    <header className="flex items-center justify-between bg-card border border-border-main p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-card2 rounded-lg flex items-center justify-center text-text-main border border-ring">
                <Archive size={24} weight="fill" />
            </div>
            <div>
                <h2 className="text-text-main font-bold tracking-tight">The Archive</h2>
                <span className="text-xs text-text-muted font-medium tracking-wide text-uppercase">PREVIOUS RUNS</span>
            </div>
        </div>

        <button
            onClick={onToggleBattleMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border ${battleMode
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                    : 'bg-bg text-text-muted border-border-main hover:text-text-main hover:border-ring'
                }`}
        >
            <Sword weight={battleMode ? "fill" : "regular"} size={18} />
            {battleMode ? 'Exit Battle Mode' : 'Enter Battle Mode'}
        </button>
    </header>
);
