import { useState, useEffect } from 'react';

export function useRealTime() {
  const [time, setTime] = useState<string>('9:41');

  useEffect(() => {
    // Only run on the client side
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      
      // Convert to 12-hour format if desired, or keep 24-hour (iOS defaults to user preference, let's use 12-hour format without AM/PM for standard simulator look, e.g. 9:41, 10:15, 2:30)
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      setTime(`${hours}:${minutes}`);
    };

    updateTime(); // Initial set
    
    // Calculate ms until next minute starts to sync perfectly
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    
    let intervalId: NodeJS.Timeout;
    
    const timeoutId = setTimeout(() => {
      updateTime();
      intervalId = setInterval(updateTime, 60000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return time;
}
