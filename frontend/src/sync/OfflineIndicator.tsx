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
              ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/50'
              : queueLength > 0
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100/50'
                : 'bg-green-50 border-green-200 hover:bg-green-100/50'
            : 'bg-red-50 border-red-200 hover:bg-red-100/50'
        } ${isSyncing ? 'animate-pulse' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {!isOnline ? (
          <WifiOff className="w-5 h-5 text-red-600 flex-shrink-0" />
        ) : hasFailedItems ? (
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-bounce" />
        ) : queueLength > 0 ? (
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        )}

        <div className="text-sm font-medium">
          {!isOnline ? (
            <span className="text-red-700">Offline</span>
          ) : hasFailedItems ? (
            <span className="text-amber-700 font-semibold">
              {queueLength} pending ({failedItems.length} stuck)
            </span>
          ) : queueLength > 0 ? (
            <span className="text-blue-700">
              {isSyncing ? 'Syncing...' : `${queueLength} pending`}
            </span>
          ) : (
            <span className="text-green-700">Synced</span>
          )}
        </div>

        {isSyncing && <RotateCw className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />}
      </div>

      {showDetails && queueLength > 0 && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl p-4 w-80 border border-gray-200 text-slate-800 animate-slide-up">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold">Sync Queue Details</span>
            <span className="text-xs bg-gray-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-semibold">
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
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-slate-50 border-slate-100 text-slate-600'
                }`}>
                  <div className="flex justify-between items-center font-mono font-bold mb-1">
                    <span className="truncate max-w-[180px]">{item.method} {item.path.split('?')[0].replace('/api/v1', '')}</span>
                    <span className="text-[10px] opacity-80 shrink-0">
                      {item.retries}/{item.maxRetries} retries
                    </span>
                  </div>
                  {item.lastError && (
                    <p className="text-[10px] italic leading-tight truncate" title={item.lastError}>
                      Error: {item.lastError}
                    </p>
                  )}
                </div>
              );
            })}
            {queueItems.length > 3 && (
              <p className="text-center text-[10px] text-slate-400 mt-1">
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
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-600/10'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
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
                className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all flex items-center justify-center shrink-0"
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
