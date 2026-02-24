import { useState, useEffect } from 'react';

export function useCountdown(expiryTimestamp: bigint) {
  const getRemaining = () => {
    const now = Date.now() * 1_000_000; // convert to nanoseconds
    const diff = Number(expiryTimestamp) - now;
    if (diff <= 0) return { hoursRemaining: 0, minutesRemaining: 0, isExpired: true };
    const totalMinutes = Math.floor(diff / 1_000_000 / 1000 / 60);
    const hoursRemaining = Math.floor(totalMinutes / 60);
    const minutesRemaining = totalMinutes % 60;
    return { hoursRemaining, minutesRemaining, isExpired: false };
  };

  const [state, setState] = useState(getRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(getRemaining());
    }, 60000);
    return () => clearInterval(interval);
  }, [expiryTimestamp]);

  return state;
}
