import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOfflineSync } from '@/lib/hooks/useOfflineSync';

export function StatusBar() {
  const { isOnline, isSyncing, lastSyncAt, syncError, pendingCount, manualSync } = useOfflineSync();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        {/* Network Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          <span className={cn(
            "text-sm font-medium",
            isOnline ? "text-green-600" : "text-red-600"
          )}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Pending Count */}
        {pendingCount > 0 && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {pendingCount} pending
          </Badge>
        )}

        {/* Sync Status */}
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-600">Syncing...</span>
            </>
          ) : syncError ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">Sync failed</span>
            </>
          ) : lastSyncAt ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">
                Last sync: {formatTime(lastSyncAt)}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Manual Sync Button */}
      {(syncError || pendingCount > 0) && isOnline && (
        <Button
          onClick={manualSync}
          disabled={isSyncing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
          Retry Sync
        </Button>
      )}
    </div>
  );
}