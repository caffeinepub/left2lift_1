import React, { createContext, useContext, useState } from 'react';

interface EmergencyModeContextType {
  isEmergencyMode: boolean;
  toggleEmergencyMode: () => void;
}

const EmergencyModeContext = createContext<EmergencyModeContextType>({
  isEmergencyMode: false,
  toggleEmergencyMode: () => {},
});

export function EmergencyModeProvider({ children }: { children: React.ReactNode }) {
  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(() => {
    return sessionStorage.getItem('emergencyMode') === 'true';
  });

  const toggleEmergencyMode = () => {
    setIsEmergencyMode((prev) => {
      const next = !prev;
      sessionStorage.setItem('emergencyMode', String(next));
      return next;
    });
  };

  return (
    <EmergencyModeContext.Provider value={{ isEmergencyMode, toggleEmergencyMode }}>
      {children}
    </EmergencyModeContext.Provider>
  );
}

export function useEmergencyMode() {
  return useContext(EmergencyModeContext);
}
