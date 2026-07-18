export const getDaysToRace = (date?: string, time: string = '00:00:00Z'): number => {
  if (!date) return 0;
  const raceDate = new Date(`${date}T${time}`);
  const now = new Date();
  
  // Normalize to UTC midnight to avoid timezone shift issues on day boundaries
  const raceDay = Date.UTC(raceDate.getFullYear(), raceDate.getMonth(), raceDate.getDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  
  return Math.max(0, Math.floor((raceDay - today) / (1000 * 3600 * 24)));
};

export const formatDate = (dateString?: string, timeString: string = '00:00:00Z'): string => {
  if (!dateString) return 'TBA';
  const d = new Date(`${dateString}T${timeString}`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (dateString?: string, timeString: string = '00:00:00Z'): string => {
  if (!dateString) return 'TBA';
  const d = new Date(`${dateString}T${timeString}`);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export interface SessionStatus {
  isLive: boolean;
  isDone: boolean;
  timeString: string;
}

export const getSessionStatus = (
  dateStr?: string, 
  timeStr: string = '00:00:00Z', 
  openF1EndTimeStr?: string
): SessionStatus => {
  if (!dateStr) return { isLive: false, isDone: false, timeString: 'TBA' };
  
  const startObj = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  
  // If openF1 gives us an exact end time, use it. Otherwise, assume session is 2 hours long.
  let endTimeMs = startObj.getTime() + (2 * 3600 * 1000);
  if (openF1EndTimeStr) {
    endTimeMs = new Date(openF1EndTimeStr).getTime();
  }
  
  const isLive = now.getTime() >= startObj.getTime() && now.getTime() < endTimeMs;
  const isDone = now.getTime() >= endTimeMs;
  
  return {
    isLive,
    isDone,
    timeString: formatTime(dateStr, timeStr)
  };
};
