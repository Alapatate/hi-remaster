import { AuthButton, AuthError, AuthScreen, BrandMark } from '@/components/auth/AuthScaffold';
import { ConsentChecks } from '@/components/legal/ConsentChecks';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import { consentPrefs, hasCurrentConsent } from '@/lib/legal/config';
import { Redirect } from 'expo-router';
import { ShieldCheckIcon } from 'lucide-react-native';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * Gate for signed-in accounts without a current consent record: accounts
 * created before the checkboxes existed, and every account after the documents
 * change (`LEGAL_VERSION`). The protected layout sends them here; once the
 * record is saved the redirect below takes them into the app.
 */
export default function ConsentScreen() {
  const { user, loading, updatePrefs, signOut } = useAuth();
  const { t } = useTranslation();
  const [age, setAge] = React.useState(false);
  const [terms, setTerms] = React.useState(false);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (hasCurrentConsent(user.prefs as Record<string, unknown>)) {
    return <Redirect href="/(protected)/videos" />;
  }

  const handleAccept = async () => {
    if (!age) {
      setError(t('ageRequired'));
      return;
    }
    if (!terms) {
      setError(t('termsRequired'));
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updatePrefs(consentPrefs());
    } catch (e: unknown) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthScreen discs="register">
      <View className="items-center">
        <BrandMark variant="inline" />
      </View>

      <View className="mt-10 items-center">
        <View
          className="mb-4 items-center justify-center rounded-full"
          style={{ width: 56, height: 56, backgroundColor: 'rgba(191,110,26,0.12)' }}>
          <ShieldCheckIcon size={26} color="#bf6e1a" />
        </View>
        <Text className="text-center font-heading text-foreground" style={{ fontSize: 28 }}>
          {t('consentTitle')}
        </Text>
        <Text
          className="mt-2.5 text-center font-body text-muted-foreground"
          style={{ fontSize: 15, lineHeight: 22 }}>
          {t('consentMessage')}
        </Text>
      </View>

      <View className="mt-8">
        <ConsentChecks
          age={age}
          terms={terms}
          onToggleAge={() => setAge((v) => !v)}
          onToggleTerms={() => setTerms((v) => !v)}
        />
      </View>

      {error ? <AuthError message={error} /> : null}

      <View className="mt-auto pt-9">
        <AuthButton label={t('consentConfirm')} loading={saving} onPress={handleAccept} />
        <TouchableOpacity
          onPress={() => signOut().catch(() => {})}
          activeOpacity={0.7}
          className="mt-3 items-center py-2">
          <Text className="font-body-medium text-muted-foreground" style={{ fontSize: 14.5 }}>
            {t('signOut')}
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreen>
  );
}
