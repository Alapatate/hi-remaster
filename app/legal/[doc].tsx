import { LegalHeader } from '@/components/legal/LegalHeader';
import { Text } from '@/components/ui/text';
import { formatLegalDate } from '@/lib/legal/config';
import {
  isLegalDocId,
  LEGAL_DOC_TITLE_KEYS,
  legalDocument,
  legalLanguageFor,
} from '@/lib/legal/documents';
import { Redirect, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * One legal document. Reachable signed in or not — the sign-up checkboxes link
 * here — so it lives at the root of the stack, outside both guarded groups.
 */
export default function LegalDocumentScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  if (!isLegalDocId(doc)) return <Redirect href={'/legal' as never} />;

  const { lang, fallback } = legalLanguageFor(i18n.language);
  const sections = legalDocument(doc, lang);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <LegalHeader title={t(LEGAL_DOC_TITLE_KEYS[doc])} />
      <ScrollView
        contentContainerClassName="px-6 pt-2"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Text className="font-body text-muted-foreground" style={{ fontSize: 13 }}>
          {t('legalUpdated', { date: formatLegalDate(i18n.language) })}
        </Text>

        {fallback ? (
          <View className="mt-3 rounded-2xl bg-secondary px-4 py-3">
            <Text className="font-body text-foreground" style={{ fontSize: 13.5, lineHeight: 20 }}>
              {t('legalFallbackNotice')}
            </Text>
          </View>
        ) : null}

        {sections.map((section) => (
          <View key={section.heading} className="mt-6">
            <Text className="mb-2 font-heading text-foreground" style={{ fontSize: 18 }}>
              {section.heading}
            </Text>
            {section.paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                selectable
                className="mb-2 font-body text-foreground"
                style={{ fontSize: 14.5, lineHeight: 22 }}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
