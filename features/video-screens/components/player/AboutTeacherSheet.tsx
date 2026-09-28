import { Text } from '@/components/ui/text';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ClockIcon, InstagramIcon, UserIcon } from 'lucide-react-native';
import * as React from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { instagramUrl, teacherFlag, teacherFullName, teacherInstagram } from '../../lib/data';
import { formatDuration } from '../../lib/format';
import type { Teacher } from '../../lib/types';
import { Pill } from '../Pill';
import { useSheetChrome } from '@/lib/sheetChrome';
import { renderBackdrop, SHEET_SHADOW } from './sheetHelpers';

const SHEET_BG = '#e9e0ce';

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
    /** What the exercise is about (player context). */
    description?: string;
  }
>(function AboutTeacherSheet({ title, teacher, duration, description }, ref) {
  const { t } = useTranslation();
  const chrome = useSheetChrome(SHEET_BG);
  const flag = teacherFlag(teacher);
  const instagram = teacherInstagram(teacher);

  return (
    <BottomSheetModal
      ref={ref}
      topInset={100}
      snapPoints={['50%', '80%']}
      backdropComponent={renderBackdrop}
      style={SHEET_SHADOW}
      {...chrome}>
      <BottomSheetScrollView className="px-5 pb-12 pt-2">
        <Text className="mb-4 font-heading text-3xl text-foreground">{title}</Text>

        <View className="mb-5 flex-row flex-wrap items-center gap-2">
          {teacher ? (
            <Pill
              icon={<UserIcon size={15} className="text-muted-foreground" />}
              label={teacherFullName(teacher)}
            />
          ) : null}
          {duration != null && duration > 0 ? (
            <Pill
              icon={<ClockIcon size={15} className="text-muted-foreground" />}
              label={formatDuration(duration)}
            />
          ) : null}
          {flag ? <Pill label={flag} textClassName="text-lg" /> : null}
        </View>

        {instagram ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(instagramUrl(instagram)).catch(() => {})}
            activeOpacity={0.7}
            className="mb-5 flex-row items-center gap-2 self-start rounded-full bg-card px-4 py-2.5">
            <InstagramIcon size={17} color="#bf6e1a" />
            <Text className="font-body-medium text-[15px] text-foreground">@{instagram}</Text>
          </TouchableOpacity>
        ) : null}

        {description ? (
          <View className="mb-4 rounded-2xl bg-card p-5">
            <Text className="mb-3 font-heading text-lg text-foreground">{t('aboutExercise')}</Text>
            <Text className="text-base leading-7 text-muted-foreground">{description}</Text>
          </View>
        ) : null}

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
