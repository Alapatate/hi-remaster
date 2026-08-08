import { Text } from '@/components/ui/text';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ClockIcon, UserIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { teacherFlag, teacherFullName } from '../../lib/data';
import { formatDuration } from '../../lib/format';
import type { Teacher } from '../../lib/types';
import { Pill } from '../Pill';
import { renderBackdrop, SHEET_SHADOW } from './sheetHelpers';

const SHEET_BG = '#e9e0ce';
const HANDLE = '#c9bfa6';

/**
 * Cream bottom sheet with a title, meta chips and the teacher bio.
 * Reused on the home screen (teacher bio) and in the player (exercise + bio).
 */
export const AboutTeacherSheet = React.forwardRef<
  BottomSheetModal,
  {
    title: string;
    teacher?: Teacher;
    /** Optional duration chip (player context). */
    duration?: number;
  }
>(function AboutTeacherSheet({ title, teacher, duration }, ref) {
  const { t } = useTranslation();
  const flag = teacherFlag(teacher);

  return (
    <BottomSheetModal
      ref={ref}
      topInset={100}
      snapPoints={['50%', '80%']}
      backdropComponent={renderBackdrop}
      style={SHEET_SHADOW}
      backgroundStyle={{ backgroundColor: SHEET_BG }}
      handleIndicatorStyle={{ backgroundColor: HANDLE }}>
      <BottomSheetScrollView className="px-5 pb-12 pt-2">
        <Text className="mb-4 font-heading text-3xl text-foreground">{title}</Text>

        <View className="mb-5 flex-row flex-wrap items-center gap-2">
          {teacher ? (
            <Pill icon={<UserIcon size={15} color="#7a6a52" />} label={teacherFullName(teacher)} />
          ) : null}
          {duration != null && duration > 0 ? (
            <Pill icon={<ClockIcon size={15} color="#7a6a52" />} label={formatDuration(duration)} />
          ) : null}
          {flag ? <Pill label={flag} textClassName="text-lg" /> : null}
        </View>

        {teacher?.presentation ? (
          <View className="rounded-2xl bg-card p-5">
            <Text className="mb-3 font-heading text-lg text-foreground">{t('aboutTeacher')}</Text>
            <Text className="text-base leading-7 text-muted-foreground">
              {teacher.presentation}
            </Text>
          </View>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
