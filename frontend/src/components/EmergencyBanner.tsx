import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useEmergencyMode } from '../hooks/useEmergencyMode';
import { useLanguage } from '../hooks/useLanguage';

export default function EmergencyBanner() {
  const { isEmergencyMode, toggleEmergencyMode } = useEmergencyMode();
  const { t } = useLanguage();

  if (!isEmergencyMode) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 animate-pulse-emergency">
      <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm tracking-wide">{t('emergencyActive')}</span>
        </div>
        <button
          onClick={toggleEmergencyMode}
          className="hover:bg-red-700 rounded p-1 transition-colors"
          title="Deactivate Emergency Mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
