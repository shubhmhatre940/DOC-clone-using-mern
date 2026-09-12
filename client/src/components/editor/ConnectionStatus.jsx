import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Status indicator for the real-time collaboration WebSocket connection
 * status: 'connected' | 'connecting' | 'disconnected'
 */
const ConnectionStatus = ({ status }) => {
  if (status === 'connected') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium" title="Real-time collaboration active">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Live</span>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium" title="Connecting to collaboration server...">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-[11px] font-medium" title="Offline - attempting to reconnect...">
      <WifiOff className="w-3 h-3 text-gray-500" />
      <span>Offline</span>
    </div>
  );
};

export default ConnectionStatus;
