import { useState } from "react";
import { Sidebar, PageView } from "./components/layout/Sidebar";
import { Home } from "./pages/Home";
import { Selection, ConfigState } from "./pages/Selection";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { ConfigModal } from "./components/shared/ConfigModal";
import { useExperimentRunner } from './hooks/useExperimentRunner';
import "./App.css";

function App() {
    const [currentPage, setCurrentPage] = useState<PageView>('home');
    const [config, setConfig] = useState<ConfigState>({
        variantId: "c_gcc_o2",
    });
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const {
        isRunning, telemetryData, heapSnapshot,
        analysisData, artifactFootprint, concurrencyData,
        gcMetrics, capabilities, runId, variants,
        runExperiment, loadReport
    } = useExperimentRunner();

    const handleRunTest = async () => {
        if (!config.programFile) return;
        setCurrentPage('dashboard');
        const success = await runExperiment(config.programFile, config.variantId);
        if (!success) setCurrentPage('selection');
    };

    return (
        <div className="flex w-screen h-screen dark:bg-bg overflow-hidden selection:bg-amber-500/30 font-sans transition-colors duration-300">
            <Sidebar
                currentPage={currentPage}
                onNavigate={(page) => {
                    if (page === 'settings') setIsConfigOpen(true);
                    else setCurrentPage(page as PageView);
                }}
            />
            <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                <header className="flex flex-col gap-1 mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-main flex items-center gap-2">HeapHop</h1>
                    <p className="text-text-muted font-medium">Advanced Memory & Performance Benchmarking</p>
                </header>

                {currentPage === 'home' && <Home />}
                {currentPage === 'selection' && (
                    <Selection
                        config={config}
                        variants={variants}
                        onChange={setConfig}
                        onRunTest={handleRunTest}
                        isRunning={isRunning}
                    />
                )}
                {currentPage === 'dashboard' && (
                    <Dashboard
                        runId={runId}
                        telemetry={telemetryData}
                        heapSnapshot={heapSnapshot}
                        analysis={analysisData}
                        artifactFootprint={artifactFootprint}
                        concurrency={concurrencyData}
                        gcMetrics={gcMetrics}
                        capabilities={capabilities}
                        onBack={() => setCurrentPage('selection')}
                    />
                )}
                {currentPage === 'history' && (
                    <History onSelectRun={(filename, report) => {
                        loadReport(filename, report);
                        setCurrentPage('dashboard');
                    }} />
                )}
            </div>
            <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
        </div>
    );
}

export default App;
