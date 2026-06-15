import { createContext, useContext, useState } from 'react';

export type Version = 'v1' | 'v2';

interface VersionContextType {
  version: Version;
  setVersion: (v: Version) => void;
}

const VersionContext = createContext<VersionContextType>({
  version: 'v2',
  setVersion: () => {},
});

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersionState] = useState<Version>(() => {
    try {
      return (localStorage.getItem('eluv8_version') as Version) || 'v2';
    } catch {
      return 'v2';
    }
  });

  const setVersion = (v: Version) => {
    setVersionState(v);
    try { localStorage.setItem('eluv8_version', v); } catch { /* noop */ }
  };

  return (
    <VersionContext.Provider value={{ version, setVersion }}>
      {children}
    </VersionContext.Provider>
  );
}

export const useVersion = () => useContext(VersionContext);
