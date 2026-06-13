import { Text } from '@/components/ui/text';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { teacherFlag, teacherFullName, teacherPhotoSource } from '../lib/data';
import type { Teacher } from '../lib/types';
import { renderBackdrop, SHEET_SHADOW } from './player/sheetHelpers';

const SHEET_BG = '#f4eddd';
const HANDLE = '#c9bfa6';

export const TeacherPickerSheet = React.forwardRef<
  BottomSheetModal,
  {
    teachers: Teacher[];
    currentId?: string;
    onSelect: (teacher: Teacher) => void;
  }
>(function TeacherPickerSheet({ teachers, currentId, onSelect }, ref) {
  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      style={SHEET_SHADOW}
      backgroundStyle={{ backgroundColor: SHEET_BG }}
      handleIndicatorStyle={{ backgroundColor: HANDLE }}>
      <BottomSheetScrollView className="px-5 pb-10 pt-3">
        {teachers.map((teacher) => {
          const isCurrent = teacher.$id === currentId;
          const flag = teacherFlag(teacher);
          return (
            <TouchableOpacity
              key={teacher.$id}
              activeOpacity={0.7}
              onPress={() => onSelect(teacher)}
              className="mb-2 flex-row items-center gap-4 rounded-2xl px-3 py-3"
              style={isCurrent ? { backgroundColor: 'rgba(191,110,26,0.12)' } : undefined}>
              {/* Avatar */}
              <View
                className="overflow-hidden rounded-full"
                style={{ width: 56, height: 56 }}>
                <Image
                  source={teacherPhotoSource(teacher)}
                  style={{ width: 56, height: 56 }}
                  resizeMode="cover"
                />
              </View>

              {/* Name + lang */}
              <View className="flex-1">
                <Text
                  className="text-lg font-bold text-foreground"
                  numberOfLines={1}>
                  {teacherFullName(teacher)}
                </Text>
                {teacher.lang ? (
                  <Text className="text-sm text-muted-foreground">{teacher.lang}</Text>
                ) : null}
              </View>

              {/* Flag + active dot */}
              <View className="items-end gap-1">
                {flag ? <Text style={{ fontSize: 22 }}>{flag}</Text> : null}
                {isCurrent ? (
                  <View className="h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
