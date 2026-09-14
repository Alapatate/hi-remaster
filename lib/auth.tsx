import { account } from '@/lib/appwrite';
import i18n, { catLanguageFor, DEFAULT_LANGUAGE } from '@/lib/i18n';
import * as React from 'react';
import { ID, type Models } from 'react-native-appwrite';

type User = Models.User<Models.Preferences>;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePrefs: (prefs: Models.Preferences) => Promise<void>;
  /** Rename the account. The name is what every screen greets the user with. */
  updateName: (name: string) => Promise<void>;
  /** Re-fetch the account from the server and refresh context. Returns the fresh user. */
  refreshUser: () => Promise<User | null>;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

function applyLanguage(prefs: Models.Preferences) {
  const stored = prefs as Record<string, unknown>;
  // Cat mode overrides the account's language without overwriting it, so
  // switching the easter egg back off lands on the real language again — and
  // the meow it swaps in is the one that language's cats actually make.
  const lang = (stored?.language as string) || DEFAULT_LANGUAGE;
  i18n.changeLanguage(stored?.catMode === true ? catLanguageFor(lang) : lang);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    account
      .get()
      .then((u) => {
        setUser(u);
        applyLanguage(u.prefs);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    const current = await account.get();
    setUser(current);
    applyLanguage(current.prefs);
  };

  const signUp = async (email: string, password: string, name: string) => {
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    const current = await account.get();
    setUser(current);
    applyLanguage(current.prefs);
  };

  const signOut = async () => {
    await account.deleteSession('current');
    setUser(null);
    i18n.changeLanguage('en');
  };

  const updatePrefs = async (prefs: Models.Preferences) => {
    const current = await account.getPrefs();
    const updated = await account.updatePrefs({ ...current, ...prefs });
    setUser(updated);
    applyLanguage(updated.prefs);
  };

  const updateName = async (name: string) => {
    const updated = await account.updateName(name);
    setUser(updated);
  };

  const refreshUser = async () => {
    try {
      const current = await account.get();
      setUser(current);
      applyLanguage(current.prefs);
      return current;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, updatePrefs, updateName, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
