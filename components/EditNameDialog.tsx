import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const MAX_NAME = 128; // Appwrite's limit on the account name.

/**
 * Rename dialog for the profile screen. Holds its own draft so cancelling
 * leaves the account untouched, and reports back only once the save succeeds.
 */
export function EditNameDialog({
  visible,
  initialName,
  onSave,
  onClose,
}: {
  visible: boolean;
  initialName: string;
  /** Rejects to show the server message inline; resolves to close the dialog. */
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const [value, setValue] = React.useState(initialName);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // Re-seed the draft each time the dialog opens, not on every keystroke.
  React.useEffect(() => {
    if (visible) {
      setValue(initialName);
      setError('');
    }
  }, [visible, initialName]);

  const handleSave = async () => {
    const name = value.trim();
    if (!name) {
      setError(t('nameRequired'));
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(name);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? t('nameRequired'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        {/* Stop propagation so taps inside the card don't dismiss it. */}
        <Pressable
          onPress={() => {}}
          className="w-full max-w-sm rounded-3xl bg-card p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}>
          <Text className="mb-1 font-heading text-xl text-foreground">{t('editNameTitle')}</Text>
          <Text className="mb-4 font-body text-[13.5px] leading-5 text-muted-foreground">
            {t('editNameHint')}
          </Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            autoFocus
            maxLength={MAX_NAME}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="done"
            onSubmitEditing={handleSave}
            placeholderTextColor={colorScheme === 'dark' ? '#8a7a6a' : '#a89880'}
            style={{
              height: 52,
              borderRadius: 16,
              paddingHorizontal: 16,
              fontSize: 15.5,
              fontFamily: 'Figtree_400Regular',
              borderWidth: 1,
            }}
            className="border-border bg-background text-foreground"
          />

          {error ? (
            <Text className="mt-2 px-1 font-body text-sm text-destructive">{error}</Text>
          ) : null}

          <View className="mt-5 flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={saving}
              activeOpacity={0.85}
              className="flex-1 items-center justify-center rounded-2xl bg-secondary px-5 py-3">
              <Text className="text-base font-bold text-secondary-foreground">{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
              className="flex-1 items-center justify-center rounded-2xl px-5 py-3"
              style={{ backgroundColor: '#bf6e1a', opacity: saving ? 0.7 : 1 }}>
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-base font-bold text-white">{t('save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
