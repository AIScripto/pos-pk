import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * TillRestoringGate Component
 * 
 * Rendered while initial till status and shift data are being restored from backend.
 * Shows loading spinner with professional status messaging.
 * 
 * @component
 */
export const TillRestoringGate: React.FC = () => {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div>
          <h2 className="font-display text-xl font-extrabold text-foreground">Checking Till</h2>
          <p className="mt-1 text-sm text-muted-foreground">Loading the current shift status.</p>
        </div>
      </div>
    </main>
  );
};

export default TillRestoringGate;
