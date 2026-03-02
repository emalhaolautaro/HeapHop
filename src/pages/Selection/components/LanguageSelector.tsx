import React from 'react';
import { Code, CaretRight } from '@phosphor-icons/react';
import { LanguageVariant, LANGUAGES, Language } from '../../../lib/languages';

interface LanguageSelectorProps {
    variants: LanguageVariant[];
    selectedVariantId: string;
    onChange: (variantId: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variants, selectedVariantId, onChange }) => {
    const selectedVariant = variants.find(v => v.id === selectedVariantId);
    const selectedLang = selectedVariant?.language;

    // Get unique compilers for the selected language
    const languageVariants = variants.filter(v => v.language === selectedLang);
    const compilers = [...new Set(languageVariants.map(v => v.compiler))];
    const selectedCompiler = selectedVariant?.compiler ?? compilers[0];
    const compilerVariants = languageVariants.filter(v => v.compiler === selectedCompiler);

    const selectLanguage = (lang: Language) => {
        const firstVariant = variants.find(v => v.language === lang);
        if (firstVariant) onChange(firstVariant.id);
    };

    const selectCompiler = (compiler: string) => {
        const firstVariant = languageVariants.find(v => v.compiler === compiler);
        if (firstVariant) onChange(firstVariant.id);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Language Cards */}
            <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest pl-1 flex items-center gap-1.5 mb-2">
                    <Code weight="bold" size={14} className="text-amber-500" />
                    Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.id}
                            onClick={() => selectLanguage(lang.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer
                                ${selectedLang === lang.id
                                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                                    : 'bg-bg border-border-main text-text-muted hover:border-text-muted hover:text-text-main'
                                }`}
                        >
                            <span className="text-base">{lang.icon}</span>
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Compiler Selector (only if multiple compilers) */}
            {compilers.length > 1 && (
                <div>
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-widest pl-1 flex items-center gap-1.5 mb-2">
                        <CaretRight weight="bold" size={12} className="text-emerald-500" />
                        Compiler
                    </label>
                    <div className="flex gap-2">
                        {compilers.map(compiler => (
                            <button
                                key={compiler}
                                onClick={() => selectCompiler(compiler)}
                                className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer
                                    ${selectedCompiler === compiler
                                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                                        : 'bg-bg border-border-main text-text-muted hover:border-text-muted hover:text-text-main'
                                    }`}
                            >
                                {compiler}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Optimization Level */}
            <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest pl-1 flex items-center gap-1.5 mb-2">
                    <CaretRight weight="bold" size={12} className="text-violet-500" />
                    Optimization
                </label>
                <div className="flex flex-wrap gap-2">
                    {compilerVariants.map(variant => {
                        // Extract just the optimization part from the label
                        const optLabel = variant.label.split('—').pop()?.trim() ?? variant.label;
                        return (
                            <button
                                key={variant.id}
                                onClick={() => onChange(variant.id)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer
                                    ${selectedVariantId === variant.id
                                        ? 'bg-violet-500/15 border-violet-500/50 text-violet-400'
                                        : 'bg-bg border-border-main text-text-muted hover:border-text-muted hover:text-text-main'
                                    }`}
                            >
                                {optLabel}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
