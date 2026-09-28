import { LegalHeader } from '@/components/legal/LegalHeader';
import { Text } from '@/components/ui/text';
import { LEGAL } from '@/lib/legal/config';
import { ChevronRightIcon, InstagramIcon, MailIcon } from 'lucide-react-native';
import * as React from 'react';
import { Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INSTAGRAM_HANDLE = 'irbycenter';

/** The address is still a placeholder until the publisher's details are filled in. */
const CONTACT_EMAIL = LEGAL.publisher.email.startsWith('[') ? null : LEGAL.publisher.email;

/** Ways to reach the team, opened from the profile. */
export default function ContactScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <LegalHeader title={t('contactUs')} />
      <ScrollView
        contentContainerClassName="px-6 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <Text className="mb-5 px-1 font-body text-[15px] leading-6 text-muted-foreground">
          {t('contactIntro')}
        </Text>

        <View className="overflow-hidden rounded-2xl border border-border bg-card">
          {CONTACT_EMAIL ? (
            <>
              <ContactRow
                icon={<MailIcon size={18} color="#bf6e1a" />}
                title={t('contactEmail')}
                detail={CONTACT_EMAIL}
                onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})}
              />
              <View className="h-px bg-border" />
            </>
          ) : null}
          <ContactRow
            icon={<InstagramIcon size={18} color="#bf6e1a" />}
            title={t('contactInstagram')}
            detail={`@${INSTAGRAM_HANDLE}`}
            onPress={() =>
              Linking.openURL(`https://instagram.com/${INSTAGRAM_HANDLE}`).catch(() => {})
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

function ContactRow({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-4 py-4">
      {icon}
      <View className="flex-1">
        <Text className="font-body-medium text-[15px]">{title}</Text>
        <Text className="mt-0.5 font-body text-[13px] text-muted-foreground" numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <ChevronRightIcon size={18} className="text-muted-foreground" />
    </TouchableOpacity>
  );
}
