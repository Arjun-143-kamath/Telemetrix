"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Tabs from '../ui/Tabs';
import LiveSessionsTab from './LiveSessionsTab';
import TrackDetailsTab from './TrackDetailsTab';
import AdvancedWeatherTab from './AdvancedWeatherTab';
import SessionResultsTab from './SessionResultsTab';

interface DashboardTabsProps {
  data: any;
}

export default function DashboardTabs({ data }: DashboardTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const tabParam = searchParams.get('tab');
  
  // Default to live if no tab is specified or invalid
  const validTabs = ['live', 'track', 'weather', 'results'];
  const activeTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'live';

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Tab Navigation (Segmented Control) */}
      <Tabs 
        options={[
          { id: 'live', label: 'Live Sessions' },
          { id: 'track', label: 'Track Details' },
          { id: 'weather', label: 'Advanced Weather' },
          { id: 'results', label: 'Session Results' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
        layoutId="dashboardTabIndicator"
        containerClassName="flex bg-secondary/20 p-1 rounded-full backdrop-blur-md border border-border/20 mb-8 sm:mb-12 overflow-x-auto max-w-full no-scrollbar relative"
      />

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'live' && <LiveSessionsTab data={data} />}
        {activeTab === 'track' && <TrackDetailsTab data={data} />}
        {activeTab === 'weather' && <AdvancedWeatherTab data={data} />}
        {activeTab === 'results' && <SessionResultsTab data={data} />}
      </div>
      
    </div>
  );
}
