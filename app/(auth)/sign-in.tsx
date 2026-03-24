import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function SignIn() {
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
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
            {t('welcomeBack')}
          </Text>
          <Text variant="muted">{t('signInSubtitle')}</Text>
        </View>

        <View className="gap-4">
          <Input
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            placeholder={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          {error ? (
            <Text className="text-sm text-destructive">{error}</Text>
          ) : null}

          <Button onPress={handleSignIn} disabled={loading} className="mt-2">
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text>{t('signIn')}</Text>
            )}
          </Button>
        </View>

        <View className="mt-8 flex-row items-center justify-center gap-1">
          <Text variant="muted">{t('noAccount')}</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Button variant="link" className="h-auto p-0">
              <Text className="text-sm font-medium text-foreground underline">{t('signUp')}</Text>
            </Button>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
