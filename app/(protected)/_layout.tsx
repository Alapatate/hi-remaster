import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { useAuth } from '@/lib/auth';
import { Redirect, withLayoutContext } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createNativeBottomTabNavigator();
const Tabs = withLayoutContext(Navigator);

const TAB_BAR_PILL_RADIUS = 28;
const TAB_BAR_HORIZONTAL_MARGIN = 20;
const TAB_BAR_BOTTOM_INSET = 12;

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  const isDark = colorScheme === 'dark';
  const tabBarBottom = insets.bottom + TAB_BAR_BOTTOM_INSET;

  return (
    <Tabs
      tabBarActiveTintColor={isDark ? '#fafafa' : '#171717'}
      tabBarInactiveTintColor={isDark ? '#a3a3a3' : '#737373'}
      screenOptions={
        {
          tabBarStyle: {
            position: 'absolute',
            left: TAB_BAR_HORIZONTAL_MARGIN,
            right: TAB_BAR_HORIZONTAL_MARGIN,
            bottom: tabBarBottom,
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            elevation: 0,
            backgroundColor: 'transparent',
            borderRadius: TAB_BAR_PILL_RADIUS,
            overflow: 'hidden',
          },
          tabBarBackground: () => (
            <BlurView
              intensity={50}
              tint={isDark ? 'dark' : 'light'}
              style={{ flex: 1, borderRadius: TAB_BAR_PILL_RADIUS, overflow: 'hidden' }}
            />
          ),
        } as any
      }>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('dashboard'),
          tabBarIcon: () => require('@/assets/icons/dashboard.png'),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: t('videos'),
          tabBarIcon: () => require('@/assets/icons/videos.png'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: () => require('@/assets/icons/profile.png'),
        }}
      />
    </Tabs>
  );
}
