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
import { ConsentChecks } from '@/components/legal/ConsentChecks';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import i18n, { languageChosenSignedOut } from '@/lib/i18n';
import { consentPrefs } from '@/lib/legal/config';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

const MIN_PASSWORD = 8;
/**
 * Character classes a password must mix. With 8 characters, the CNIL's password
 * recommendation asks for 3 of the 4 classes on top of Appwrite's rate-limited
 * sign-in.
 */
const MIN_PASSWORD_CLASSES = 3;

function passwordClasses(password: string): number {
  return [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
}

export default function SignUp() {
  const { signUp } = useAuth();
  const { t } = useTranslation();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [ageConfirmed, setAgeConfirmed] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
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
    if (passwordClasses(password) < MIN_PASSWORD_CLASSES) {
      setError(t('passwordTooWeak'));
      return;
    }
    if (!ageConfirmed) {
      setError(t('ageRequired'));
      return;
    }
    if (!termsAccepted) {
      setError(t('termsRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Seed the account: the current language, the flag that routes the first
      // launch through the language picker (skipped when the language was
      // already picked on the sign-in screen), and the dated record of the age
      // attestation and of the accepted documents.
      await signUp(email, password, name, {
        language: i18n.language ?? 'en',
        firstlogin: !languageChosenSignedOut(),
        ...consentPrefs(),
      });
      router.replace('/(protected)/dashboard');
    } catch (e: any) {
      setError(errorMessage(e));
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
        <Animated.View entering={FadeInDown.delay(160).duration(260)} className="mt-2 px-1">
          <ConsentChecks
            age={ageConfirmed}
            terms={termsAccepted}
            onToggleAge={() => setAgeConfirmed((v) => !v)}
            onToggleTerms={() => setTermsAccepted((v) => !v)}
          />
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
