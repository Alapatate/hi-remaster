import { Text } from '@/components/ui/text';
import { LogOutIcon } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * App-styled confirmation shown when the Android hardware back button would
 * otherwise quit the app. Replaces the default OS Alert with a themed card.
 */
export function QuitDialog({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        {/* Stop propagation so taps on the card don't dismiss it. */}
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
          <View
            className="mb-4 h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(191,110,26,0.12)' }}>
            <LogOutIcon size={26} color="#bf6e1a" />
          </View>

          <Text className="mb-1 text-xl font-bold text-foreground">{t('quitTitle')}</Text>
          <Text className="mb-6 text-center text-base text-muted-foreground">
            {t('quitMessage')}
          </Text>

          <View className="w-full flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.85}
              className="flex-1 items-center justify-center rounded-2xl bg-secondary px-5 py-3">
              <Text className="text-base font-bold text-secondary-foreground">
                {t('quitCancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.85}
              className="flex-1 items-center justify-center rounded-2xl px-5 py-3"
              style={{ backgroundColor: '#bf6e1a' }}>
              <Text className="text-base font-bold text-white">{t('quitConfirm')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
