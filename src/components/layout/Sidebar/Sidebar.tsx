import React, { useState } from 'react';
import { ChartLineUp, Gear, HouseLine, ClockCounterClockwise, SidebarSimple, Flask, SquaresFour } from '@phosphor-icons/react';

export type PageView = 'home' | 'selection' | 'dashboard' | 'history' | 'settings';

interface SidebarProps {
    currentPage: PageView;
    onNavigate: (page: PageView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`flex flex-col bg-bg border-r border-border-main h-screen items-center py-6 gap-8 text-text-muted shrink-0 transition-all duration-300 ease-in-out relative ${isExpanded ? 'w-64 px-4 items-start' : 'w-20 items-center'}`}>
            <div className={`flex items-center w-full ${isExpanded ? 'justify-between px-2' : 'justify-center'}`}>
                <div className={`flex items-center gap-3 ${!isExpanded && 'hidden'}`}>
                    <div className="w-8 h-8 bg-card2 rounded-lg flex items-center justify-center text-text-main shadow-sm border border-ring shrink-0">
                        <ChartLineUp weight="fill" size={18} />
                    </div>
                    <span className="font-bold text-text-main tracking-tight truncate">HeapHop</span>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-text-muted hover:text-text-main rounded-md p-1 transition-all shrink-0"
                >
                    <SidebarSimple size={28} weight={isExpanded ? "fill" : "regular"} />
                </button>
            </div>

            <div className={`flex flex-col gap-2 flex-1 w-full ${isExpanded ? '' : 'items-center'}`}>
                <button
                    onClick={() => onNavigate('home')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${isExpanded ? 'px-4' : 'justify-center'} ${currentPage === 'home' ? 'bg-primary shadow-sm border ' : 'hover: text-text-muted '}`}
                >
                    <HouseLine weight={currentPage === 'home' ? 'fill' : 'regular'} size={22} className="shrink-0" />
                    {isExpanded && <span className="font-medium text-sm">Home</span>}
                </button>

                <button
                    onClick={() => onNavigate('selection')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${isExpanded ? 'px-4' : 'justify-center'} ${currentPage === 'selection' ? 'bg-primary shadow-sm border ' : 'hover: text-text-muted '}`}
                >
                    <Flask weight={currentPage === 'selection' ? 'fill' : 'regular'} size={22} className="shrink-0" />
                    {isExpanded && <span className="font-medium text-sm">Lab Setup</span>}
                </button>

                <button
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${isExpanded ? 'px-4' : 'justify-center'} ${currentPage === 'dashboard' ? 'bg-primary shadow-sm border ' : 'hover: text-text-muted '}`}
                >
                    <SquaresFour weight={currentPage === 'dashboard' ? 'fill' : 'regular'} size={22} className="shrink-0" />
                    {isExpanded && <span className="font-medium text-sm">Dashboard</span>}
                </button>

                <button
                    onClick={() => onNavigate('history')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${isExpanded ? 'px-4' : 'justify-center'} ${currentPage === 'history' ? 'bg-primary shadow-sm border ' : 'hover: text-text-muted '}`}
                >
                    <ClockCounterClockwise weight={currentPage === 'history' ? 'fill' : 'regular'} size={22} className="shrink-0" />
                    {isExpanded && <span className="font-medium text-sm">Archive</span>}
                </button>
            </div>

            <button
                onClick={() => onNavigate('settings')}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${isExpanded ? 'px-4' : 'justify-center'} ${currentPage === 'settings' ? 'bg-primary shadow-sm border ' : 'hover: text-text-muted '}`}
            >
                <Gear weight={currentPage === 'settings' ? 'fill' : 'regular'} size={22} className="shrink-0" />
                {isExpanded && <span className="font-medium text-sm">Settings</span>}
            </button>
        </div>
    );
};
