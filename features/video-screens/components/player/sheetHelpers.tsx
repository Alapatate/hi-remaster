import { BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import * as React from 'react';

/** Semi-transparent backdrop that closes the sheet when tapped. */
export function renderBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.35}
    />
  );
}

/** Shared shadow style to lift the sheet above the background. */
export const SHEET_SHADOW = {
  shadowColor: '#1a0f00',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.10,
  shadowRadius: 16,
  elevation: 10,
} as const;
