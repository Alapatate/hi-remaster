import {
  AuthButton,
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthHeadline,
  AuthScreen,
  BrandMark,
  EyeToggle,
} from '@/components/auth/AuthScaffold';
import { LanguagePicker } from '@/components/auth/LanguagePicker';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SignIn() {
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError(t('fillAllFields'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(protected)/dashboard');
    } catch (e: any) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen discs="signIn">
      <Animated.View
        entering={FadeInDown.duration(260)}
        className="flex-row items-start justify-between">
        <BrandMark />
        <LanguagePicker />
      </Animated.View>

      {/* Headline, form and CTA share the space below the wordmark, so the
          column stays balanced without the comp's SSO block to fill it. */}
      <View className="flex-1 justify-center py-8">
        <Animated.View entering={FadeInDown.delay(40).duration(260)}>
          <AuthHeadline>{t('welcomeBack')}</AuthHeadline>
          <Text className="mt-2.5 max-w-[280px] font-body text-[15px] leading-relaxed text-muted-foreground">
            {t('signInSubtitle')}
          </Text>
        </Animated.View>

        <View className="mt-9 gap-3.5">
          <AuthField
            entering={FadeInDown.delay(70).duration(260)}
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
          />
          <AuthField
            entering={FadeInDown.delay(100).duration(260)}
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
            right={<EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />}
          />
        </View>

        {error ? <AuthError message={error} /> : null}

        <View className="mt-10">
          <AuthButton
            entering={FadeInDown.delay(140).duration(260)}
            label={t('signIn')}
            loading={loading}
            onPress={handleSignIn}
          />
        </View>
      </View>

      <AuthFooterLink
        entering={FadeInDown.delay(175).duration(260)}
        prompt={t('noAccount')}
        action={t('createAccount')}
        onPress={() => router.push('/(auth)/sign-up')}
      />
    </AuthScreen>
  );
}
