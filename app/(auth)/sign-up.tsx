import {
  AuthBackButton,
  AuthButton,
  AuthError,
  AuthField,
  AuthHeadline,
  AuthScreen,
  BrandMark,
  EyeToggle,
} from '@/components/auth/AuthScaffold';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { LANGUAGES } from '@/lib/languages';
import i18n from '@/lib/i18n';
import { router } from 'expo-router';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

const MIN_PASSWORD = 8;

export default function SignUp() {
  const { signUp, updatePrefs } = useAuth();
  const { t } = useTranslation();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [language, setLanguage] = React.useState<string>(i18n.language ?? 'en');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError(t('fillAllFields'));
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(t('passwordTooShort'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, name);
      // The chosen language is a normal preference, saved once the account
      // exists. A failure here must not block a successful registration.
      await updatePrefs({ language }).catch(() => {});
      router.replace('/(protected)/dashboard');
    } catch (e: any) {
      setError(e?.message ?? t('fillAllFields'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen discs="register">
      {/* Top bar: back, centred wordmark, and a spacer that keeps it centred */}
      <View className="flex-row items-center justify-between">
        <AuthBackButton onPress={() => router.back()} />
        <BrandMark variant="inline" />
        <View className="w-11" />
      </View>

      <Animated.View entering={FadeInDown.delay(40).duration(260)} className="mt-8">
        <AuthHeadline size={34}>{t('createAccount')}</AuthHeadline>
        <Text className="mt-2.5 font-body text-[15px] leading-relaxed text-muted-foreground">
          {t('signUpSubtitle')}
        </Text>
      </Animated.View>

      <View className="mt-7 gap-3.5">
        <AuthField
          entering={FadeInDown.delay(70).duration(260)}
          label={t('fullName')}
          value={name}
          onChangeText={setName}
          autoComplete="name"
          autoCapitalize="words"
          returnKeyType="next"
        />
        <AuthField
          entering={FadeInDown.delay(100).duration(260)}
          label={t('email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="next"
        />
        <Animated.View entering={FadeInDown.delay(130).duration(260)}>
          <AuthField
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
            right={<EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />}
          />
          <PasswordStrength password={password} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(260)}>
          <Text className="mb-2 font-body-semibold text-[12px] uppercase tracking-widest text-muted-foreground">
            {t('listeningLanguage')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const active = lang.code === language;
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => setLanguage(lang.code)}
                  activeOpacity={0.75}
                  className={`rounded-full px-4 py-2.5 ${
                    active ? 'bg-primary' : 'border border-border bg-card'
                  }`}>
                  <Text
                    className={`font-body-medium text-[14px] ${
                      active ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>

      {error ? <AuthError message={error} /> : null}

      <View className="mt-auto pt-9">
        <AuthButton
          entering={FadeInDown.delay(190).duration(260)}
          label={t('createAccountBtn')}
          loading={loading}
          onPress={handleSignUp}
        />
        <Text className="mt-3 px-2 text-center font-body text-[12.5px] leading-relaxed text-muted-foreground">
          {t('termsNotice')}
        </Text>
      </View>
    </AuthScreen>
  );
}

/**
 * Four-segment meter under the password field. Purely derived from what has
 * been typed — it gates nothing, the length check on submit does that.
 */
function PasswordStrength({ password }: { password: string }) {
  const score = React.useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= MIN_PASSWORD) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password) || password.length >= 14) s++;
    return s;
  }, [password]);

  return (
    <View className="mt-2 flex-row gap-1.5 px-2">
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < score ? 'bg-olive' : 'bg-border'}`}
        />
      ))}
    </View>
  );
}
