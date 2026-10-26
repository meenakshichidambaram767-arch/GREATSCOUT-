import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  company?: string;
  isGuest?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (name: string, email: string, password?: string, company?: string) => Promise<User>;
  login: (email: string, password?: string) => Promise<User>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<User>;
  loginAsGuest: () => User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'greatscout_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const signup = async (name: string, email: string, _password?: string, company?: string): Promise<User> => {
    // Generate initials for avatar placeholder
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'GS';

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || 'Independent Builder',
      role: 'Founder & Builder',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=0e6670&textColor=ffffff`,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    return newUser;
  };

  const login = async (email: string, _password?: string): Promise<User> => {
    const cleanEmail = email.trim().toLowerCase();
    const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ') || 'Builder';
    const capitalizedName = derivedName
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      name: capitalizedName,
      email: cleanEmail,
      company: 'Venture Studio',
      role: 'Product Lead',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(capitalizedName)}&backgroundColor=0e6670&textColor=ffffff`,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    saveUser(loggedUser);
    return loggedUser;
  };

  const loginWithOAuth = async (provider: 'google' | 'github'): Promise<User> => {
    const name = provider === 'google' ? 'Google Explorer' : 'GitHub Developer';
    const email = `${provider}_user@greatscout.ai`;

    const oauthUser: User = {
      id: `usr_${provider}_${Date.now()}`,
      name,
      email,
      company: 'Tech Innovator',
      role: 'Operator',
      avatar: provider === 'google' 
        ? 'https://api.dicebear.com/7.x/bottts/svg?seed=google' 
        : 'https://api.dicebear.com/7.x/bottts/svg?seed=github',
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    saveUser(oauthUser);
    return oauthUser;
  };

  const loginAsGuest = (): User => {
    const guestUser: User = {
      id: 'guest_explorer',
      name: 'Guest Explorer',
      email: 'guest@greatscout.ai',
      company: 'Preview Workspace',
      role: 'Guest Analyst',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GE&backgroundColor=55696e&textColor=ffffff',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };

    saveUser(guestUser);
    return guestUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signup,
        login,
        loginWithOAuth,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
