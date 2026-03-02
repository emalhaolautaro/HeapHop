import React from 'react';
import { Cpu } from '@phosphor-icons/react';
import { open } from '@tauri-apps/plugin-dialog';

interface PayloadSelectorProps {
    file: string | null | undefined;
    onFileSelect: (filePath: string) => void;
}

export const PayloadSelector: React.FC<PayloadSelectorProps> = ({ file, onFileSelect }) => {
    const handleFileSelect = async () => {
        try {
            const selected = await open({
                multiple: false,
                directory: false,
                title: "Select Source or Binary Payload"
            });
            if (selected !== null && !Array.isArray(selected)) {
                onFileSelect(selected);
            }
        } catch (error) {
            console.error("Failed to open file dialog:", error);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-widest pl-1">Binary Payload</label>
            <div className="flex items-center gap-3 w-full bg-bg border border-border-main p-2 rounded-xl focus-within:border-ring transition-colors">
                <Cpu weight="bold" className="text-text-muted shrink-0 ml-1" size={20} />
                <div className="flex-1 overflow-hidden" title={file || 'No file selected'}>
                    <span className={`text-sm font-medium truncate tracking-tight ${file ? 'text-emerald-500' : 'text-text-muted'}`}>
                        {file || 'No file selected...'}
                    </span>
                </div>
                <button
                    onClick={handleFileSelect}
                    className="px-3 py-1.5 bg-card border border-border-main text-xs font-semibold rounded-lg hover:border-ring hover:bg-card2 transition-colors text-text-main shrink-0"
                >
                    Browse...
                </button>
            </div>
        </div>
    );
};
