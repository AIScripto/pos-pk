import React, { useState, useEffect } from 'react';
import { useOffline } from './offline-context';
import { AlertCircle, WifiOff, CheckCircle2, RotateCw, AlertTriangle, Trash2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, queueLength, queueItems, triggerSync, clearFailedQueueItems } = useOffline();
  const [showDetails, setShowDetails] = useState(false);

  const failedItems = queueItems.filter(item => item.retries >= item.maxRetries);
  const hasFailedItems = failedItems.length > 0;

  // Auto-expand details if there are newly stuck/failed items
  useEffect(() => {
    if (hasFailedItems) {
      setShowDetails(true);
    }
  }, [hasFailedItems]);

  if (isOnline && !isSyncing && queueLength === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`rounded-lg p-3 shadow-lg flex items-center gap-3 cursor-pointer transition-all border ${
          isOnline
            ? hasFailedItems
              ? 'bg-warning-subtle border-warning-border hover:bg-warning/50'
              : queueLength > 0
                ? 'bg-info-subtle border-info-border hover:bg-primary/50'
                : 'bg-success-subtle border-success-border hover:bg-success/50'
            : 'bg-danger-subtle border-danger-border hover:bg-danger/50'
        } ${isSyncing ? 'animate-pulse' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {!isOnline ? (
          <WifiOff className="w-5 h-5 text-danger-text flex-shrink-0" />
        ) : hasFailedItems ? (
          <AlertTriangle className="w-5 h-5 text-warning-text flex-shrink-0 animate-pulse" />
        ) : queueLength > 0 ? (
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-success-text flex-shrink-0" />
        )}

        <div className="text-sm font-medium">
          {!isOnline ? (
            <span className="text-danger-text">Offline</span>
          ) : hasFailedItems ? (
            <span className="text-warning-text font-semibold">
              {queueLength} pending ({failedItems.length} stuck)
            </span>
          ) : queueLength > 0 ? (
            <span className="text-primary">
              {isSyncing ? 'Syncing...' : `${queueLength} pending`}
            </span>
          ) : (
            <span className="text-success-text">Synced</span>
          )}
        </div>

        {isSyncing && <RotateCw className="w-4 h-4 animate-spin text-primary flex-shrink-0" />}
      </div>

      {showDetails && queueLength > 0 && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl p-4 w-80 border border-border text-foreground animate-slide-up">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold">Sync Queue Details</span>
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-mono font-semibold">
              {queueLength} item{queueLength !== 1 ? 's' : ''}
            </span>
          </div>

          {/* List of last 3 items in queue */}
          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
            {queueItems.slice(-3).map((item) => {
              const isStuck = item.retries >= item.maxRetries;
              return (
                <div key={item.id} className={`p-2 rounded-lg border text-xs leading-normal ${
                  isStuck 
                    ? 'bg-danger-subtle border-danger-border text-danger-text' 
                    : 'bg-muted/40 border-border text-muted-foreground'
                }`}>
                  <div className="flex justify-between items-center font-mono font-bold mb-1">
                    <span className="truncate max-w-[180px]">{item.method} {item.path.split('?')[0].replace('/api/v1', '')}</span>
                    <span className="text-2xs opacity-80 shrink-0">
                      {item.retries}/{item.maxRetries} retries
                    </span>
                  </div>
                  {item.lastError && (
                    <p className="text-2xs italic leading-tight truncate" title={item.lastError}>
                      Error: {item.lastError}
                    </p>
                  )}
                </div>
              );
            })}
            {queueItems.length > 3 && (
              <p className="text-center text-2xs text-muted-foreground mt-1">
                + {queueItems.length - 3} more items in queue
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerSync();
              }}
              disabled={!isOnline || isSyncing}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                isOnline && !isSyncing
                  ? 'bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-sm shadow-primary/10'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
              }`}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
            
            {hasFailedItems && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFailedQueueItems();
                }}
                className="p-2 rounded-lg bg-danger-subtle border border-danger-border text-danger-text hover:bg-danger-subtle hover:text-danger-text transition-all flex items-center justify-center shrink-0"
                title="Clear Stuck Items"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
