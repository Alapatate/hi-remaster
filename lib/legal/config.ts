/**
 * Who runs the app, as the legal documents name it, plus the consent record
 * kept on the account.
 *
 * Every value in brackets is a placeholder. They MUST be replaced with the
 * publisher's real details before the app is published: the legal notice and
 * the privacy policy are not valid while they name nobody.
 */

/**
 * Version of the Terms of Use and Privacy Policy. Bump it when either changes
 * materially: every account whose recorded version differs is sent back
 * through the consent screen before it can use the app again.
 */
export const LEGAL_VERSION = '2026-09-15';
export const LEGAL_UPDATED = new Date(2026, 8, 15);

/** Minimum age, attested at sign-up. */
export const MIN_AGE = 12;
/** Age of digital consent in France (art. 45 loi Informatique et Libertés). */
export const DIGITAL_CONSENT_AGE = 15;
/** Days between a deletion request and the erasure of the account's data. */
export const DELETION_DELAY_DAYS = 30;

export const LEGAL = {
  appName: 'Harmony Immersion',
  publisher: {
    name: '[À COMPLÉTER : nom ou raison sociale]',
    legalForm: '[À COMPLÉTER : forme juridique et capital social]',
    address: '[À COMPLÉTER : adresse du siège]',
    registration: '[À COMPLÉTER : RCS et SIRET]',
    vat: '[À COMPLÉTER : n° de TVA intracommunautaire]',
    director: '[À COMPLÉTER : directeur ou directrice de la publication]',
    email: '[À COMPLÉTER : e-mail de contact]',
    phone: '[À COMPLÉTER : téléphone]',
  },
  /** Address for data-protection requests (access, erasure…). */
  privacyEmail: '[À COMPLÉTER : e-mail dédié aux données personnelles]',
  /** Hosting of the Appwrite server at hi-admin.phi-apps.fr. */
  host: {
    name: '[À COMPLÉTER : hébergeur du serveur]',
    address: '[À COMPLÉTER : adresse de l’hébergeur]',
    phone: '[À COMPLÉTER : téléphone de l’hébergeur]',
    location: '[À COMPLÉTER : pays du centre de données]',
  },
  /** Consumer mediator — mandatory for a B2C service in France. */
  mediator: {
    name: '[À COMPLÉTER : médiateur de la consommation]',
    website: '[À COMPLÉTER : site du médiateur]',
  },
} as const;

type Prefs = Record<string, unknown> | undefined;

/** Whether the account attested its age and accepted the current documents. */
export function hasCurrentConsent(prefs: Prefs): boolean {
  return prefs?.ageConfirmed === true && prefs?.termsVersion === LEGAL_VERSION;
}

/** The consent record written to the account prefs — dated, so it can be proven. */
export function consentPrefs() {
  const now = new Date().toISOString();
  return {
    ageConfirmed: true,
    ageConfirmedAt: now,
    termsVersion: LEGAL_VERSION,
    termsAcceptedAt: now,
  };
}

/** The documents' date in the reader's locale (cat tags stripped, which Intl rejects). */
export function formatLegalDate(lang?: string): string {
  try {
    return LEGAL_UPDATED.toLocaleDateString((lang ?? 'en').replace(/^cat_/, ''));
  } catch {
    return LEGAL_VERSION;
  }
}
