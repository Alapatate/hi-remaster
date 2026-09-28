import i18n from '@/lib/i18n';

/**
 * Appwrite error types mapped to translated messages. Appwrite writes its own
 * messages in English only, so they are never shown as they are.
 */
const APPWRITE_ERRORS: Record<string, string> = {
  user_invalid_credentials: 'errInvalidCredentials',
  user_already_exists: 'errUserExists',
  user_email_already_exists: 'errUserExists',
  user_blocked: 'errUserBlocked',
  general_rate_limit_exceeded: 'errRateLimit',
  password_personal_data: 'errPasswordPersonal',
  user_password_personal_data: 'errPasswordPersonal',
};

/** A user-facing message for a failed request, in the app's current language. */
export function errorMessage(error: unknown, fallbackKey = 'errGeneric'): string {
  const e = error as { type?: string; message?: string } | null;
  const key = e?.type ? APPWRITE_ERRORS[e.type] : undefined;
  if (key) return i18n.t(key);
  if (e?.message === 'Network request failed') return i18n.t('errNetwork');
  if (e?.type === 'general_argument_invalid' && /email/i.test(e.message ?? '')) {
    return i18n.t('errInvalidEmail');
  }
  return i18n.t(fallbackKey);
}
