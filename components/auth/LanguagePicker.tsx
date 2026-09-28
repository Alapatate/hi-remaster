import { Text } from '@/components/ui/text';
import { chooseSignedOutLanguage } from '@/lib/i18n';
import { LANGUAGES } from '@/lib/languages';
import { CheckIcon, ChevronDownIcon, GlobeIcon } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * Language switch for the signed-out screens. There is no account yet to store
 * the choice on, so it lives in memory and seeds the account at sign-up.
 */
export function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const pick = (code: string) => {
    chooseSignedOutLanguage(code);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        hitSlop={6}
        accessibilityLabel={t('preferredLanguage')}
        className="h-10 flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5">
        <GlobeIcon size={15} className="text-muted-foreground" />
        <Text className="font-body-medium text-[13.5px] text-foreground">{current.label}</Text>
        <ChevronDownIcon size={14} className="text-muted-foreground" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 items-center justify-center px-8"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Pressable
            onPress={() => {}}
            className="w-full max-w-sm rounded-3xl bg-card py-5"
            style={{
              maxHeight: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
            }}>
            <Text className="mb-3 px-6 font-heading text-xl text-foreground">
              {t('chooseLanguageTitle')}
            </Text>
            <ScrollView contentContainerClassName="gap-2 px-4">
              {LANGUAGES.map((lang) => {
                const active = lang.code === current.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => pick(lang.code)}
                    activeOpacity={0.75}
                    className={`flex-row items-center justify-between rounded-2xl px-4 py-3 ${
                      active ? 'bg-primary' : 'bg-secondary'
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
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
