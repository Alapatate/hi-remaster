import { Text } from '@/components/ui/text';
import { BackpackIcon, MoonStarIcon } from 'lucide-react-native';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SESSION_TOOLS } from '../lib/tools';

/**
 * The "gather your things" notice, shown on the way into the player before the
 * headphones reminder. The checklist is fixed (see `SESSION_TOOLS`); the
 * Shavasana line only appears when the built session actually contains one.
 */
export function SessionToolsDialog({
  visible,
  shavasana = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  /** Adds the lying-down warning for sessions containing a Shavasana. */
  shavasana?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
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
            <BackpackIcon size={26} color="#bf6e1a" />
          </View>

          <Text className="mb-1 text-center font-heading text-xl text-foreground">
            {t('toolsTitle')}
          </Text>
          <Text className="mb-5 text-center text-base leading-6 text-muted-foreground">
            {t('toolsMessage')}
          </Text>

          <View className="mb-5 w-full gap-2.5">
            {SESSION_TOOLS.map((tool) => (
              <View
                key={tool.key}
                className="flex-row items-center gap-3 rounded-2xl bg-secondary px-4 py-3">
                <Text style={{ fontSize: 18 }}>{tool.emoji}</Text>
                <Text className="flex-1 font-body-medium text-[15px] text-foreground">
                  {t(tool.labelKey)}
                </Text>
              </View>
            ))}
          </View>

          {shavasana ? (
            <View
              className="mb-5 w-full flex-row items-start gap-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: '#ebe5f1' }}>
              <MoonStarIcon size={18} color="#8a6cae" style={{ marginTop: 2 }} />
              <Text
                className="flex-1 font-body text-[13.5px] leading-5"
                style={{ color: '#4a3a5e' }}>
                {t('shavasanaNotice')}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={onConfirm}
            activeOpacity={0.85}
            className="w-full items-center justify-center rounded-2xl px-5 py-3"
            style={{ backgroundColor: '#bf6e1a' }}>
            <Text className="text-base font-bold text-white">{t('toolsConfirm')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
