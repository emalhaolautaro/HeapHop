import { Language, MetricCapabilities } from './lib/languages';

export interface TelemetryDataPoint {
    timeMs: number;
    rssKb: number;
    vmKb: number;
    faultsMinor: number;
    faultsMajor: number;
}

export interface HeapAnalysis {
    totalAllocatedBytes: number;
    mallocCount: number;
    freeCount: number;
    avgLifespanMs: number;
    sizeDistribution: Record<number, number>;
    mmapMmapCount: number;
    mmapMunmapCount: number;
}

export interface ArtifactFootprint {
    binarySizeBytes: number | null;
    textSizeBytes: number | null;
    dataSizeBytes: number | null;
}

export interface ThreadMetrics {
    voluntary: number;
    nonvoluntary: number;
    threadCount: number;
    threadsPeak: number;
}

export interface GcMetrics {
    gcCount: number;
    totalPauseMs: number;
    avgPauseMs: number;
    maxPauseMs: number;
    pauseStdDevMs: number;
    heapBeforeMb: number;
    heapAfterMb: number;
    tracemallocPeakKb: number | null;
}

export interface ReportSummary {
    filename: string;
    variantId: string;
    programFile: string;
    timestamp: number;
}

export interface RunReport {
    metadata: {
        variantId: string;
        language: Language;
        programFile: string;
        iterations: number;
        warmups: number;
        timestamp: number;
    };
    capabilities: MetricCapabilities;
    telemetry: TelemetryDataPoint[];
    heapSnapshot?: Record<string, number>;
    analysis?: HeapAnalysis;
    artifactFootprint?: ArtifactFootprint | null;
    concurrency?: ThreadMetrics | null;
    gcMetrics?: GcMetrics | null;
    idleRssKb?: number | null;
}
