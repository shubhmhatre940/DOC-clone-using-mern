import React, { useRef, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

/**
 * Status indicator for the real-time collaboration WebSocket connection.
 * Accurately indicates "Live" when connected, "Reconnecting..." on drop,
 * and recovers automatically using Yjs websocket provider reconnection behavior.
 *
 * @param {string} status - 'connected' | 'connecting' | 'disconnected'
 */
const ConnectionStatus = ({ status }) => {
  const hasBeenConnected = useRef(false);

  useEffect(() => {
    if (status === 'connected') {
      hasBeenConnected.current = true;
    }
  }, [status]);

  if (status === 'connected') {
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium select-none animate-in fade-in duration-200"
        title="Real-time collaboration active (Live)"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Live</span>
      </div>
    );
  }

  // If dropped after previously connected, or currently reconnecting
  if (status === 'disconnected' || (status === 'connecting' && hasBeenConnected.current)) {
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-medium select-none animate-in fade-in duration-200"
        title="Connection dropped — automatically attempting to reconnect to collaboration server..."
      >
        <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
        <span>Reconnecting...</span>
      </div>
    );
  }

  // Initial connection attempt before first sync
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium select-none animate-in fade-in duration-200"
      title="Connecting to collaboration server..."
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
      <span>Connecting...</span>
    </div>
  );
};

export default ConnectionStatus;
