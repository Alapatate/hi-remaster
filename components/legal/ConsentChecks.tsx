import { Text } from '@/components/ui/text';
import type { LegalDocId } from '@/lib/legal/documents';
import { router } from 'expo-router';
import { CheckIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';

const ORANGE = '#bf6e1a';

/**
 * The two boxes an account must tick: the age attestation and the acceptance
 * of the Terms of Use and Privacy Policy, whose names open the documents.
 * Shared by sign-up and by the consent screen existing accounts go through.
 */
export function ConsentChecks({
  age,
  terms,
  onToggleAge,
  onToggleTerms,
}: {
  age: boolean;
  terms: boolean;
  onToggleAge: () => void;
  onToggleTerms: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      <CheckRow checked={age} onToggle={onToggleAge}>
        <Text className="font-body text-foreground" style={{ fontSize: 14, lineHeight: 20 }}>
          {t('ageAttestation')}
        </Text>
      </CheckRow>
      <CheckRow checked={terms} onToggle={onToggleTerms}>
        <Text className="font-body text-foreground" style={{ fontSize: 14, lineHeight: 20 }}>
          {/* Numbered tags, not named ones: cat mode rewrites every word of the
              English string, tag names included, but leaves digits alone. */}
          <Trans
            i18nKey="acceptTerms"
            components={[
              <LegalLink key="terms" doc="terms" />,
              <LegalLink key="privacy" doc="privacy" />,
            ]}
          />
        </Text>
      </CheckRow>
    </View>
  );
}

function CheckRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={4}
      className="flex-row items-start gap-3">
      <View
        className="items-center justify-center"
        style={{
          width: 22,
          height: 22,
          marginTop: 1,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: ORANGE,
          backgroundColor: checked ? ORANGE : 'transparent',
        }}>
        {checked ? <CheckIcon size={14} color="white" strokeWidth={3} /> : null}
      </View>
      <View className="flex-1">{children}</View>
    </Pressable>
  );
}

/** A document name inside a sentence; `Trans` hands it the translated words. */
function LegalLink({ doc, children }: { doc: LegalDocId; children?: React.ReactNode }) {
  return (
    <Text
      onPress={() => router.push(`/legal/${doc}` as never)}
      className="font-body-semibold underline"
      style={{ color: ORANGE, fontSize: 14, lineHeight: 20 }}>
      {children}
    </Text>
  );
}
