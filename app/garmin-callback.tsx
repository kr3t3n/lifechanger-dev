import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GarminService } from '@/services/garmin';
import { useLifeChangesStore } from '@/store/useLifeChangesStore';

export default function GarminCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const setAuthenticated = useLifeChangesStore(state => state.setAuthenticated);
  const [status, setStatus] = useState('Processing callback...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Callback received with params:', params);
        const code = params.code as string;
        
        if (!code) {
          const errorMsg = 'No authorization code received';
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }

        console.log('Received code, exchanging for token...');
        setStatus('Exchanging code for token...');
        
        const garminService = GarminService.getInstance();
        await garminService.exchangeCodeForToken(code);
        
        console.log('Token exchange successful');
        setStatus('Authentication successful! Redirecting...');
        setAuthenticated(true);
        
        // Short delay before redirect to ensure state updates
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error handling Garmin callback:', errorMsg);
        setError(errorMsg);
      }
    };

    handleCallback();
  }, [params, router, setAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 10,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    maxWidth: '80%',
    textAlign: 'center',
  },
});