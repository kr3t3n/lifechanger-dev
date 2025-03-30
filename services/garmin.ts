import { encode as btoa } from 'base-64';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface BodyBatteryEntry {
  respondent_id: number;
  body_battery_value: number;
  timestamp: number;
  time_local: string;
  time_utc: string;
}

export interface DailyStats {
  date: string;
  high: number;
  low: number;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export class GarminService {
  private static instance: GarminService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private static readonly API_BASE_URL = 'https://apis.garmin.com/wellness-api/rest';
  private static readonly STORAGE_KEY = 'garmin_tokens';

  private constructor() {
    this.loadTokens(); // Load tokens when instance is created
  }

  static getInstance(): GarminService {
    if (!GarminService.instance) {
      GarminService.instance = new GarminService();
    }
    return GarminService.instance;
  }

  private async loadTokens() {
    try {
      let tokens: string | null = null;
      
      if (Platform.OS === 'web') {
        tokens = localStorage.getItem(GarminService.STORAGE_KEY);
      } else {
        tokens = await SecureStore.getItemAsync(GarminService.STORAGE_KEY);
      }

      if (tokens) {
        const parsed = JSON.parse(tokens) as AuthTokens;
        this.accessToken = parsed.access_token;
        this.refreshToken = parsed.refresh_token;
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  private async saveTokens(tokens: AuthTokens) {
    try {
      const tokenString = JSON.stringify(tokens);
      
      if (Platform.OS === 'web') {
        localStorage.setItem(GarminService.STORAGE_KEY, tokenString);
      } else {
        await SecureStore.setItemAsync(GarminService.STORAGE_KEY, tokenString);
      }
      
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  async clearTokens() {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(GarminService.STORAGE_KEY);
      } else {
        await SecureStore.deleteItemAsync(GarminService.STORAGE_KEY);
      }
      
      this.accessToken = null;
      this.refreshToken = null;
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  async exchangeCodeForToken(code: string): Promise<void> {
    const clientId = process.env.EXPO_PUBLIC_GARMIN_CLIENT_ID;
    const clientSecret = process.env.EXPO_PUBLIC_GARMIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Garmin API credentials not configured');
    }

    console.log('Exchanging code for token...');
    
    try {
      const response = await fetch('https://connectapi.garmin.com/oauth-service/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
        }).toString(),
      });

      const responseText = await response.text();
      console.log('Token exchange response status:', response.status);
      
      if (!response.ok) {
        console.error('Token exchange failed:', responseText);
        throw new Error(`Failed to exchange code for token: ${response.status} - ${responseText}`);
      }
      
      try {
        const tokens: AuthTokens = JSON.parse(responseText);
        console.log('Token exchange successful, saving tokens...');
        await this.saveTokens(tokens);
      } catch (parseError) {
        console.error('Error parsing token response:', parseError);
        throw new Error('Invalid token response format');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  async fetchBodyBatteryData(startDate: string, endDate: string): Promise<DailyStats[]> {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated with Garmin');
      }

      const startTs = Math.floor(new Date(startDate).getTime() / 1000);
      const endTs = Math.floor(new Date(endDate).getTime() / 1000);

      const params = new URLSearchParams({
        uploadStartTimeInSeconds: startTs.toString(),
        uploadEndTimeInSeconds: endTs.toString(),
      });

      const response = await fetch(`${GarminService.API_BASE_URL}/stressDetails?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken();
          return this.fetchBodyBatteryData(startDate, endDate);
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch body battery data: ${errorText}`);
      }

      const data = await response.json();
      return this.processBodyBatteryData(data.stressDetails || []);
    } catch (error) {
      console.error('Error fetching body battery data:', error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const clientId = process.env.EXPO_PUBLIC_GARMIN_CLIENT_ID;
    const clientSecret = process.env.EXPO_PUBLIC_GARMIN_CLIENT_SECRET;

    const response = await fetch('https://connectapi.garmin.com/oauth-service/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to refresh token: ${errorText}`);
    }

    const tokens: AuthTokens = await response.json();
    await this.saveTokens(tokens);
  }

  private processBodyBatteryData(stressDetails: any[]): DailyStats[] {
    const dailyStats: { [key: string]: { high: number; low: number } } = {};

    stressDetails.forEach(detail => {
      if (detail.timeOffsetBodyBatteryValues) {
        const baseTime = detail.startTimeInSeconds;
        Object.entries(detail.timeOffsetBodyBatteryValues).forEach(([offset, value]) => {
          const timestamp = baseTime + parseInt(offset, 10);
          const date = new Date(timestamp * 1000).toISOString().split('T')[0];
          
          if (!dailyStats[date]) {
            dailyStats[date] = { high: -Infinity, low: Infinity };
          }
          
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            dailyStats[date].high = Math.max(dailyStats[date].high, numValue);
            dailyStats[date].low = Math.min(dailyStats[date].low, numValue);
          }
        });
      }
    });

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        high: stats.high === -Infinity ? 0 : stats.high,
        low: stats.low === Infinity ? 0 : stats.low
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}