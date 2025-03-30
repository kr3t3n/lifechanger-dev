import { StyleSheet, View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { GarminService } from '@/services/garmin';
import { Watch } from 'lucide-react-native';
import { useLifeChangesStore } from '@/store/useLifeChangesStore';
import Constants from 'expo-constants';

export function GarminAuthPrompt() {
  const setAuthenticated = useLifeChangesStore(state => state.setAuthenticated);

  // Get the redirect URI, prioritizing the one configured in app.config.js for web
  const redirectUri = Platform.select({
    web: Constants.expoConfig?.extra?.redirectUrl || 'https://lovely-nasturtium-df47c6.netlify.app/garmin-callback',
    default: makeRedirectUri({
      scheme: 'myapp',
      path: 'garmin-callback'
    })
  });

  const handleAuth = useCallback(async () => {
    try {
      const clientId = process.env.EXPO_PUBLIC_GARMIN_CLIENT_ID;
      if (!clientId) {
        console.error('Garmin Client ID not configured');
        return;
      }

      console.log('Using redirect URI:', redirectUri);

      const authUrl = `https://connect.garmin.com/oauthConfirm?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=activity.read,body_composition.read`;
      
      if (Platform.OS === 'web') {
        // For web, check if window exists before using it
        if (typeof window !== 'undefined') {
          console.log('Redirecting to Garmin auth page...');
          window.location.href = authUrl;
        }
      } else {
        // For native platforms, use WebBrowser
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
        
        if (result.type === 'success') {
          const code = new URL(result.url).searchParams.get('code');
          if (code) {
            const garminService = GarminService.getInstance();
            await garminService.exchangeCodeForToken(code);
            setAuthenticated(true);
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }, [setAuthenticated, redirectUri]);

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=2940&auto=format&fit=crop' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Watch size={48} color="#00D1FF" />
        <Text style={styles.title}>Connect Your Garmin Device</Text>
        <Text style={styles.description}>
          Track your body battery levels and discover how lifestyle changes impact your energy throughout the day.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>Connect to Garmin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#00D1FF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});