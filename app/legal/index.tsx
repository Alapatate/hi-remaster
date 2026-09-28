import { LegalHeader } from '@/components/legal/LegalHeader';
import { Text } from '@/components/ui/text';
import { formatLegalDate } from '@/lib/legal/config';
import { LEGAL_DOC_IDS, LEGAL_DOC_TITLE_KEYS, type LegalDocId } from '@/lib/legal/documents';
import { router } from 'expo-router';
import { ChevronRightIcon, FileTextIcon, ScaleIcon, ShieldCheckIcon } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS: Record<LegalDocId, typeof FileTextIcon> = {
  terms: FileTextIcon,
  privacy: ShieldCheckIcon,
  'legal-notice': ScaleIcon,
};

/** Index of the legal documents, opened from the profile. */
export default function LegalIndex() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <LegalHeader title={t('legalInfo')} />
      <ScrollView
        contentContainerClassName="px-6 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View className="overflow-hidden rounded-2xl border border-border bg-card">
          {LEGAL_DOC_IDS.map((id, index) => {
            const Icon = ICONS[id];
            return (
              <View key={id}>
                {index > 0 ? <View className="h-px bg-border" /> : null}
                <TouchableOpacity
                  onPress={() => router.push(`/legal/${id}` as never)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3 px-4 py-4">
                  <Icon size={18} color="#bf6e1a" />
                  <Text className="flex-1 font-body-medium" style={{ fontSize: 15 }}>
                    {t(LEGAL_DOC_TITLE_KEYS[id])}
                  </Text>
                  <ChevronRightIcon size={18} className="text-muted-foreground" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        <Text className="mt-3 px-1 font-body text-muted-foreground" style={{ fontSize: 13 }}>
          {t('legalUpdated', { date: formatLegalDate(i18n.language) })}
        </Text>
      </ScrollView>
    </View>
  );
}
