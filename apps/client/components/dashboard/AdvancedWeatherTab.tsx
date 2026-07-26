"use client";

import React, { useEffect, useState } from 'react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import GsapFadeIn from '../ui/GsapFadeIn';
import EmptyState from '../ui/EmptyState';

interface AdvancedWeatherTabProps {
  data: any;
}

export default function AdvancedWeatherTab({ data }: AdvancedWeatherTabProps) {
  const { weather } = data;
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Simulate updating the "last updated" time
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 60000); // update every minute just for UI ticking
    return () => clearInterval(interval);
  }, []);

  if (!weather) {
    return (
      <EmptyState 
        title="Weather Data Unavailable" 
        message="Telemetry connection could not be established." 
      />
    );
  }

  return (
    <GsapFadeIn className="w-full flex flex-col items-center justify-center min-h-[50vh] mt-8" duration={0.5} yOffset={20}>
      
      <div className="w-full max-w-5xl flex flex-col gap-8">
        
        {/* Header */}
        <Card className="w-full sm:flex-row items-start sm:items-center justify-between">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.5)]"></div>
               <h2 className="text-lg font-black uppercase tracking-widest text-foreground">Live Telemetry active</h2>
             </div>
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
               Source: {weather.source || 'Sensors'}
             </span>
          </div>
          <div className="flex flex-col sm:items-end mt-4 sm:mt-0">
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Last Updated</span>
             <span className="text-sm font-bold text-foreground">{time}</span>
             <span className="text-[10px] text-muted-foreground font-bold tracking-wider text-primary mt-1">Updates every 15 mins</span>
          </div>
        </Card>

        {/* Primary Data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
          
          <Card>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">Track Temp</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl lg:text-5xl font-black text-foreground">{weather.track_temperature != null ? weather.track_temperature : '--'}</span>
              <span className="text-lg text-muted-foreground">°C</span>
            </div>
          </Card>

          <Card>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">Air Temp</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl lg:text-5xl font-black text-foreground">{weather.air_temperature != null ? weather.air_temperature : '--'}</span>
              <span className="text-lg text-muted-foreground">°C</span>
            </div>
          </Card>

          <Card>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">Rain Risk</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl lg:text-4xl font-black ${weather.rainfall && weather.rainfall > 0 ? 'text-primary' : 'text-success'}`}>
                {weather.rainfall && weather.rainfall > 0 ? 'YES' : 'NO'}
              </span>
            </div>
          </Card>

          <Card>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">Humidity</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl lg:text-5xl font-black text-foreground">{weather.humidity != null ? weather.humidity : '--'}</span>
              <span className="text-lg text-muted-foreground">%</span>
            </div>
          </Card>

        </div>

        {/* Secondary Data (Wind & Turns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
           
           <Card className="justify-center h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-4 bg-primary rounded-full"></div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Wind Conditions</h3>
            </div>
             <div className="flex items-center gap-4">
                <svg className="w-10 h-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Wind Speed</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-foreground">{weather.wind_speed != null ? weather.wind_speed : '--'}</span>
                    <span className="text-sm text-muted-foreground font-bold">m/s</span>
                  </div>
                </div>
             </div>
           </Card>

           <Card className="h-full">
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-4">Sector Wind Analytics</span>
             
             <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between">
                 <span className="text-xs font-bold text-foreground">Turn 1 (Main Straight)</span>
                 <span className="text-xs text-muted-foreground font-mono">Headwind</span>
               </div>
               <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                 <div className="w-3/4 h-full bg-primary/50"></div>
               </div>
               
               <div className="flex items-center justify-between mt-2">
                 <span className="text-xs font-bold text-foreground">Turn 4 (Fast Sweeper)</span>
                 <span className="text-xs text-muted-foreground font-mono">Crosswind</span>
               </div>
               <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                 <div className="w-1/2 h-full bg-warning/50"></div>
               </div>

               <div className="flex items-center justify-between mt-2">
                 <span className="text-xs font-bold text-foreground">Turn 11 (Hairpin)</span>
                 <span className="text-xs text-muted-foreground font-mono">Tailwind</span>
               </div>
               <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                 <div className="w-5/6 h-full bg-success/50"></div>
               </div>
             </div>
           </Card>

        </div>

      </div>

    </GsapFadeIn>
  );
}
