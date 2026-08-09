import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';

/**
 * App-styled confirmation card, used wherever an OS `Alert` would otherwise
 * appear. Cancel is optional — omit `cancelLabel` for a single-action notice.
 */
export function ConfirmDialog({
  visible,
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  icon?: React.ReactNode;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
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
          {icon ? (
            <View
              className="mb-4 h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(191,110,26,0.12)' }}>
              {icon}
            </View>
          ) : null}

          <Text className="mb-1 text-center font-heading text-xl text-foreground">{title}</Text>
          <Text className="mb-6 text-center text-base leading-6 text-muted-foreground">
            {message}
          </Text>

          <View className="w-full flex-row gap-3">
            {cancelLabel ? (
              <TouchableOpacity
                onPress={onCancel}
                activeOpacity={0.85}
                className="flex-1 items-center justify-center rounded-2xl bg-secondary px-5 py-3">
                <Text className="text-base font-bold text-secondary-foreground">{cancelLabel}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.85}
              className="flex-1 items-center justify-center rounded-2xl px-5 py-3"
              style={{ backgroundColor: '#bf6e1a' }}>
              <Text className="text-base font-bold text-white">{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
