import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { useAuth } from '@/lib/auth';
import { Redirect, withLayoutContext } from 'expo-router';
import { useTranslation } from 'react-i18next';

const { Navigator } = createNativeBottomTabNavigator();
const Tabs = withLayoutContext(Navigator);

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen
        name="videos"
        options={{
          title: t('sessionsTab'),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('journeyTab'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
        }}
      />
    </Tabs>
  );
}
