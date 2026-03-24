import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function SignUp() {
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError(t('fillAllFields'));
      return;
    }
    if (password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background">
      <View className="flex-1 justify-center px-6">
        <View className="mb-10">
          <Text variant="h1" className="mb-2 text-left text-3xl">
            {t('createAccount')}
          </Text>
          <Text variant="muted">{t('signUpSubtitle')}</Text>
        </View>

        <View className="gap-4">
          <Input
            placeholder={t('fullName')}
            value={name}
            onChangeText={setName}
            autoComplete="name"
          />
          <Input
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            placeholder={t('passwordHint')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          {error ? (
            <Text className="text-sm text-destructive">{error}</Text>
          ) : null}

          <Button onPress={handleSignUp} disabled={loading} className="mt-2">
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text>{t('createAccountBtn')}</Text>
            )}
          </Button>
        </View>

        <View className="mt-8 flex-row items-center justify-center gap-1">
          <Text variant="muted">{t('alreadyAccount')}</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Button variant="link" className="h-auto p-0">
              <Text className="text-sm font-medium text-foreground underline">{t('signIn')}</Text>
            </Button>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
