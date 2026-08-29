import { useEffect, useState } from 'react';

/**
 * Shown while a route chunk downloads.
 *
 * Most chunks arrive in well under a frame budget on a warm cache, and a spinner
 * that flashes for 80ms reads as a glitch rather than as progress — so this stays
 * invisible for the first quarter-second and only then admits it is waiting.
 */
export function RouteFallback() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-screen items-center justify-center bg-background"
    >
      <div
        className={
          'flex flex-col items-center gap-3 transition-opacity duration-200 ' +
          (visible ? 'opacity-100' : 'opacity-0')
        }
      >
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:160ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:320ms]" />
        </div>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
