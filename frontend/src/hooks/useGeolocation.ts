// src/hooks/useGeolocation.ts
import { useState, useEffect, useRef } from 'react';
import { agentsApi } from '../api/services/agents';
import { useAuth } from './useAuth';

interface LocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  isTracking: boolean;
}

export const useGeolocation = (isActiveRun: boolean) => {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    error: null,
    isTracking: false,
  });
  
  const watcherId = useRef<number | null>(null);
  const lastSyncTime = useRef<number>(0);

  useEffect(() => {
    // Only track if the agent is actively working and we have their user ID
    if (!isActiveRun || !user?.id) {
      if (watcherId.current !== null) {
        navigator.geolocation.clearWatch(watcherId.current);
        watcherId.current = null;
        setLocation(prev => ({ ...prev, isTracking: false }));
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setLocation(prev => ({ ...prev, error: 'Geolocation is not supported by your browser' }));
      return;
    }

    setLocation(prev => ({ ...prev, isTracking: true, error: null }));

    watcherId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setLocation(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          error: null,
        }));

        // Throttle backend updates to once every 30 seconds to save battery/bandwidth
        const now = Date.now();
        if (now - lastSyncTime.current > 30000) {
          try {
            await agentsApi.updateLocation(user.id, { lat: latitude, lng: longitude });
            lastSyncTime.current = now;
          } catch (error) {
            console.error('Failed to sync agent location', error);
          }
        }
      },
      (error) => {
        setLocation(prev => ({ ...prev, error: error.message }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );

    // Cleanup watcher on unmount or when isActiveRun turns false
    return () => {
      if (watcherId.current !== null) {
        navigator.geolocation.clearWatch(watcherId.current);
      }
    };
  }, [isActiveRun, user?.id]);

  return location;
};