import { AuthButton, AuthField, AuthFooterLink, AuthScreen, EyeToggle } from '@/components/auth/AuthScaffold';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function SignUp() {
  const { signUp } = useAuth();
  const { t } = useTranslation();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) { setError(t('fillAllFields')); return; }
    if (password.length < 8) { setError(t('passwordTooShort')); return; }
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/(protected)/dashboard');
    } catch (e: any) {
      setError(e?.message ?? t('fillAllFields'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen title={t('createAccount')} subtitle={t('signUpSubtitle')} heroRatio={0.32}>
      <View style={{ gap: 16 }}>
        <AuthField
          entering={FadeInDown.delay(200).duration(500)}
          label={t('fullName')}
          value={name}
          onChangeText={setName}
          autoComplete="name"
          autoCapitalize="words"
          returnKeyType="next"
        />
        <AuthField
          entering={FadeInDown.delay(260).duration(500)}
          label={t('email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="next"
        />
        <AuthField
          entering={FadeInDown.delay(320).duration(500)}
          label={t('passwordHint')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPw}
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={handleSignUp}
          right={<EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />}
        />
      </View>

      {error ? (
        <Animated.Text entering={FadeIn} className="mt-3 text-sm text-destructive">
          {error}
        </Animated.Text>
      ) : null}

      <AuthButton
        entering={FadeInDown.delay(400).duration(500)}
        label={t('createAccountBtn')}
        loading={loading}
        onPress={handleSignUp}
      />

      <AuthFooterLink
        entering={FadeInDown.delay(480).duration(500)}
        prompt={t('alreadyAccount')}
        action={t('signIn')}
        href="/(auth)/sign-in"
      />
    </AuthScreen>
  );
}
