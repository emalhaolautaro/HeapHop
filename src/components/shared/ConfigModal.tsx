import React from 'react';
import { Gear, Palette, Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-bg dark:bg-bg bg-white border border-border-main dark:border-border-main rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                <header className="px-6 py-4 border-b border-border-main dark:border-border-main flex items-center justify-between bg-card dark:bg-card ">
                    <div className="flex items-center gap-2">
                        <Gear size={20} className="text-text-muted" />
                        <h3 className="text-text-main font-bold">Preferences</h3>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                        Esc
                    </button>
                </header>

                <div className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <Palette size={16} /> UI Theme
                        </label>
                        <div className="flex items-center justify-between bg-card dark:bg-card border border-border-main dark:border-border-main p-3 rounded-xl">
                            <span className="text-sm font-medium text-text-main">Theme</span>
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`w-14 h-7 rounded-full flex items-center p-1 transition-colors ${theme === 'dark' ? 'bg-indigo-500 justify-end' : 'bg-amber-400 justify-start'}`}
                            >
                                <div className="w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center text-black">
                                    {theme === 'dark' ? <Moon size={12} weight="fill" /> : <Sun size={12} weight="fill" />}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="px-6 py-4 border-t border-border-main bg-card flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 bg-primary text-primary-fg text-sm font-semibold rounded-lg hover:bg-white transition-colors">Done</button>
                </footer>
            </div>
        </div>
    );
};
