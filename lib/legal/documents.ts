import { DELETION_DELAY_DAYS, DIGITAL_CONSENT_AGE, LEGAL, MIN_AGE } from './config';

/**
 * The legal documents, in French and English. Legal texts are not run through
 * i18n: they are written once per language by hand, and every other app
 * language reads the English version with a notice saying so.
 */

export type LegalDocId = 'terms' | 'privacy' | 'legal-notice';
export type LegalLanguage = 'fr' | 'en';
export type LegalSection = { heading: string; paragraphs: string[] };

export const LEGAL_DOC_IDS: LegalDocId[] = ['terms', 'privacy', 'legal-notice'];

/** i18n key of each document's title. */
export const LEGAL_DOC_TITLE_KEYS: Record<LegalDocId, string> = {
  terms: 'termsOfUse',
  privacy: 'privacyPolicy',
  'legal-notice': 'legalNotice',
};

export function isLegalDocId(value: unknown): value is LegalDocId {
  return typeof value === 'string' && (LEGAL_DOC_IDS as string[]).includes(value);
}

/** Which version to show for an app language, and whether it is a fallback. */
export function legalLanguageFor(lang?: string): { lang: LegalLanguage; fallback: boolean } {
  const base = (lang ?? 'en').replace(/^cat_/, '').split(/[-_]/)[0].toLowerCase();
  if (base === 'fr') return { lang: 'fr', fallback: false };
  return { lang: 'en', fallback: base !== 'en' };
}

export function legalDocument(id: LegalDocId, lang: LegalLanguage): LegalSection[] {
  return DOCUMENTS[id][lang];
}

const APP = LEGAL.appName;
const P = LEGAL.publisher;
const H = LEGAL.host;
const M = LEGAL.mediator;

// ─────────────────────────────────────────────────────────────
// Terms of Use
// ─────────────────────────────────────────────────────────────

const TERMS_FR: LegalSection[] = [
  {
    heading: '1. Objet',
    paragraphs: [
      `Les présentes conditions générales d’utilisation (CGU) encadrent l’accès et l’utilisation de l’application ${APP}, éditée par ${P.name} (voir les Mentions légales). L’application propose des séances guidées en vidéo (préparation, pratique, relaxation), un parcours de progression et des rappels.`,
      'La création d’un compte vaut acceptation des CGU. Si tu ne les acceptes pas, n’utilise pas l’application.',
    ],
  },
  {
    heading: '2. Accès et âge minimum',
    paragraphs: [
      `L’application est réservée aux personnes de plus de ${MIN_AGE} ans. Lors de l’inscription, tu attestes remplir cette condition. Si tu es mineur, utilise l’application avec l’accord de tes parents ou de ton représentant légal.`,
      'L’application est gratuite. Une connexion internet est nécessaire pour lire les vidéos ; les frais de connexion restent à ta charge.',
    ],
  },
  {
    heading: '3. Ton compte',
    paragraphs: [
      'Tu t’engages à fournir des informations exactes et à garder ton mot de passe confidentiel. Tu es responsable de l’utilisation de ton compte. En cas d’accès non autorisé, préviens-nous sans attendre à l’adresse indiquée dans les Mentions légales.',
      'Tu peux supprimer ton compte à tout moment depuis Profil › Compte.',
    ],
  },
  {
    heading: '4. Avertissement santé',
    paragraphs: [
      'Les contenus sont proposés à des fins de bien-être. Ils ne constituent ni un avis médical, ni un diagnostic, ni un traitement, et ne remplacent pas l’avis d’un professionnel de santé.',
      'Demande l’avis d’un médecin avant de commencer si tu as un problème de santé, une blessure ou des douleurs, si tu es enceinte, ou si tu reprends une activité physique après une longue pause.',
      'Les exercices peuvent se pratiquer debout, assis ou sur une chaise : choisis la posture adaptée à ton corps. Pratique dans un espace dégagé et sûr, écoute tes sensations et arrête immédiatement en cas de douleur, de vertige ou de malaise.',
      'Ne suis jamais une séance, et en particulier une relaxation allongée, en conduisant ou pendant une activité qui demande ton attention.',
    ],
  },
  {
    heading: '5. Propriété intellectuelle',
    paragraphs: [
      `Les vidéos, textes, illustrations, marques et logos de l’application sont protégés et appartiennent à ${P.name} ou aux enseignants et ayants droit qui en ont autorisé l’usage.`,
      'Tu bénéficies d’un droit d’utilisation personnel, privé, non commercial, non exclusif et non cessible, pour la durée de ton compte. Il est interdit de copier, télécharger, extraire, diffuser publiquement ou revendre tout ou partie des contenus.',
    ],
  },
  {
    heading: '6. Règles d’utilisation',
    paragraphs: [
      'Tu t’engages à ne pas contourner les mesures de sécurité, perturber le fonctionnement du service, y accéder par des moyens automatisés, utiliser le compte d’une autre personne, ni utiliser l’application à des fins illicites.',
    ],
  },
  {
    heading: '7. Disponibilité du service',
    paragraphs: [
      'Nous faisons nos meilleurs efforts pour que l’application soit accessible, sans pouvoir garantir un fonctionnement ininterrompu. Le service peut être suspendu pour maintenance ou mise à jour, et son contenu peut évoluer.',
    ],
  },
  {
    heading: '8. Responsabilité',
    paragraphs: [
      'L’éditeur répond de ses obligations dans les conditions prévues par la loi. Il ne saurait être tenu responsable des dommages résultant d’une utilisation contraire aux présentes CGU ou à l’avertissement santé, d’une défaillance de ta connexion internet, ou des services tiers vers lesquels l’application renvoie (par exemple Instagram).',
      'Rien dans les présentes CGU ne limite les droits que tu tiens des dispositions impératives du droit de la consommation.',
    ],
  },
  {
    heading: '9. Suspension et suppression du compte',
    paragraphs: [
      'Tu peux supprimer ton compte à tout moment. En cas de manquement grave aux CGU, l’éditeur peut suspendre ou supprimer un compte, après t’en avoir informé sauf urgence ou obligation légale.',
    ],
  },
  {
    heading: '10. Données personnelles',
    paragraphs: [
      'Le traitement de tes données est décrit dans la Politique de confidentialité, accessible depuis l’application.',
    ],
  },
  {
    heading: '11. Modification des CGU',
    paragraphs: [
      'Les CGU peuvent évoluer. En cas de modification importante, tu en seras informé dans l’application et ton acceptation te sera à nouveau demandée avant de continuer.',
    ],
  },
  {
    heading: '12. Droit applicable et litiges',
    paragraphs: [
      'Les CGU sont soumises au droit français. En tant que consommateur résidant dans l’Union européenne, tu conserves la protection des dispositions impératives du droit de ton pays de résidence.',
      `En cas de difficulté, contacte-nous d’abord à ${P.email}. À défaut de solution, tu peux recourir gratuitement au médiateur de la consommation : ${M.name} (${M.website}). Tu peux aussi saisir le tribunal compétent, notamment celui de ton domicile.`,
    ],
  },
];

const TERMS_EN: LegalSection[] = [
  {
    heading: '1. Purpose',
    paragraphs: [
      `These Terms of Use govern access to and use of the ${APP} app, published by ${P.name} (see the Legal notice). The app offers guided video sessions (preparation, practice, relaxation), a progress journey and reminders.`,
      'Creating an account means you accept these Terms. If you do not accept them, do not use the app.',
    ],
  },
  {
    heading: '2. Access and minimum age',
    paragraphs: [
      `The app is intended for people over ${MIN_AGE} years old. When signing up, you confirm that you meet this condition. If you are a minor, use the app with the agreement of your parents or legal guardian.`,
      'The app is free of charge. An internet connection is required to play videos; connection costs are your responsibility.',
    ],
  },
  {
    heading: '3. Your account',
    paragraphs: [
      'You agree to provide accurate information and to keep your password confidential. You are responsible for the use of your account. If you notice any unauthorised access, tell us straight away at the address given in the Legal notice.',
      'You can delete your account at any time from Profile › Account.',
    ],
  },
  {
    heading: '4. Health notice',
    paragraphs: [
      'The content is offered for wellbeing purposes. It is not medical advice, diagnosis or treatment, and it does not replace the advice of a health professional.',
      'Ask a doctor before starting if you have a health condition, an injury or pain, if you are pregnant, or if you are returning to physical activity after a long break.',
      'Exercises can be done standing, seated or on a chair: choose the posture that suits your body. Practise in a clear and safe space, listen to your body and stop immediately if you feel pain, dizziness or discomfort.',
      'Never follow a session, especially a lying-down relaxation, while driving or doing anything that requires your attention.',
    ],
  },
  {
    heading: '5. Intellectual property',
    paragraphs: [
      `The videos, texts, illustrations, trademarks and logos in the app are protected and belong to ${P.name} or to the teachers and rights holders who authorised their use.`,
      'You are granted a personal, private, non-commercial, non-exclusive and non-transferable right of use for as long as your account exists. Copying, downloading, extracting, publicly broadcasting or reselling any of the content is prohibited.',
    ],
  },
  {
    heading: '6. Rules of use',
    paragraphs: [
      'You agree not to bypass security measures, disrupt the service, access it by automated means, use another person’s account, or use the app for unlawful purposes.',
    ],
  },
  {
    heading: '7. Availability',
    paragraphs: [
      'We do our best to keep the app available but cannot guarantee uninterrupted operation. The service may be suspended for maintenance or updates, and its content may change.',
    ],
  },
  {
    heading: '8. Liability',
    paragraphs: [
      'The publisher is liable for its obligations as provided by law. It cannot be held liable for damage resulting from use contrary to these Terms or to the health notice, from a failure of your internet connection, or from third-party services the app links to (for example Instagram).',
      'Nothing in these Terms limits the rights you have under mandatory consumer protection law.',
    ],
  },
  {
    heading: '9. Suspension and account deletion',
    paragraphs: [
      'You can delete your account at any time. In the event of a serious breach of these Terms, the publisher may suspend or delete an account, after informing you unless there is an emergency or a legal obligation.',
    ],
  },
  {
    heading: '10. Personal data',
    paragraphs: [
      'How your data is processed is described in the Privacy Policy, available in the app.',
    ],
  },
  {
    heading: '11. Changes to these Terms',
    paragraphs: [
      'These Terms may change. If a change is significant, you will be informed in the app and asked to accept the Terms again before continuing.',
    ],
  },
  {
    heading: '12. Governing law and disputes',
    paragraphs: [
      'These Terms are governed by French law. As a consumer residing in the European Union, you keep the protection of the mandatory rules of your country of residence.',
      `If you run into a problem, contact us first at ${P.email}. If no solution is found, you can refer the matter free of charge to the consumer mediator: ${M.name} (${M.website}). You may also bring the matter before the competent court, including the court where you live.`,
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Privacy Policy
// ─────────────────────────────────────────────────────────────

const PRIVACY_FR: LegalSection[] = [
  {
    heading: '1. Responsable du traitement',
    paragraphs: [
      `Le responsable du traitement de tes données est ${P.name}, ${P.address}.`,
      `Pour toute question sur tes données ou pour exercer tes droits : ${LEGAL.privacyEmail}.`,
    ],
  },
  {
    heading: '2. Données collectées',
    paragraphs: [
      '• Compte : nom (ou pseudonyme), adresse e-mail et mot de passe. Le mot de passe n’est jamais stocké en clair : seule une empreinte chiffrée est conservée.',
      `• Attestations : confirmation que tu as plus de ${MIN_AGE} ans, date et version des CGU et de la présente politique acceptées.`,
      '• Préférences : langue, thème clair ou sombre, choix concernant la newsletter, rappels (jours et horaires), mode chat.',
      '• Progression : minutes de pratique, oiseaux découverts, dernier enseignant choisi, dernière séance suivie et position de lecture.',
      '• Données techniques : adresse IP, type d’appareil, dates de connexion, enregistrées par notre serveur pour sécuriser le service.',
      'Nous ne collectons ni données de santé, ni géolocalisation, ni contacts, ni photos. L’application n’intègre aucun outil de publicité, de mesure d’audience ou de pistage.',
    ],
  },
  {
    heading: '3. Finalités et bases légales',
    paragraphs: [
      '• Créer et gérer ton compte, te donner accès aux séances, enregistrer ta progression et tes préférences : exécution du contrat que constituent les CGU (art. 6.1.b du RGPD).',
      '• Programmer tes rappels : exécution du contrat. Ce sont des notifications locales programmées sur ton appareil, jamais envoyées depuis un serveur, que tu peux désactiver à tout moment.',
      '• T’envoyer la newsletter : ton consentement (art. 6.1.a), que tu peux retirer à tout moment depuis Profil.',
      '• Assurer la sécurité du service et prévenir les abus : notre intérêt légitime (art. 6.1.f).',
      '• Conserver la preuve de ton attestation d’âge et de ton acceptation des CGU : notre intérêt légitime à pouvoir démontrer ton accord.',
    ],
  },
  {
    heading: '4. Destinataires',
    paragraphs: [
      `Tes données sont accessibles uniquement aux personnes habilitées de l’éditeur et à notre hébergeur, ${H.name}, qui agit en tant que sous-traitant (art. 28 du RGPD). [À COMPLÉTER le cas échéant : prestataire d’envoi de la newsletter.]`,
      'Tes données ne sont ni vendues, ni louées, ni utilisées à des fins publicitaires. Les enseignants n’ont pas accès à tes données.',
      'Les liens vers les profils Instagram des enseignants ouvrent un service tiers, soumis à sa propre politique de confidentialité.',
    ],
  },
  {
    heading: '5. Hébergement et transferts',
    paragraphs: [
      `Tes données sont hébergées ${H.location}. Aucun transfert hors de l’Union européenne n’est effectué. Si cela devait changer, il serait encadré par des garanties appropriées (décision d’adéquation ou clauses contractuelles types de la Commission européenne) et la présente politique serait mise à jour.`,
    ],
  },
  {
    heading: '6. Durées de conservation',
    paragraphs: [
      '• Compte, préférences et progression : tant que ton compte est actif. Un compte inactif pendant 3 ans est supprimé, après un e-mail de prévenance.',
      `• Suppression du compte : le compte est fermé immédiatement et ses données sont effacées sous ${DELETION_DELAY_DAYS} jours.`,
      '• Données techniques de connexion : 12 mois au maximum.',
      '• Newsletter : jusqu’au retrait de ton consentement.',
      '• Preuve d’acceptation des CGU et d’attestation d’âge : pendant la durée du compte, puis archivée 5 ans (délai de prescription) avec un accès restreint.',
    ],
  },
  {
    heading: '7. Mineurs',
    paragraphs: [
      `L’application est réservée aux personnes de plus de ${MIN_AGE} ans.`,
      `En France, lorsqu’un traitement repose sur le consentement, une personne de moins de ${DIGITAL_CONSENT_AGE} ans doit le donner conjointement avec le titulaire de l’autorité parentale (art. 45 de la loi Informatique et Libertés). Si tu as moins de ${DIGITAL_CONSENT_AGE} ans, n’active la newsletter qu’avec l’accord de tes parents.`,
      `Les parents peuvent nous contacter à ${LEGAL.privacyEmail} pour exercer les droits de leur enfant.`,
    ],
  },
  {
    heading: '8. Tes droits',
    paragraphs: [
      'Tu disposes d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de tes données, du droit de retirer ton consentement à tout moment, et du droit de définir des directives sur le sort de tes données après ton décès.',
      '• Dans l’application : modifie ton nom et tes préférences depuis Profil, obtiens une copie de tes données avec Profil › Compte › Exporter mes données, et supprime ton compte depuis Profil › Compte.',
      `• Par e-mail : ${LEGAL.privacyEmail}. Nous répondons dans un délai d’un mois. En cas de doute raisonnable sur ton identité, nous pouvons te demander un justificatif.`,
      'Tu peux introduire une réclamation auprès de la CNIL (3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — www.cnil.fr) ou de l’autorité de protection des données de ton pays de résidence.',
    ],
  },
  {
    heading: '9. Sécurité',
    paragraphs: [
      'Les échanges entre l’application et notre serveur sont chiffrés (HTTPS), les mots de passe sont stockés sous forme d’empreinte, les tentatives de connexion sont limitées et l’accès aux données est réservé aux personnes habilitées.',
    ],
  },
  {
    heading: '10. Stockage sur ton appareil',
    paragraphs: [
      'L’application conserve sur ton appareil uniquement ce qui est nécessaire à son fonctionnement : le jeton de session qui te garde connecté et les rappels programmés. Aucun cookie ni traceur publicitaire n’est utilisé ; ces éléments étant strictement nécessaires, ils ne nécessitent pas de consentement.',
    ],
  },
  {
    heading: '11. Autorisations',
    paragraphs: [
      'L’application demande uniquement l’autorisation d’afficher des notifications, et seulement pour les rappels. Tu peux la refuser ou la retirer dans les réglages de ton appareil.',
    ],
  },
  {
    heading: '12. Modifications',
    paragraphs: [
      'Cette politique peut évoluer. La date de mise à jour figure en haut du document. En cas de modification importante, tu en seras informé dans l’application et ton acceptation te sera à nouveau demandée.',
    ],
  },
];

const PRIVACY_EN: LegalSection[] = [
  {
    heading: '1. Data controller',
    paragraphs: [
      `The controller of your personal data is ${P.name}, ${P.address}.`,
      `For any question about your data or to exercise your rights: ${LEGAL.privacyEmail}.`,
    ],
  },
  {
    heading: '2. Data we collect',
    paragraphs: [
      '• Account: name (or nickname), email address and password. The password is never stored in plain text: only an encrypted hash is kept.',
      `• Confirmations: that you are over ${MIN_AGE} years old, and the date and version of the Terms and of this policy you accepted.`,
      '• Preferences: language, light or dark theme, newsletter choice, reminders (days and times), cat mode.',
      '• Progress: minutes of practice, birds discovered, last teacher chosen, last session followed and playback position.',
      '• Technical data: IP address, device type and sign-in dates, recorded by our server to keep the service secure.',
      'We do not collect health data, location, contacts or photos. The app contains no advertising, audience measurement or tracking tools.',
    ],
  },
  {
    heading: '3. Purposes and legal bases',
    paragraphs: [
      '• Creating and managing your account, giving you access to sessions, saving your progress and preferences: performance of the contract formed by the Terms of Use (Art. 6(1)(b) GDPR).',
      '• Scheduling your reminders: performance of the contract. They are local notifications scheduled on your device, never sent from a server, and you can turn them off at any time.',
      '• Sending you the newsletter: your consent (Art. 6(1)(a)), which you can withdraw at any time from Profile.',
      '• Keeping the service secure and preventing abuse: our legitimate interest (Art. 6(1)(f)).',
      '• Keeping proof of your age confirmation and acceptance of the Terms: our legitimate interest in being able to demonstrate your agreement.',
    ],
  },
  {
    heading: '4. Recipients',
    paragraphs: [
      `Your data is only accessible to authorised staff of the publisher and to our hosting provider, ${H.name}, acting as a processor (Art. 28 GDPR). [TO COMPLETE if applicable: newsletter sending provider.]`,
      'Your data is never sold, rented or used for advertising. Teachers have no access to your data.',
      'Links to teachers’ Instagram profiles open a third-party service, subject to its own privacy policy.',
    ],
  },
  {
    heading: '5. Hosting and transfers',
    paragraphs: [
      `Your data is hosted in ${H.location}. No data is transferred outside the European Union. Should that change, any transfer would be covered by appropriate safeguards (adequacy decision or European Commission standard contractual clauses) and this policy would be updated.`,
    ],
  },
  {
    heading: '6. Retention periods',
    paragraphs: [
      '• Account, preferences and progress: for as long as your account is active. An account inactive for 3 years is deleted, after a warning email.',
      `• Account deletion: the account is closed immediately and its data is erased within ${DELETION_DELAY_DAYS} days.`,
      '• Technical sign-in data: 12 months at most.',
      '• Newsletter: until you withdraw your consent.',
      '• Proof of acceptance of the Terms and of age confirmation: for the life of the account, then archived for 5 years (limitation period) with restricted access.',
    ],
  },
  {
    heading: '7. Minors',
    paragraphs: [
      `The app is intended for people over ${MIN_AGE} years old.`,
      `In France, where processing is based on consent, a person under ${DIGITAL_CONSENT_AGE} must give it jointly with the holder of parental authority (Art. 45 of the French Data Protection Act). If you are under ${DIGITAL_CONSENT_AGE}, only turn on the newsletter with your parents’ agreement.`,
      `Parents can contact us at ${LEGAL.privacyEmail} to exercise their child’s rights.`,
    ],
  },
  {
    heading: '8. Your rights',
    paragraphs: [
      'You have the right to access, rectify, erase, restrict, object to and port your data, the right to withdraw your consent at any time, and the right to give instructions on what happens to your data after your death.',
      '• In the app: change your name and preferences from Profile, get a copy of your data with Profile › Account › Export my data, and delete your account from Profile › Account.',
      `• By email: ${LEGAL.privacyEmail}. We reply within one month. If we have reasonable doubts about your identity, we may ask for proof.`,
      'You can lodge a complaint with the CNIL (3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France — www.cnil.fr) or with the data protection authority of your country of residence.',
    ],
  },
  {
    heading: '9. Security',
    paragraphs: [
      'Traffic between the app and our server is encrypted (HTTPS), passwords are stored as hashes, sign-in attempts are rate-limited and access to data is restricted to authorised people.',
    ],
  },
  {
    heading: '10. Storage on your device',
    paragraphs: [
      'The app only stores on your device what it needs to work: the session token that keeps you signed in and your scheduled reminders. No cookies or advertising trackers are used; as these items are strictly necessary, they do not require consent.',
    ],
  },
  {
    heading: '11. Permissions',
    paragraphs: [
      'The app only asks for permission to show notifications, and only for reminders. You can refuse or revoke it in your device settings.',
    ],
  },
  {
    heading: '12. Changes',
    paragraphs: [
      'This policy may change. The update date is shown at the top of the document. If a change is significant, you will be informed in the app and asked to accept it again.',
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Legal notice (mentions légales — LCEN, art. 6)
// ─────────────────────────────────────────────────────────────

const NOTICE_FR: LegalSection[] = [
  {
    heading: 'Éditeur',
    paragraphs: [
      `${APP} est éditée par ${P.name}, ${P.legalForm}.`,
      `Siège : ${P.address}`,
      `Immatriculation : ${P.registration}`,
      `TVA intracommunautaire : ${P.vat}`,
      `Contact : ${P.email} — ${P.phone}`,
    ],
  },
  {
    heading: 'Directeur de la publication',
    paragraphs: [P.director],
  },
  {
    heading: 'Hébergement',
    paragraphs: [`${H.name}, ${H.address} — ${H.phone}`],
  },
  {
    heading: 'Propriété intellectuelle',
    paragraphs: [
      `L’ensemble des contenus de l’application (vidéos, textes, illustrations, marques et logos) est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation de ${P.name} ou des ayants droit est interdite.`,
    ],
  },
  {
    heading: 'Crédits',
    paragraphs: [
      'Polices Caprasimo et Figtree sous licence SIL Open Font License. Icônes Lucide sous licence ISC.',
    ],
  },
];

const NOTICE_EN: LegalSection[] = [
  {
    heading: 'Publisher',
    paragraphs: [
      `${APP} is published by ${P.name}, ${P.legalForm}.`,
      `Registered office: ${P.address}`,
      `Registration: ${P.registration}`,
      `EU VAT number: ${P.vat}`,
      `Contact: ${P.email} — ${P.phone}`,
    ],
  },
  {
    heading: 'Publication director',
    paragraphs: [P.director],
  },
  {
    heading: 'Hosting',
    paragraphs: [`${H.name}, ${H.address} — ${H.phone}`],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      `All content in the app (videos, texts, illustrations, trademarks and logos) is protected by intellectual property law. Any reproduction without the authorisation of ${P.name} or the rights holders is prohibited.`,
    ],
  },
  {
    heading: 'Credits',
    paragraphs: [
      'Caprasimo and Figtree fonts under the SIL Open Font License. Lucide icons under the ISC License.',
    ],
  },
];

const DOCUMENTS: Record<LegalDocId, Record<LegalLanguage, LegalSection[]>> = {
  terms: { fr: TERMS_FR, en: TERMS_EN },
  privacy: { fr: PRIVACY_FR, en: PRIVACY_EN },
  'legal-notice': { fr: NOTICE_FR, en: NOTICE_EN },
};
