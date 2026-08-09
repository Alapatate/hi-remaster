import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LogOutIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

/**
 * App-styled confirmation shown when the Android hardware back button would
 * otherwise quit the app. Replaces the default OS Alert with a themed card.
 */
export function QuitDialog({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      visible={visible}
      icon={<LogOutIcon size={26} color="#bf6e1a" />}
      title={t('quitTitle')}
      message={t('quitMessage')}
      confirmLabel={t('quitConfirm')}
      cancelLabel={t('quitCancel')}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
