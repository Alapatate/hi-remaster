import { Text } from '@/components/ui/text';
import { CheckIcon } from 'lucide-react-native';
import { Modal, Pressable, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export type QualityOption = {
  label: string;
  /** null = automatic / adaptive. */
  value: string | null;
};

/** Centered cream modal to pick a playback quality. */
export function QualitySheet({
  visible,
  options,
  active,
  onSelect,
  onClose,
}: {
  visible: boolean;
  options: QualityOption[];
  active: string | null;
  onSelect: (value: string | null) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={onClose}>
        <Pressable className="w-72 overflow-hidden rounded-3xl bg-popover px-6 py-5">
          <Text className="mb-3 text-center text-xl font-bold text-foreground">
            {t('quality')}
          </Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between py-3">
              <Text className="text-base text-foreground">{option.label}</Text>
              {active === option.value ? <CheckIcon size={18} color="#bf6e1a" /> : null}
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
