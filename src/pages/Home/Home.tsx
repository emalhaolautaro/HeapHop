import React from 'react';
import { SystemSpecs } from './SystemSpecs';
import { TheoryPills } from './TheoryPills';
import { Signature } from '../../components/layout/Signature';

export const Home: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto gap-10 pb-8">
            <div className="flex flex-col items-center justify-center w-full mt-6 mb-4 animate-fade-in">
                <img src="/logo.svg" alt="HeapHop Logo" className="w-120 h-120 object-contain drop-shadow-2xl" />
            </div>

            <div className="flex flex-col xl:flex-row w-full gap-6">
                <SystemSpecs />
            </div>

            <TheoryPills />

            <Signature />
        </div>
    );
};
