import { useAuth } from '@/lib/auth';
import { Redirect, Stack } from 'expo-router';

export const unstable_settings = {
  // Register is always pushed on top of sign-in, so a deep link straight to it
  // still has somewhere to go back to.
  initialRouteName: 'sign-in',
};

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Redirect href="/(protected)/videos" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      {/* `ios_from_right` is the same right-to-left push as `slide_from_right`
          but maps to a 200ms resource on Android instead of 400ms, and falls
          back to the native push on iOS. `animationDuration` is deliberately
          absent: it is iOS-only, so it silently did nothing here. */}
      <Stack.Screen name="sign-up" options={{ animation: 'ios_from_right' }} />
    </Stack>
  );
}
