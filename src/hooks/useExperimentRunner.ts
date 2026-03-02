import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { TelemetryDataPoint, HeapAnalysis, ArtifactFootprint, ThreadMetrics, GcMetrics, RunReport } from '../types';
import { LanguageVariant, MetricCapabilities } from '../lib/languages';

export interface ExperimentState {
    isRunning: boolean;
    telemetryData: TelemetryDataPoint[] | null;
    heapSnapshot: Record<string, number> | null;
    analysisData: HeapAnalysis | null;
    artifactFootprint: ArtifactFootprint | null;
    concurrencyData: ThreadMetrics | null;
    gcMetrics: GcMetrics | null;
    capabilities: MetricCapabilities | null;
    runId: string | null;
}

export function useExperimentRunner() {
    const [variants, setVariants] = useState<LanguageVariant[]>([]);
    const [state, setState] = useState<ExperimentState>({
        isRunning: false,
        telemetryData: null,
        heapSnapshot: null,
        analysisData: null,
        artifactFootprint: null,
        concurrencyData: null,
        gcMetrics: null,
        capabilities: null,
        runId: null
    });

    // Load language variants from backend on mount
    useEffect(() => {
        invoke<LanguageVariant[]>('list_languages')
            .then(setVariants)
            .catch(e => console.error("Failed to load languages:", e));
    }, []);

    const runExperiment = async (filePath: string, variantId: string) => {
        if (!filePath || !variantId) return false;

        setState({
            isRunning: true, telemetryData: null, heapSnapshot: null,
            analysisData: null, artifactFootprint: null, concurrencyData: null,
            gcMetrics: null, capabilities: null, runId: null
        });

        try {
            const results = await invoke<{
                telemetry: TelemetryDataPoint[],
                heapSnapshot: Record<string, number> | null,
                analysis: HeapAnalysis,
                artifactFootprint: ArtifactFootprint | null,
                concurrency: ThreadMetrics | null,
                gcMetrics: GcMetrics | null,
                capabilities: MetricCapabilities,
            }>('start_experiment', {
                variantId,
                filePath,
                iterations: 30,
                warmups: 3,
            });

            setState(prev => ({
                ...prev, isRunning: false,
                telemetryData: results.telemetry,
                heapSnapshot: results.heapSnapshot,
                analysisData: results.analysis,
                artifactFootprint: results.artifactFootprint,
                concurrencyData: results.concurrency,
                gcMetrics: results.gcMetrics,
                capabilities: results.capabilities,
            }));
            return true;
        } catch (error) {
            console.error("Experiment failed:", error);
            alert(`Execution Engine Error: ${error}`);
            setState(prev => ({ ...prev, isRunning: false }));
            return false;
        }
    };

    const loadReport = (filename: string, report: RunReport) => {
        setState({
            isRunning: false, runId: filename,
            telemetryData: report.telemetry,
            heapSnapshot: report.heapSnapshot || null,
            analysisData: report.analysis || null,
            artifactFootprint: report.artifactFootprint || null,
            concurrencyData: report.concurrency || null,
            gcMetrics: report.gcMetrics || null,
            capabilities: report.capabilities || null,
        });
    };

    return { ...state, variants, runExperiment, loadReport };
}
