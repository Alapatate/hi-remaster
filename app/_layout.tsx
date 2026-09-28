import '@/global.css';
import 'react-native-url-polyfill/auto';
import '@/lib/i18n';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { QuitDialog } from '@/components/QuitDialog';
// Registers the foreground notification handler and is the single import that
// pulls the reminder scheduling code in at startup.
import { ensureChannel, useReminderPermissionCheck } from '@/features/reminders';
import { client } from '@/lib/appwrite';
import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from '@/lib/auth';
import { NAV_THEME } from '@/lib/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { BackHandler, Linking, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { BellOffIcon } from 'lucide-react-native';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  // Design-system faces used by the profile screen. Held behind the splash so
  // text never renders in the system font first and reflows.
  const [fontsLoaded, fontError] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  // Create the Android channel up front: a notification posted to a channel that
  // does not exist yet is silently dropped.
  useEffect(() => {
    ensureChannel().catch(() => {});
  }, []);

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

  // A font failure must not black-hole the app — fall back to system faces.
  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <ThemedLayout />
    </AuthProvider>
  );
}

function ThemedLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [quitVisible, setQuitVisible] = useState(false);

  // Reminders are stored on the account but ring through the OS, so an enabled
  // reminder is worth nothing if notifications are off on this device. Checked
  // once per signed-in user, on launch and on sign-in.
  const { blocked: notificationsBlocked, dismiss: dismissNotificationNotice } =
    useReminderPermissionCheck();
  // "/" is the splash: hold the notice back rather than popping it over the
  // animation the moment the session resolves.
  const onSplash = usePathname() === '/';

  useEffect(() => {
    const theme = (user?.prefs as Record<string, string>)?.theme;
    if (theme === 'dark' || theme === 'light') {
      setColorScheme(theme);
    }
  }, [user?.prefs]);

  // Android hardware back: when a normal back would leave the app (nothing left
  // to pop), intercept it and ask for confirmation instead of quitting outright.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) return false; // let the navigator pop as usual
      setQuitVisible(true);
      return true; // block the default exit
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="video/[id]"
              options={{ animation: 'fade', animationDuration: 280 }}
            />
            <Stack.Screen
              name="session-complete"
              options={{ animation: 'fade', gestureEnabled: false }}
            />
          </Stack>
          <ConfirmDialog
            visible={notificationsBlocked && !onSplash}
            icon={<BellOffIcon size={26} color="#bf6e1a" />}
            title={t('reminderPermissionTitle')}
            message={t('reminderPermissionBody')}
            confirmLabel={t('reminderOpenSettings')}
            cancelLabel={t('cancel')}
            onConfirm={() => {
              dismissNotificationNotice();
              Linking.openSettings().catch(() => {});
            }}
            onCancel={dismissNotificationNotice}
          />
          <QuitDialog
            visible={quitVisible}
            onCancel={() => setQuitVisible(false)}
            onConfirm={() => {
              setQuitVisible(false);
              BackHandler.exitApp();
            }}
          />
          <PortalHost />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
