import { Text } from '@/components/ui/text';
import { languageBase } from '@/lib/langFlags';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { teacherFlag, teacherFullName, teacherLanguage, teacherPhotoSource } from '../lib/data';
import type { Teacher } from '../lib/types';
import { renderBackdrop, SHEET_SHADOW } from './player/sheetHelpers';

const SHEET_BG = '#f4eddd';
const HANDLE = '#c9bfa6';
const ACTIVE = 'rgba(191,110,26,0.12)';

/** A language filter option derived from the teachers list. */
type LangOption = { base: string; label: string; flag: string };

export const TeacherPickerSheet = React.forwardRef<
  BottomSheetModal,
  {
    teachers: Teacher[];
    currentId?: string;
    onSelect: (teacher: Teacher) => void;
  }
>(function TeacherPickerSheet({ teachers, currentId, onSelect }, ref) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [langFilter, setLangFilter] = React.useState<string>('all');

  // Distinct languages present among the teachers (for the filter row).
  const languages = React.useMemo<LangOption[]>(() => {
    const seen = new Map<string, LangOption>();
    for (const tch of teachers) {
      const base = languageBase(tch.lang ?? '');
      if (!base || seen.has(base)) continue;
      seen.set(base, { base, label: teacherLanguage(tch), flag: teacherFlag(tch) });
    }
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [teachers]);

  const filtered = React.useMemo(
    () =>
      langFilter === 'all'
        ? teachers
        : teachers.filter((tch) => languageBase(tch.lang ?? '') === langFilter),
    [teachers, langFilter]
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      style={SHEET_SHADOW}
      backgroundStyle={{ backgroundColor: SHEET_BG }}
      handleIndicatorStyle={{ backgroundColor: HANDLE }}>
      <BottomSheetScrollView
        className="px-5 pt-3"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Language filter — only when there's more than one language to pick from. */}
        {languages.length > 1 ? (
          <View className="mb-4 flex-row flex-wrap gap-2">
            <FilterChip
              label={t('allLanguages')}
              active={langFilter === 'all'}
              onPress={() => setLangFilter('all')}
            />
            {languages.map((lang) => (
              <FilterChip
                key={lang.base}
                label={`${lang.flag ? `${lang.flag} ` : ''}${lang.label}`}
                active={langFilter === lang.base}
                onPress={() => setLangFilter(lang.base)}
              />
            ))}
          </View>
        ) : null}

        {filtered.map((teacher) => {
          const isCurrent = teacher.$id === currentId;
          const flag = teacherFlag(teacher);
          const language = teacherLanguage(teacher);
          return (
            <TouchableOpacity
              key={teacher.$id}
              activeOpacity={0.7}
              onPress={() => onSelect(teacher)}
              className="mb-2 flex-row items-center gap-4 rounded-2xl px-3 py-3"
              style={isCurrent ? { backgroundColor: ACTIVE } : undefined}>
              {/* Avatar */}
              <View className="overflow-hidden rounded-full" style={{ width: 56, height: 56 }}>
                <Image
                  source={teacherPhotoSource(teacher)}
                  style={{ width: 56, height: 56 }}
                  resizeMode="cover"
                />
              </View>

              {/* Name + language */}
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                  {teacherFullName(teacher)}
                </Text>
                {language ? (
                  <Text className="text-sm text-muted-foreground">{language}</Text>
                ) : null}
              </View>

              {/* Flag + active dot */}
              <View className="items-end gap-1">
                {flag ? <Text style={{ fontSize: 22 }}>{flag}</Text> : null}
                {isCurrent ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="rounded-full px-3.5 py-2"
      style={{
        backgroundColor: active ? '#bf6e1a' : 'rgba(74,56,38,0.06)',
        borderWidth: 1,
        borderColor: active ? '#bf6e1a' : 'rgba(74,56,38,0.12)',
      }}>
      <Text
        className="text-sm font-semibold"
        style={{ color: active ? '#fff' : '#7a6a52' }}
        numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
