'use client';

import React, { useEffect, useState } from 'react';

export default function TrackLayoutWidget({ raceName, country }: { raceName: string; country?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImage() {
      try {
        // We use the country or fallback to race name for the scraper
        const query = country || raceName.replace(' Grand Prix', '');
        const res = await fetch(`/api/track-image?country=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch track image:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchImage();
  }, [raceName, country]);

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative">
      {loading ? (
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2"></div>
          <span className="text-xs text-muted-foreground">Scraping Official F1 Layout...</span>
        </div>
      ) : imageUrl ? (
        <img 
          src={imageUrl} 
          alt={`${raceName} Track Layout`} 
          className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        />
      ) : (
        <div className="text-xs text-muted-foreground text-center">
          [ No Track Map Available ]
        </div>
      )}
    </div>
  );
}
