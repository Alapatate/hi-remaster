import { AuthButton, AuthField, AuthFooterLink, AuthScreen, EyeToggle } from '@/components/auth/AuthScaffold';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function SignIn() {
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = async () => {
    if (!email || !password) { setError(t('fillAllFields')); return; }
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(protected)/dashboard');
    } catch (e: any) {
      setError(e?.message ?? t('fillAllFields'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen title={t('welcomeBack')} subtitle={t('signInSubtitle')}>
      <View style={{ gap: 16 }}>
        <AuthField
          entering={FadeInDown.delay(200).duration(500)}
          label={t('email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="next"
        />
        <AuthField
          entering={FadeInDown.delay(260).duration(500)}
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

      {error ? (
        <Animated.Text entering={FadeIn} className="mt-3 text-sm text-destructive">
          {error}
        </Animated.Text>
      ) : null}

      <AuthButton
        entering={FadeInDown.delay(340).duration(500)}
        label={t('signIn')}
        loading={loading}
        onPress={handleSignIn}
      />

      <AuthFooterLink
        entering={FadeInDown.delay(420).duration(500)}
        prompt={t('noAccount')}
        action={t('signUp')}
        href="/(auth)/sign-up"
      />
    </AuthScreen>
  );
}
