import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { useAuth } from '@/lib/auth';
import { hasCurrentConsent } from '@/lib/legal/config';
import { Redirect, withLayoutContext } from 'expo-router';
import { useTranslation } from 'react-i18next';

const { Navigator } = createNativeBottomTabNavigator();
const Tabs = withLayoutContext(Navigator);

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  // No use of the app without the age attestation and the current Terms and
  // Privacy Policy accepted — older accounts, or after the documents change.
  if (!hasCurrentConsent(user.prefs as Record<string, unknown>)) {
    return <Redirect href={'/legal/consent' as never} />;
  }
  // A freshly created account has not picked its language yet — the one-time
  // chooser runs before the tabs mount, and clears the flag on its way out.
  if ((user.prefs as Record<string, unknown>)?.firstlogin === true) {
    return <Redirect href="/choose-language" />;
  }

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
