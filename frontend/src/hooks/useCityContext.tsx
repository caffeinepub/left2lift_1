import React, { createContext, useContext, useState } from 'react';

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const CityContext = createContext<CityContextType>({
  selectedCity: 'Mumbai',
  setSelectedCity: () => {},
});

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return sessionStorage.getItem('selectedCity') || 'Mumbai';
  });

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    sessionStorage.setItem('selectedCity', city);
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  return useContext(CityContext);
}
