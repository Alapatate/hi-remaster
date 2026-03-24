import { account } from '@/lib/appwrite';
import i18n from '@/lib/i18n';
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
};

const AuthContext = React.createContext<AuthContextType | null>(null);

function applyLanguage(prefs: Models.Preferences) {
  const lang = (prefs as Record<string, string>)?.language;
  if (lang) i18n.changeLanguage(lang);
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updatePrefs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
