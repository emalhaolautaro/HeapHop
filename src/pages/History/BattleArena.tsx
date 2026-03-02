import React from 'react';
import { Sword } from '@phosphor-icons/react';

interface BattleArenaProps {
    selectedCount: number;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ selectedCount }) => {
    if (selectedCount === 0) {
        return (
            <div className="flex-1 border border-dashed border-amber-500/30 rounded-2xl bg-amber-500/5 p-8 flex flex-col items-center justify-center text-center">
                <Sword size={48} className="text-amber-500/50 mb-4" weight="duotone" />
                <h3 className="text-xl font-bold text-amber-500 mb-2">Battle Mode Enabled</h3>
                <p className="text-text-muted max-w-md text-sm">Select two runs from your archive below to compare performance deltas side-by-side.</p>
            </div>
        );
    }

    if (selectedCount === 2) {
        return (
            <div className="flex-1 border border-amber-500/30 rounded-2xl bg-amber-500/10 p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <Sword size={48} className="text-amber-500 mb-4 animate-bounce" weight="fill" />
                <h3 className="text-xl font-bold text-amber-500 mb-2">Ready for Battle!</h3>
                <div className="flex items-center gap-4 my-4 font-mono text-text-main">
                    <span className="px-3 py-1 bg-card2 rounded-md border border-ring">Run 1</span>
                    <span className="text-amber-500 text-sm font-bold">VS</span>
                    <span className="px-3 py-1 bg-card2 rounded-md border border-ring">Run 2</span>
                </div>
                <button className="mt-2 px-6 py-2.5 bg-amber-500 text-bg font-bold rounded-xl hover:bg-amber-400 transition-colors">
                    Start Comparison
                </button>
            </div>
        );
    }

    return null;
};
