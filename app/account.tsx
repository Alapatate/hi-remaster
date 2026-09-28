import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import { ArrowLeftIcon, DownloadIcon, LogOutIcon, Trash2Icon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, ScrollView, Share, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Account actions, pushed over the tab navigator from the profile screen.
 * Lives at the root stack rather than under `(protected)` so it opens as a
 * pushed screen instead of becoming a fourth tab.
 */
export default function AccountScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [signingOut, setSigningOut] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState('');

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } finally {
      setSigningOut(false);
    }
  };

  // Right of access and portability: everything the account holds, as JSON,
  // handed to the system share sheet so it can be saved or sent anywhere.
  const handleExport = () => {
    if (!user) return;
    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.$id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerification,
        createdAt: user.$createdAt,
        updatedAt: user.$updatedAt,
      },
      preferences: user.prefs,
    };
    Share.share({ title: t('exportData'), message: JSON.stringify(data, null, 2) }).catch(() => {});
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      router.replace('/(auth)/sign-in');
    } catch {
      setDeleteError(t('deleteAccountError'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-full bg-card">
          <ArrowLeftIcon size={20} className="text-foreground" />
        </TouchableOpacity>
        <Text className="font-heading text-xl">{t('account')}</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View className="mb-7 overflow-hidden rounded-2xl border border-border bg-card">
          <View className="px-4 py-4">
            <Text className="font-body text-[13px] text-muted-foreground">{t('email')}</Text>
            <Text className="mt-0.5 font-body-medium text-[15px]" numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
          </View>
          <View className="h-px bg-border" />
          <View className="px-4 py-4">
            <Text className="font-body text-[13px] text-muted-foreground">
              {t('memberSinceLabel')}
            </Text>
            <Text className="mt-0.5 font-body-medium text-[15px]">
              {user?.$createdAt ? new Date(user.$createdAt).toLocaleDateString() : '—'}
            </Text>
          </View>
          <View className="h-px bg-border" />
          <TouchableOpacity
            onPress={handleExport}
            activeOpacity={0.7}
            className="flex-row items-center gap-3 px-4 py-4">
            <DownloadIcon size={18} color="#bf6e1a" />
            <View className="flex-1">
              <Text className="font-body-medium text-[15px]">{t('exportData')}</Text>
              <Text className="mt-0.5 font-body text-[13px] text-muted-foreground">
                {t('exportDataDesc')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.7}
          className="mb-3 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4">
          {signingOut ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <LogOutIcon size={16} className="text-foreground" />
              <Text className="font-body-semibold text-[15px]">{t('signOut')}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setConfirmDelete(true)}
          disabled={deleting}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-4">
          {deleting ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <Trash2Icon size={16} className="text-destructive" />
              <Text className="font-body-semibold text-[15px] text-destructive">
                {t('deleteAccount')}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <Text className="mt-2 px-1 font-body text-[13px] text-muted-foreground">
          {deleteError || t('deleteAccountDesc')}
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={confirmDelete}
        icon={<Trash2Icon size={26} color="#c0392b" />}
        title={t('deleteAccountConfirmTitle')}
        message={t('deleteAccountConfirmMessage')}
        confirmLabel={t('deleteAccountConfirm')}
        cancelLabel={t('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </View>
  );
}
