import React, { useState } from 'react';
import { Info } from '@phosphor-icons/react';

const CAUSES = [
    { icon: '⚙️', title: 'libc Init Frees', desc: 'Dynamic linker and libc allocate memory before BPF probes attach. Their frees are captured, but the matching mallocs are not.' },
    { icon: '♻️', title: 'GC Pre-cleanup', desc: 'Managed runtimes (Go, Java, Python) may free memory through their garbage collector before explicit free() calls.' },
    { icon: '🔄', title: 'realloc() Internals', desc: 'realloc() internally does malloc + memcpy + free. The internal free is captured but may not match a tracked malloc.' },
    { icon: '🧵', title: 'Thread Cleanup', desc: 'When threads exit, libc frees internal structures (stacks, TLS) that were allocated before tracing started.' },
];

export const FreedRatioTooltip: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                className="flex items-center gap-1 text-[9px] text-amber-400 font-medium leading-tight cursor-pointer hover:text-amber-300 transition-colors"
                onClick={() => setOpen(!open)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
            >
                <Info size={10} weight="fill" /> Why &gt; 100%?
            </button>
            {open && (
                <div className="absolute bottom-full left-0 mb-2 z-50 bg-[#0d0f11] border border-border-main rounded-xl p-4 shadow-2xl w-[340px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <h4 className="text-xs font-bold text-text-main mb-3 flex items-center gap-1.5">
                        <Info size={12} weight="fill" className="text-amber-500" />
                        Possible causes for Freed Ratio &gt; 100%
                    </h4>
                    <div className="flex flex-col gap-2.5">
                        {CAUSES.map((c) => (
                            <div key={c.title} className="flex gap-2">
                                <span className="text-sm shrink-0 mt-0.5">{c.icon}</span>
                                <div>
                                    <span className="text-[10px] font-bold text-text-main block">{c.title}</span>
                                    <span className="text-[9px] text-text-muted leading-tight block">{c.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-border-main text-[8px] text-text-muted italic">
                        This is expected behavior — eBPF probes cannot attach before the process loads libc.
                    </div>
                </div>
            )}
        </div>
    );
};
