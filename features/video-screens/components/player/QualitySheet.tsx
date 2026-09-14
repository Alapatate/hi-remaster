import { Text } from '@/components/ui/text';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { CheckIcon } from 'lucide-react-native';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSheetChrome } from '@/lib/sheetChrome';
import { renderBackdrop, SHEET_SHADOW } from './sheetHelpers';

export type QualityOption = {
  label: string;
  /** null = automatic / adaptive. */
  value: string | null;
};

const SHEET_BG = '#f4eddd';

export const QualitySheet = React.forwardRef<
  BottomSheetModal,
  {
    options: QualityOption[];
    active: string | null;
    onSelect: (value: string | null) => void;
  }
>(function QualitySheet({ options, active, onSelect }, ref) {
  const { t } = useTranslation();
  const chrome = useSheetChrome(SHEET_BG);

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      style={SHEET_SHADOW}
      {...chrome}>
      <BottomSheetView className="px-6 pb-10 pt-3">
        <Text className="mb-3 font-heading text-xl text-foreground">{t('quality')}</Text>
        {options.map((option) => (
          <TouchableOpacity
            key={option.label}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between py-3.5">
            <Text className="text-base text-foreground">{option.label}</Text>
            {active === option.value ? <CheckIcon size={18} color="#bf6e1a" /> : null}
          </TouchableOpacity>
        ))}
      </BottomSheetView>
    </BottomSheetModal>
  );
});
