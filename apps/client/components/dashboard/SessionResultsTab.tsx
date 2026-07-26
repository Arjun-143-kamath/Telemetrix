"use client";

import React, { useState } from 'react';
import Tabs from '../ui/Tabs';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import TyreBadges from '../TyreBadges';
import CompactPodium from '../CompactPodium';
import ClassificationList from '../ClassificationList';

interface SessionResultsTabProps {
  data: any;
}

export default function SessionResultsTab({ data }: SessionResultsTabProps) {
  const { nextRace, circuitStats, tyres, driverOfTheDay, fastestPitStop, nextRaceResults, nextRaceQualifying } = data;
  
  // Local state for the nested session tab (FP1, FP2, FP3, Quali, Race)
  const [activeSession, setActiveSession] = useState<string>('race');

  if (!nextRace) return null;

  // Build the list of all scheduled sessions for the weekend
  const sessions = [
    { id: 'fp1', label: 'FP1', date: nextRace.FirstPractice?.date, time: nextRace.FirstPractice?.time },
    { id: 'fp2', label: 'FP2', date: nextRace.SecondPractice?.date, time: nextRace.SecondPractice?.time },
    { id: 'fp3', label: 'FP3', date: nextRace.ThirdPractice?.date, time: nextRace.ThirdPractice?.time },
    { id: 'sprint_quali', label: 'Sprint Quali', date: nextRace.SprintShootout?.date, time: nextRace.SprintShootout?.time },
    { id: 'sprint', label: 'Sprint', date: nextRace.Sprint?.date, time: nextRace.Sprint?.time },
    { id: 'quali', label: 'Qualifying', date: nextRace.Qualifying?.date, time: nextRace.Qualifying?.time },
    { id: 'race', label: 'Race', date: nextRace.date, time: nextRace.time },
  ].filter(s => s.date && s.time);

  const selectedSession = sessions.find(s => s.id === activeSession) || sessions[sessions.length - 1];

  // Helper to check if a session is in the past (roughly determining if it has data)
  const now = new Date();
  const sessionStartTime = selectedSession ? new Date(`${selectedSession.date}T${selectedSession.time || '00:00:00Z'}`) : null;
  const isComplete = sessionStartTime && (now.getTime() > sessionStartTime.getTime() + (2 * 3600 * 1000)); // assumes session is roughly 2h

  // Formatted date for the header
  const headerDate = nextRace.date ? new Date(nextRace.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const raceName = nextRace.raceName ? nextRace.raceName.toUpperCase() : 'GRAND PRIX';

  // Determine what data to show for the selected session
  let resultsData: any[] = [];
  let showPodium = false;
  let sessionHasData = false;

  if (activeSession === 'fp1' && data.fp1Results) {
      resultsData = data.fp1Results;
      sessionHasData = true;
  } else if (activeSession === 'fp2' && data.fp2Results) {
      resultsData = data.fp2Results;
      sessionHasData = true;
  } else if (activeSession === 'fp3' && data.fp3Results) {
      resultsData = data.fp3Results;
      sessionHasData = true;
  } else if (activeSession === 'quali' && nextRaceQualifying) {
      // It might be nested in QualifyingResults from Ergast, or flat array from F1.com scraper
      resultsData = nextRaceQualifying.QualifyingResults || nextRaceQualifying;
      sessionHasData = true;
  } else if (activeSession === 'race' && nextRaceResults) {
      resultsData = nextRaceResults.Results || nextRaceResults;
      showPodium = true;
      sessionHasData = true;
  }
  
  // If the race hasn't happened but the session time passed, we might still not have data (e.g. FP1 data isn't in Ergast). 
  // We'll show "Results Not Yet Available" if sessionHasData is false for Quali/Race, or fallback to the schedule view.
  const displayResults = sessionHasData;

  return (
    <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4 min-h-[60vh] max-w-7xl mx-auto">
      
      {/* 1. Header (Race Name, Track, Date, Tyres) */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full border-b border-border/20 pb-6 mb-8">
         <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-1">
              {raceName}
            </h1>
            <h2 className="text-sm md:text-base font-medium text-muted-foreground">
              {nextRace.Circuit?.circuitName} - {nextRace.Circuit?.Location?.country}
            </h2>
         </div>
         <div className="flex flex-col items-start md:items-end mt-6 md:mt-0">
            <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2">
              {headerDate}
            </h3>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tyre Allocation:</span>
               <TyreBadges tyres={tyres || []} />
            </div>
         </div>
      </div>

      {/* 2. Nested Session Navigation */}
      <Tabs 
        options={sessions}
        activeTab={activeSession}
        onChange={setActiveSession}
        layoutId="sessionTabIndicator"
      />

      {/* 3. Session Content Area */}
      {!displayResults ? (
         <EmptyState 
           title="Results Not Yet Available"
           message={isComplete ? 'Data is being processed or not available for this session.' : `This session is scheduled for ${sessionStartTime?.toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}.`}
         />
      ) : (
         <div className="w-full flex flex-col gap-12">
            
            {/* If it's the race, show Driver of Day and Pitstop */}
            {activeSession === 'race' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Card className="items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Driver of the Day</span>
                  <span className={`text-2xl font-black ${driverOfTheDay === 'Info not available' ? 'text-primary' : 'text-foreground'}`}>{driverOfTheDay}</span>
                </Card>
                <Card className="items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Fastest Pitstop</span>
                  <span className={`text-xl font-black ${!fastestPitStop ? 'text-[#58a4ff]' : 'text-foreground'}`}>
                    {fastestPitStop ? `${fastestPitStop.duration}s (${fastestPitStop.driver_number})` : 'Info not available'}
                  </span>
                </Card>
              </div>
            )}

            {/* Podium Visualization */}
            {showPodium && resultsData.length >= 3 && (
              <div className="w-full flex justify-center py-8">
                 <CompactPodium podium={resultsData.slice(0, 3)} />
              </div>
            )}

            {/* Classification Table */}
            <div className="w-full bg-secondary/10 border border-border/10 rounded-3xl overflow-hidden backdrop-blur-sm">
               <ClassificationList results={resultsData} date={selectedSession?.date} sessionType={activeSession} />
            </div>
            
         </div>
      )}
    </div>
  );
}
