import { useBottomDockSpace } from '@/components/navigation/FloatingTabBar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];

export default function Profile() {
  const { user, signOut, updatePrefs } = useAuth();
  const { t } = useTranslation();
  const { setColorScheme } = useColorScheme();
  const dockSpace = useBottomDockSpace();
  const [langOpen, setLangOpen] = React.useState(false);
  const [savingLang, setSavingLang] = React.useState(false);
  const [savingTheme, setSavingTheme] = React.useState(false);
  const [savingNewsletter, setSavingNewsletter] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const currentLang = (user?.prefs as Record<string, string>)?.language ?? 'en';
  const currentLangLabel = LANGUAGES.find((l) => l.code === currentLang)?.label ?? 'English';
  const currentTheme = ((user?.prefs as Record<string, string>)?.theme ?? 'light') as
    | 'light'
    | 'dark';
  const newsletterEnabled = (user?.prefs as Record<string, unknown>)?.newsletter === true;

  const handleSelectLanguage = async (code: string) => {
    if (code === currentLang) {
      setLangOpen(false);
      return;
    }
    setSavingLang(true);
    setLangOpen(false);
    try {
      await updatePrefs({ language: code });
    } finally {
      setSavingLang(false);
    }
  };

  const handleSelectTheme = async (theme: 'light' | 'dark') => {
    if (theme === currentTheme) return;
    setSavingTheme(true);
    try {
      await updatePrefs({ theme });
      setColorScheme(theme);
    } finally {
      setSavingTheme(false);
    }
  };

  const handleToggleNewsletter = async (value: boolean) => {
    setSavingNewsletter(true);
    try {
      await updatePrefs({ newsletter: value });
    } finally {
      setSavingNewsletter(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } finally {
      setSigningOut(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-6"
      contentContainerStyle={{ paddingBottom: dockSpace }}>
      <View className="mb-8 mt-4">
        <Text variant="h2" className="border-0 pb-0 text-2xl">
          {t('profile')}
        </Text>
      </View>

      {/* Avatar + name */}
      <View className="mb-6 items-center gap-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
          <Text className="text-2xl font-bold text-primary-foreground">{initials}</Text>
        </View>
        <View className="items-center gap-0.5">
          <Text className="text-lg font-semibold">{user?.name}</Text>
          <Text variant="muted" className="text-sm">
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Account details */}
      <View className="mb-6">
        <Text variant="h4" className="mb-3">
          {t('account')}
        </Text>
        <View className="overflow-hidden rounded-xl border border-border bg-card">
          <Row label={t('userId')} value={user?.$id ?? '—'} />
          <Divider />
          <Row
            label={t('emailVerifiedLabel')}
            value={user?.emailVerification ? t('yes') : t('no')}
          />
          <Divider />
          <Row
            label={t('memberSinceLabel')}
            value={user?.$createdAt ? new Date(user.$createdAt).toLocaleDateString() : '—'}
          />
        </View>
      </View>

      {/* Preferences */}
      <View className="mb-8">
        <Text variant="h4" className="mb-3">
          {t('preferences')}
        </Text>
        <View className="overflow-hidden rounded-xl border border-border bg-card">
          <TouchableOpacity
            onPress={() => setLangOpen((v) => !v)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-4 py-3">
            <View className="gap-0.5">
              <Text className="text-sm font-medium">{t('preferredLanguage')}</Text>
              <Text variant="muted" className="text-xs">
                {savingLang ? t('saving') : currentLangLabel}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {savingLang && <ActivityIndicator size="small" />}
              {langOpen ? (
                <ChevronUpIcon size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDownIcon size={16} className="text-muted-foreground" />
              )}
            </View>
          </TouchableOpacity>

          {langOpen && (
            <>
              <Divider />
              {LANGUAGES.map((lang, i) => (
                <React.Fragment key={lang.code}>
                  {i > 0 && <Divider />}
                  <TouchableOpacity
                    onPress={() => handleSelectLanguage(lang.code)}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between px-4 py-3">
                    <Text className="text-sm">{lang.label}</Text>
                    {lang.code === currentLang && (
                      <CheckIcon size={16} className="text-foreground" />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </>
          )}

          <Divider />

          {/* Appearance row */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="gap-0.5">
              <Text className="text-sm font-medium">{t('appearance')}</Text>
              <Text variant="muted" className="text-xs">
                {savingTheme
                  ? t('saving')
                  : t(currentTheme === 'dark' ? 'darkTheme' : 'lightTheme')}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              {savingTheme && <ActivityIndicator size="small" />}
              {(['light', 'dark'] as const).map((mode) => {
                const isSelected = currentTheme === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => handleSelectTheme(mode)}
                    activeOpacity={0.7}
                    className={`flex-row items-center gap-1 rounded-lg px-3 py-1.5 ${isSelected ? 'bg-primary' : 'bg-secondary'}`}>
                    {mode === 'light' ? (
                      <SunIcon
                        color={isSelected ? 'white' : 'black'}
                        size={13}
                        className={isSelected ? 'text-primary-foreground' : 'text-foreground'}
                      />
                    ) : (
                      <MoonIcon
                        color="black"
                        size={13}
                        className={isSelected ? 'text-primary-foreground' : 'text-foreground'}
                      />
                    )}
                    <Text
                      className={`text-xs font-medium ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {t(mode === 'light' ? 'lightTheme' : 'darkTheme')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Divider />

          {/* Newsletter row */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-1 gap-0.5 pr-4">
              <Text className="text-sm font-medium">{t('newsletter')}</Text>
              <Text variant="muted" className="text-xs">
                {savingNewsletter ? t('saving') : t('newsletterDesc')}
              </Text>
            </View>
            <Switch
              value={newsletterEnabled}
              onValueChange={handleToggleNewsletter}
              disabled={savingNewsletter}
              trackColor={{ false: '#d4d4d4', true: '#bf6e1a' }}
              thumbColor="white"
            />
          </View>
        </View>
      </View>

      {/* Sign out */}
      <Button variant="destructive" onPress={handleSignOut} disabled={signingOut}>
        {signingOut ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <LogOutIcon size={16} color="white" />
            <Text>{t('signOut')}</Text>
          </>
        )}
      </Button>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text variant="muted" className="text-sm">
        {label}
      </Text>
      <Text className="max-w-[55%] text-right text-sm font-medium" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-border" />;
}
