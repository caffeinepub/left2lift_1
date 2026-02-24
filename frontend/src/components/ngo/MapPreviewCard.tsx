import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { maharashtraCityCenters } from '../../lib/ngoMatchingEngine';

interface MapPreviewCardProps {
  donorAddress: string;
  ngoAddress: string;
  city: string;
}

export default function MapPreviewCard({ donorAddress, ngoAddress, city }: MapPreviewCardProps) {
  const center = maharashtraCityCenters[city] || maharashtraCityCenters['Mumbai'];
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.04},${center.lat - 0.04},${center.lng + 0.04},${center.lat + 0.04}&layer=mapnik&marker=${center.lat},${center.lng}`;

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 overflow-hidden mt-3">
      <div className="p-3 flex items-center gap-2 border-b border-primary/20">
        <Navigation className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm text-foreground">Route Preview</span>
      </div>
      <div className="p-3 flex gap-3 text-xs">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <MapPin className="w-3 h-3 text-secondary" />
            <span>From: {donorAddress || 'Donor location'}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3 h-3 text-primary" />
            <span>To: {ngoAddress}</span>
          </div>
        </div>
      </div>
      <div className="h-36 bg-muted">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          title="Route Map"
          loading="lazy"
        />
      </div>
    </div>
  );
}
