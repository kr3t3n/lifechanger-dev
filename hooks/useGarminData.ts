import { useState, useEffect, useCallback } from 'react';
import { GarminService } from '@/services/garmin';
import { useLifeChangesStore } from '@/store/useLifeChangesStore';

export function useGarminData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setBodyBatteryData = useLifeChangesStore(state => state.setBodyBatteryData);
  const isAuthenticated = useLifeChangesStore(state => state.isAuthenticated);
  const setAuthenticated = useLifeChangesStore(state => state.setAuthenticated);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const garminService = GarminService.getInstance();
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const data = await garminService.fetchBodyBatteryData(startDate, endDate);
      setBodyBatteryData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Garmin data';
      setError(errorMessage);
      if (errorMessage.includes('authenticated') || errorMessage.includes('token')) {
        setAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, setBodyBatteryData, setAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      const garminService = GarminService.getInstance();
      setAuthenticated(garminService.isAuthenticated());
    };
    checkAuth();
  }, [setAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  return { isLoading, error, isAuthenticated, refetch: fetchData };
}