import { useBottomDockSpace } from '@/components/navigation/FloatingTabBar';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react-native';
import { useJourney } from '@/features/journey-screen/hooks/useJourney';
import { RemindersSection } from '@/features/reminders';
import * as React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { user, updatePrefs } = useAuth();
  const { t } = useTranslation();
  const { setColorScheme } = useColorScheme();
  const dockSpace = useBottomDockSpace();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { xp, waypoints, frontierIndex, unlockedCount, xpToNext } = useJourney(width);
  const frontierBird = waypoints[frontierIndex]?.bird;
  const birdEmoji = frontierBird?.emoji ?? '🐦';
  const [langOpen, setLangOpen] = React.useState(false);
  const [savingLang, setSavingLang] = React.useState(false);
  const [savingTheme, setSavingTheme] = React.useState(false);
  const [savingNewsletter, setSavingNewsletter] = React.useState(false);

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

  const memberSince = user?.$createdAt ? new Date(user.$createdAt).getFullYear() : null;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6"
      // flexGrow + centre so the page sits balanced between the status bar and
      // the dock when it is shorter than the viewport, and still scrolls when not.
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: dockSpace,
        flexGrow: 1,
        justifyContent: 'center',
      }}>
      {/* Identity — portrait, name, membership line and level pill, over an
          accent disc bleeding off the top-right corner. */}
      {/* No overflow clip here — the disc is meant to bleed past the corner and
          be cut by the screen edge, not squared off by its own container. */}
      <View className="-mx-6 mb-6 px-6 pb-2 pt-5">
        <View className="flex-row items-center gap-4">
          <View className="h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
            <Text style={{ fontSize: 42, lineHeight: 50, textAlign: 'center' }}>{birdEmoji}</Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="font-heading text-[26px] leading-tight" numberOfLines={1}>
              {user?.name}
            </Text>
            <Text className="font-body text-sm text-muted-foreground" numberOfLines={1}>
              {memberSince ? t('memberSinceLabel') + ' ' + memberSince : user?.email}
            </Text>
            {frontierBird ? (
              <View className="mt-1 self-start rounded-full bg-primary/15 px-3 py-1">
                <Text className="font-body-semibold text-xs text-primary">
                  {t('levelLabel', { level: frontierIndex + 1 })} — {frontierBird.name}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Stat tiles */}
      <View className="mb-4 flex-row gap-3">
        <Stat value={xp.toLocaleString()} label={t('minutesLabel')} />
        <Stat value={`${unlockedCount}/${waypoints.length}`} label={t('birdsLabel')} />
        <Stat value={xpToNext > 0 ? String(xpToNext) : '—'} label={t('xpToNextLabel')} accent />
      </View>

      {/* Reminders */}
      <RemindersSection />

      {/* Settings */}
      <View>
        <SectionTitle>{t('preferences')}</SectionTitle>
        <Card>
          <TouchableOpacity
            onPress={() => setLangOpen((v) => !v)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-4 py-4">
            <Text className="flex-1 font-body-medium text-[15px]">{t('preferredLanguage')}</Text>
            <View className="flex-row items-center gap-2">
              {savingLang && <ActivityIndicator size="small" />}
              <Text className="font-body text-[13px] text-muted-foreground">
                {savingLang ? t('saving') : currentLangLabel}
              </Text>
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
                    className="flex-row items-center justify-between px-4 py-3.5">
                    <Text className="font-body text-[15px]">{lang.label}</Text>
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
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-1 gap-0.5 pr-3">
              <Text className="font-body-medium text-[15px]">{t('appearance')}</Text>
              <Text className="font-body text-[13px] text-muted-foreground">
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
                    className={`flex-row items-center gap-1 rounded-full px-3 py-1.5 ${isSelected ? 'bg-primary' : 'bg-secondary'}`}>
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
                      className={`font-body-medium text-xs ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {t(mode === 'light' ? 'lightTheme' : 'darkTheme')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Divider />

          {/* Newsletter row */}
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-1 gap-0.5 pr-4">
              <Text className="font-body-medium text-[15px]">{t('newsletter')}</Text>
              <Text className="font-body text-[13px] text-muted-foreground">
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

          <Divider />

          {/* Account row — opens the pushed screen holding sign-out and deletion */}
          <TouchableOpacity
            onPress={() => router.push('/account')}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-4 py-4">
            <Text className="flex-1 font-body-medium text-[15px]">{t('account')}</Text>
            <ChevronRightIcon size={18} className="text-muted-foreground" />
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}

/** One of the three figures under the identity block. */
function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View
      className={`flex-1 rounded-2xl border px-3 py-4 ${
        accent ? 'border-primary/30 bg-primary/10' : 'border-border bg-card'
      }`}>
      <Text
        className={`font-heading text-2xl leading-none ${accent ? 'text-primary' : 'text-foreground'}`}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {value}
      </Text>
      <Text
        className={`mt-1.5 font-body-semibold text-[11px] uppercase tracking-wider ${
          accent ? 'text-primary' : 'text-muted-foreground'
        }`}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Section label above each grouped card. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text className="mb-3 font-heading text-lg">{children}</Text>;
}

/** Grouped list container shared by every section on this screen. */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-card">{children}</View>
  );
}

function Divider() {
  return <View className="h-px bg-border" />;
}
