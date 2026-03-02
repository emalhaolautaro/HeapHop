import React, { useState, useEffect } from 'react';
import { Archive, Spinner } from '@phosphor-icons/react';
import { invoke } from '@tauri-apps/api/core';
import { ReportSummary, RunReport } from '../../types';
import { HistoryHeader } from './HistoryHeader';
import { HistoryCard } from './HistoryCard';
import { BattleArena } from './BattleArena';
import { ask } from '@tauri-apps/plugin-dialog';

interface HistoryProps {
    onSelectRun?: (filename: string, report: RunReport) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelectRun }) => {
    const [battleMode, setBattleMode] = useState(false);
    const [selectedRuns, setSelectedRuns] = useState<string[]>([]);
    const [reports, setReports] = useState<ReportSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReports = () => {
        setIsLoading(true);
        invoke<ReportSummary[]>('list_history').then(setReports).catch(console.error).finally(() => setIsLoading(false));
    };

    useEffect(fetchReports, []);

    const handleDelete = async (e: React.MouseEvent, filename: string) => {
        e.preventDefault();
        e.stopPropagation();

        const confirmed = await ask("This will permanently delete the report. Are you sure?", {
            title: "Delete Report",
            kind: 'warning',
        });

        if (!confirmed) return;

        try {
            await invoke('delete_history_item', { filename });
            setReports(prev => prev.filter(r => r.filename !== filename));
        } catch (error) {
            alert(`Error: ${error}`);
        }
    };

    const handleCardClick = async (filename: string) => {
        if (battleMode) {
            setSelectedRuns(prev => prev.includes(filename) ? prev.filter(id => id !== filename) : (prev.length < 2 ? [...prev, filename] : prev));
        } else if (onSelectRun) {
            const report = await invoke<RunReport>('load_report', { filename });
            onSelectRun(filename, report);
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto pb-8 gap-6 animate-in fade-in duration-500">
            <HistoryHeader battleMode={battleMode} onToggleBattleMode={() => { setBattleMode(!battleMode); setSelectedRuns([]); }} />

            {battleMode && <BattleArena selectedCount={selectedRuns.length} />}

            {isLoading ? <div className="flex-1 flex items-center justify-center text-text-muted"><Spinner size={32} className="animate-spin" /></div> :
                reports.length === 0 ? <div className="flex-1 border border-dashed border-border-main rounded-2xl bg-bg p-8 flex flex-col items-center justify-center text-center"><Archive size={48} className="text-text-muted/50 mb-4" /><h3 className="text-xl font-bold text-text-main mb-2">No Reports Yet</h3></div> :
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reports.map((run) => (
                            <HistoryCard key={run.filename} run={run} isSelected={selectedRuns.includes(run.filename)} battleMode={battleMode} onClick={() => handleCardClick(run.filename)} onDelete={(e: React.MouseEvent) => handleDelete(e, run.filename)} />
                        ))}
                    </div>}
        </div>
    );
};
