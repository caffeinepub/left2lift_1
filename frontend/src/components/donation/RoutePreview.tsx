import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { maharashtraCityCenters } from '../../lib/ngoMatchingEngine';

interface RoutePreviewProps {
  donorAddress: string;
  ngoAddress: string;
  city: string;
}

export default function RoutePreview({ donorAddress, ngoAddress, city }: RoutePreviewProps) {
  const center = maharashtraCityCenters[city] || maharashtraCityCenters['Mumbai'];
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.05},${center.lat - 0.05},${center.lng + 0.05},${center.lat + 0.05}&layer=mapnik&marker=${center.lat},${center.lng}`;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 overflow-hidden animate-fade-in-up">
      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Route Preview</h3>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-secondary border-2 border-secondary-600" />
            <div className="w-0.5 h-8 bg-gradient-to-b from-secondary to-primary" />
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary-600" />
          </div>
          <div className="flex flex-col gap-4 flex-1">
            <div>
              <div className="text-xs text-muted-foreground">Pickup from</div>
              <div className="text-sm font-medium text-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3 text-secondary" />
                {donorAddress || 'Your location'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Deliver to</div>
              <div className="text-sm font-medium text-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                {ngoAddress}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative h-48 bg-muted">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          title="Route Map"
          loading="lazy"
        />
      </div>
      <div className="p-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Powered by OpenStreetMap</span>
        <a
          href={`https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lng}#map=14/${center.lat}/${center.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          View Full Map
        </a>
      </div>
    </div>
  );
}
