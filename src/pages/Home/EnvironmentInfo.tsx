import React, {useEffect, useState} from 'react';
import {HardDrive, TerminalWindow} from '@phosphor-icons/react';
import {invoke} from '@tauri-apps/api/core';

interface OsInfo {
 os_name: string;
 kernel_version: string;
}

export const EnvironmentInfo: React.FC = () => {
 const [info, setInfo] = useState<OsInfo>({os_name: 'Unknown OS', kernel_version: 'Unknown Kernel'});
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchOsInfo = async () => {
 try {
 // Assuming a backend command named "get_os_info" will be created
 const data = await invoke<OsInfo>('get_os_info');
 setInfo(data);
} catch (error) {
 console.warn("Failed to fetch OS info from Tauri backend. Ensure 'get_os_info' command is registered.", error);
 setInfo({os_name: 'Linux (Fallback)', kernel_version: 'Fallback Kernel Version'});
} finally {
 setLoading(false);
}
};

 fetchOsInfo();
}, []);

 return (
 <div className="bg-card border border-border-main p-6 rounded-xl flex flex-col gap-4 shadow-sm w-full">
 <h3 className="font-bold text-text-main flex items-center gap-2">
 <TerminalWindow size={20} className="text-text-muted" />
 Host Environment
 </h3>

 <div className="flex flex-col sm:flex-row gap-4">
 <div className="flex-1 bg-bg border border-border-main p-4 rounded-lg flex flex-col gap-1">
 <span className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
 <HardDrive size={14} /> OS Identity
 </span>
 <span className={`text-sm font-medium ${loading ? 'text-text-muted animate-pulse' : 'text-text-main'}`}>
 {loading ? 'Fetching...' : info.os_name}
 </span>
 </div>

 <div className="flex-1 bg-bg border border-border-main p-4 rounded-lg flex flex-col gap-1">
 <span className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
 <TerminalWindow size={14} /> Kernel Release
 </span>
 <span className={`text-sm font-medium ${loading ? 'text-text-muted animate-pulse' : 'text-text-main'}`}>
 {loading ? 'Fetching...' : info.kernel_version}
 </span>
 </div>
 </div>
 </div>
 );
};
