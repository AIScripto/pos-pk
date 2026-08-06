import React, {
  createContext, useContext, useState,
  useCallback, useEffect, ReactNode,
} from 'react';

interface LockContextValue {
  isLocked: boolean;
  lock:     () => void;
  unlock:   () => void;
}

const LockContext = createContext<LockContextValue | null>(null);

const STORAGE_KEY = 'pos-app-screen-locked';

export function LockProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  const lock = useCallback(() => {
    setIsLocked(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Lock automatically on page refresh / tab close so the next person
  // who loads the page always sees the lock screen.
  useEffect(() => {
    const handleUnload = () => localStorage.setItem(STORAGE_KEY, 'true');
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return (
    <LockContext.Provider value={{ isLocked, lock, unlock }}>
      {children}
    </LockContext.Provider>
  );
}

export function useLock(): LockContextValue {
  const ctx = useContext(LockContext);
  if (!ctx) throw new Error('useLock must be used inside <LockProvider>');
  return ctx;
}
