import React from 'react';
import { Play, Flask } from '@phosphor-icons/react';
import { LanguageSelector } from './components/LanguageSelector';
import { PayloadSelector } from './components/PayloadSelector';
import { LanguageVariant } from '../../lib/languages';

export interface ConfigState {
    variantId: string;
    programFile?: string | null;
}

interface SelectionProps {
    config: ConfigState;
    variants: LanguageVariant[];
    onChange: (config: ConfigState) => void;
    onRunTest: () => void;
    isRunning: boolean;
}

export const Selection: React.FC<SelectionProps> = ({ config, variants, onChange, onRunTest, isRunning }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
            <div className="bg-card border border-border-main rounded-2xl p-8 shadow-sm flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Flask size={24} className="text-amber-500" weight="fill" />
                        The Lab Setup
                    </h2>
                    <p className="text-sm text-text-muted">Configure your experiment parameters before execution.</p>
                </div>

                <LanguageSelector
                    variants={variants}
                    selectedVariantId={config.variantId}
                    onChange={(id) => onChange({ ...config, variantId: id })}
                />

                <PayloadSelector
                    file={config.programFile}
                    onFileSelect={(file) => onChange({ ...config, programFile: file })}
                />

                <div className="flex justify-end pt-4 border-t border-border-main mt-2">
                    <button
                        onClick={onRunTest}
                        disabled={isRunning || !config.programFile}
                        className="flex items-center gap-2 bg-primary hover:bg-white text-primary-fg font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        <Play weight="fill" className={isRunning ? "animate-pulse" : "group-hover:text-amber-600 transition-colors"} size={20} />
                        {isRunning ? 'Running Experiment...' : 'Execute Lab Test'}
                    </button>
                </div>
            </div>
        </div>
    );
};
