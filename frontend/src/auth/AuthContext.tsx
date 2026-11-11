import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as authApi from '@/api/auth';
import type { RegisterInput } from '@/api/auth';
import { setAuthToken } from '@/api/client';
import { clearStoredToken, getStoredToken, storeToken } from '@/auth/storage';
import type { AuthPayload, User } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback(async (payload: AuthPayload) => {
    await storeToken(payload.token);
    setAuthToken(payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const clearSession = useCallback(async () => {
    await clearStoredToken();
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const storedToken = await getStoredToken();

      if (!storedToken) {
        if (active) {
          setIsLoading(false);
        }

        return;
      }

      setAuthToken(storedToken);

      try {
        const currentUser = await authApi.me();

        if (active) {
          setUser(currentUser);
          setToken(storedToken);
        }
      } catch {
        await clearSession();
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [clearSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const payload = await authApi.login(email, password);
      await applySession(payload);
    },
    [applySession]
  );

  const signUp = useCallback(
    async (input: RegisterInput) => {
      const payload = await authApi.register(input);
      await applySession(payload);
    },
    [applySession]
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The local session is cleared even if the API call fails.
    }

    await clearSession();
  }, [clearSession]);

  const refresh = useCallback(async () => {
    const currentUser = await authApi.me();
    setUser(currentUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, signIn, signUp, signOut, refresh }),
    [user, token, isLoading, signIn, signUp, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur de AuthProvider.');
  }

  return context;
}
