import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Bird } from '../lib/types';
import { BirdArt } from './BirdArt';

/**
 * Celebratory popup shown when the user crosses a bird's XP threshold while the
 * journey screen reveals their progress. One bird at a time; tapping dismisses
 * it so the next crossed bird (if any) can appear.
 */
export function BirdUnlockedPopup({
  bird,
  accent,
  onDismiss,
}: {
  bird: Bird | null;
  accent: string;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal visible={!!bird} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        onPress={onDismiss}
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
        {/* Swallow taps on the card so it doesn't dismiss behind. */}
        <Pressable
          onPress={() => {}}
          className="w-full max-w-sm items-center rounded-3xl bg-card p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}>
          <Text className="mb-3 font-heading text-sm tracking-wide" style={{ color: accent }}>
            {t('birdDiscovered')}
          </Text>

          <View
            className="mb-4 h-28 w-28 items-center justify-center rounded-full bg-background"
            style={{ borderWidth: 3, borderColor: accent }}>
            {bird ? <BirdArt id={bird.id} size={84} /> : null}
          </View>

          <Text className="text-center font-heading text-3xl text-foreground">
            {bird ? t(bird.nameKey) : ''}
          </Text>
          <Text className="mb-6 mt-1 text-center text-base italic text-muted-foreground">
            {bird?.scientificName ?? ''}
          </Text>

          <TouchableOpacity
            onPress={onDismiss}
            activeOpacity={0.85}
            className="w-full items-center justify-center rounded-2xl px-5 py-3"
            style={{ backgroundColor: accent }}>
            <Text className="font-heading text-base text-white">{t('birdDiscoveredCta')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
