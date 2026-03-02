import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton, MainGraph, HardwareEfficiency, HeapHeatmap, AnalysisPanel, SizeDistributionHistogram, ArtifactFootprintPanel, ConcurrencyPanel, ThreadHeatmap, GCPanel } from './';
import { TelemetryDataPoint, ArtifactFootprint } from '../../types';
import { MetricCapabilities } from '../../lib/languages';

interface DashboardProps {
    runId?: string | null;
    telemetry?: TelemetryDataPoint[] | null;
    heapSnapshot?: Record<string, number> | null;
    analysis?: import('../../types').HeapAnalysis | null;
    artifactFootprint?: ArtifactFootprint | null;
    concurrency?: import('../../types').ThreadMetrics | null;
    gcMetrics?: import('../../types').GcMetrics | null;
    idleRssKb?: number | null;
    capabilities?: MetricCapabilities | null;
    onBack?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ runId, telemetry, heapSnapshot, analysis, artifactFootprint, concurrency, gcMetrics, idleRssKb, capabilities, onBack }) => {
    const [liveFootprint, setLiveFootprint] = useState<ArtifactFootprint | null>(null);
    const caps = capabilities;

    useEffect(() => {
        setLiveFootprint(null);
        const unlistenPromise = listen<ArtifactFootprint>('artifact-footprint', (event) => {
            setLiveFootprint(event.payload);
        });
        return () => { unlistenPromise.then(unlisten => unlisten()); };
    }, [runId]);

    const isLive = !runId && !telemetry;
    const hasData = telemetry && telemetry.length > 0;
    const hasEbpf = caps?.ebpfMalloc || caps?.ebpfMmap;

    if (!hasData && !isLive) return <DashboardSkeleton />;

    const showHeatmaps = isLive;

    return (
        <div className="flex-1 flex flex-col gap-6 w-full max-w-7xl mx-auto pb-8 animate-in fade-in duration-500">
            <DashboardHeader runId={runId} isLive={isLive} onBack={onBack} />

            <div className="grid grid-cols-1 gap-6">
                {/* /proc telemetry — always available */}
                {caps?.procTelemetry && <MainGraph data={telemetry} />}

                {/* eBPF heap analysis — only for Manual (Native) profiles */}
                {caps?.profile === 'manual' && hasEbpf && analysis && (
                    <AnalysisPanel analysis={analysis} idleRssKb={idleRssKb} />
                )}

                {/* Artifact footprint — only for compiled native languages */}
                {caps?.artifactFootprint && (artifactFootprint || liveFootprint) && (
                    <ArtifactFootprintPanel footprint={artifactFootprint || liveFootprint} />
                )}

                {/* Heatmaps: visible only during live execution */}
                {showHeatmaps && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <HeapHeatmap initialData={heapSnapshot} />
                        <ThreadHeatmap />
                    </div>
                )}

                {(() => {
                    const panels: { key: string; node: React.ReactNode }[] = [];
                    if (caps?.profile === 'manual' && hasEbpf && analysis)
                        panels.push({ key: 'size', node: <SizeDistributionHistogram analysis={analysis} /> });
                    if (caps?.concurrency && concurrency)
                        panels.push({ key: 'conc', node: <ConcurrencyPanel concurrency={concurrency} /> });
                    if (caps?.procTelemetry && telemetry && telemetry.length > 0)
                        panels.push({ key: 'hw', node: <HardwareEfficiency data={telemetry} /> });
                    if (caps?.gcMetrics && gcMetrics)
                        panels.push({ key: 'gc', node: <GCPanel gc={gcMetrics} telemetry={telemetry} /> });

                    if (panels.length === 0) return null;
                    const isOdd = panels.length % 2 !== 0;

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {panels.map((p, i) => (
                                <div key={p.key} className={isOdd && i === panels.length - 1 ? 'lg:col-span-2' : ''}>
                                    {p.node}
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
