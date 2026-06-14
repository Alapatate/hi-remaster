import { useAuth } from '@/lib/auth';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Redirect href="/(protected)/videos" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
