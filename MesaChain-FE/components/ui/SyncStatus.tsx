import React from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { syncOfflineData } from '@/lib/syncManager';

export const SyncStatus = () => {
  const isOnline = useNetworkStatus();

  const handleSync = async () => {
    try {
      await syncOfflineData();
      alert('Sincronización completada con éxito.');
    } catch (error) {
      console.error('Error al sincronizar:', error);
      alert('Error al sincronizar. Revisa la consola.');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm mb-4">
      <div className="flex items-center gap-3">
        {/* Indicador de red */}
        <div className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </div>
        
        <span className="text-sm font-semibold text-slate-700">
          {isOnline ? 'Conectado a MesaChain' : 'Modo Offline (Local)'}
        </span>
      </div>

      {isOnline && (
        <button
          onClick={handleSync}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md transition-all shadow-sm"
        >
          Sincronizar Ahora
        </button>
      )}
    </div>
  );
};
