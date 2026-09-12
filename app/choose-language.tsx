import { AuthButton, AuthHeadline, AuthScreen, BrandMark } from '@/components/auth/AuthScaffold';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import i18n from '@/lib/i18n';
import { LANGUAGES } from '@/lib/languages';
import { Redirect, router } from 'expo-router';
import { CheckIcon } from 'lucide-react-native';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

/**
 * One-time language choice, shown on the first launch after registration and
 * gated on the `firstlogin` preference — picking a language clears the flag,
 * so the screen never comes back. Afterwards the profile owns the setting.
 */
export default function ChooseLanguage() {
  const { user, loading, updatePrefs } = useAuth();
  const { t } = useTranslation();

  const saved = (user?.prefs as Record<string, string>)?.language;
  const [language, setLanguage] = React.useState<string>(saved || i18n.language || 'en');
  const [saving, setSaving] = React.useState(false);

  // Preview the choice straight away: the headline and the button below are
  // already in the language being picked.
  const pick = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      await updatePrefs({ language, firstlogin: false });
      router.replace('/(protected)/videos');
    } catch {
      // A failed write leaves the flag set, so the screen simply asks again.
      setSaving(false);
    }
  };

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <AuthScreen discs="register">
      <BrandMark variant="inline" />

      <Animated.View entering={FadeInDown.delay(40).duration(260)} className="mt-10">
        <AuthHeadline size={34}>{t('chooseLanguageTitle')}</AuthHeadline>
        <Text className="mt-2.5 font-body text-[15px] leading-relaxed text-muted-foreground">
          {t('chooseLanguageSubtitle')}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(260)} className="mt-8 gap-2">
        {LANGUAGES.map((lang) => {
          const active = lang.code === language;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => pick(lang.code)}
              activeOpacity={0.75}
              className={`flex-row items-center justify-between rounded-2xl px-4 py-3.5 ${
                active ? 'bg-primary' : 'border border-border bg-card'
              }`}>
              <Text
                className={`font-body-medium text-[15px] ${
                  active ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                {lang.label}
              </Text>
              {active ? <CheckIcon size={17} color="white" /> : null}
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      <View className="mt-auto pt-9">
        <AuthButton
          entering={FadeInDown.delay(120).duration(260)}
          label={t('chooseLanguageConfirm')}
          loading={saving}
          onPress={handleContinue}
        />
      </View>
    </AuthScreen>
  );
}
