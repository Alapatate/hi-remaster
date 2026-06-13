import '@/global.css';
import 'react-native-url-polyfill/auto';
import '@/lib/i18n';

import { client } from '@/lib/appwrite';
import { AuthProvider, useAuth } from '@/lib/auth';
import { NAV_THEME } from '@/lib/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  useEffect(() => {
    client
      .call('GET', new URL(client.config.endpoint + '/health'))
      .then(() => console.log('Appwrite ping successful'))
      .catch((e) => {
        if (e?.message === 'Network request failed') {
          console.error('Appwrite ping failed: could not reach server', e);
        } else {
          console.log('Appwrite ping successful (server reachable, got:', e?.message, ')');
        }
      });
  }, []);

  return (
    <AuthProvider>
      <ThemedLayout />
    </AuthProvider>
  );
}

function ThemedLayout() {
  const { user } = useAuth();
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    const theme = (user?.prefs as Record<string, string>)?.theme;
    if (theme === 'dark' || theme === 'light') {
      setColorScheme(theme);
    }
  }, [user?.prefs]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="video/[id]" options={{ animation: 'fade', animationDuration: 280 }} />
          </Stack>
          <PortalHost />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
