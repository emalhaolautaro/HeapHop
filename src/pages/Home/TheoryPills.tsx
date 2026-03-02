import React from 'react';
import theoryData from './theoryData.json';
import {BookOpenText} from '@phosphor-icons/react';

const colorMap: Record<string, string> = {
 purple: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40',
 emerald: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40',
 orange: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40',
 blue: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
 rose: 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40',
};

export const TheoryPills: React.FC = () => {
 return (
 <div className="flex flex-col gap-4 w-full">
 <h3 className="font-bold text-text-main flex items-center gap-2">
 <BookOpenText size={20} className="text-text-muted" />
 Theory & Concepts
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {theoryData.map((pill) => (
 <div
 key={pill.id}
 className={`p-5 rounded-xl transition-all duration-300 flex flex-col gap-2 group shadow-sm border ${colorMap[pill.color] || 'bg-card border-border-main hover:border-ring'}`}
 >
 <h4 className="text-text-main font-semibold text-sm transition-colors">
 {pill.title}
 </h4>
 <p className="text-text-muted text-xs leading-relaxed group-hover:text-text-main transition-colors">{pill.description}</p>
 </div>
 ))}
 </div>
 </div>
 );
};
