import {
  createContext,
  type PropsWithChildren,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiRequest, clearApiCache } from "../lib/api";

const LOCAL_STORAGE_TOKEN_KEY = "smartestate.auth.token";
const SESSION_STORAGE_TOKEN_KEY = "smartestate.auth.session-token";
const PUBLIC_DEMO_ACCESS = import.meta.env.VITE_PUBLIC_DEMO_ACCESS?.toLowerCase() !== "false";

export type AuthUser = {
  created_at: string;
  email: string;
  full_name: string;
  id: number;
  is_active: boolean;
  phone_number: string;
  role: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type LoginPayload = {
  email: string;
  password: string;
  remember: boolean;
};

type RegisterPayload = {
  email: string;
  full_name: string;
  password: string;
  phone_number: string;
  role?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  token: null | string;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER: AuthUser = {
  created_at: new Date(0).toISOString(),
  email: "demo@smartestate.ma",
  full_name: "SmartEstate Demo",
  id: 0,
  is_active: true,
  phone_number: "",
  role: "demo",
};

function getStoredToken() {
  return (
    window.localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) ??
    window.sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY)
  );
}

function storeToken(token: string, remember: boolean) {
  window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY);

  if (remember) {
    window.localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, token);
}

function clearStoredToken() {
  window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<null | string>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (isMounted) {
          setUser(PUBLIC_DEMO_ACCESS ? DEMO_USER : null);
          setIsBootstrapping(false);
        }
        return;
      }

      if (isMounted) {
        setToken(storedToken);
      }

      try {
        const currentUser = await apiRequest<AuthUser>("/auth/me/", { token: storedToken });
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setUser(currentUser);
          setToken(storedToken);
        });
      } catch {
        clearStoredToken();
        clearApiCache();
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setUser(PUBLIC_DEMO_ACCESS ? DEMO_USER : null);
          setToken(null);
        });
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(payload: LoginPayload) {
    const response = await apiRequest<AuthResponse>("/auth/login/", {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
      },
    });

    storeToken(response.token, payload.remember);
    clearApiCache();
    startTransition(() => {
      setToken(response.token);
      setUser(response.user);
    });

    return response.user;
  }

  async function register(payload: RegisterPayload) {
    const response = await apiRequest<AuthResponse>("/auth/register/", {
      method: "POST",
      body: {
        email: payload.email,
        full_name: payload.full_name,
        password: payload.password,
        phone_number: payload.phone_number,
        role: payload.role ?? "investor",
      },
    });

    storeToken(response.token, true);
    clearApiCache();
    startTransition(() => {
      setToken(response.token);
      setUser(response.user);
    });

    return response.user;
  }

  function logout() {
    clearStoredToken();
    clearApiCache();
    startTransition(() => {
      setToken(null);
      setUser(PUBLIC_DEMO_ACCESS ? DEMO_USER : null);
    });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: PUBLIC_DEMO_ACCESS || Boolean(token && user),
        isBootstrapping,
        login,
        logout,
        register,
        token,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit etre utilise dans AuthProvider.");
  }

  return context;
}
