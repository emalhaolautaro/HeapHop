export type Language = 'c' | 'cpp' | 'rust' | 'java' | 'python' | 'go';

export type ProfileType = 'manual' | 'gc' | 'interpreter';

export interface MetricCapabilities {
    profile: ProfileType;
    ebpfMalloc: boolean;
    ebpfMmap: boolean;
    procTelemetry: boolean;
    gcMetrics: boolean;
    artifactFootprint: boolean;
    concurrency: boolean;
}

export interface LanguageVariant {
    id: string;
    language: Language;
    compiler: string;
    label: string;
    capabilities: MetricCapabilities;
}

export interface LanguageInfo {
    id: Language;
    name: string;
    icon: string;
    compilers: string[];
}

export const LANGUAGES: LanguageInfo[] = [
    { id: 'c', name: 'C', icon: '🔧', compilers: ['gcc', 'clang'] },
    { id: 'cpp', name: 'C++', icon: '⚙️', compilers: ['g++', 'clang++'] },
    { id: 'rust', name: 'Rust', icon: '🦀', compilers: ['rustc'] },
    { id: 'java', name: 'Java', icon: '☕', compilers: ['javac'] },
    { id: 'python', name: 'Python', icon: '🐍', compilers: ['python3'] },
    { id: 'go', name: 'Go', icon: '🐹', compilers: ['go'] },
];

/** Find the language info for a given variant ID */
export function getLanguageForVariant(variants: LanguageVariant[], variantId: string): LanguageInfo | undefined {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return undefined;
    return LANGUAGES.find(l => l.id === variant.language);
}

/** Get label for a variant (for display in history etc.) */
export function getVariantLabel(variants: LanguageVariant[], variantId: string): string {
    return variants.find(v => v.id === variantId)?.label ?? variantId;
}
