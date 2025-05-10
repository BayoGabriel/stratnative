import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode'; // You'll need to install this package

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  image?: string;
  role: string;
  status: string;
}

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  exp: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isTokenExpired: () => boolean;
}

// Storage keys
const USER_STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [userJson, token] = await Promise.all([
        AsyncStorage.getItem(USER_STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_STORAGE_KEY)
      ]);

      if (userJson && token) {
        // Check if token is expired
        if (isTokenValid(token)) {
          setAuthState({
            user: JSON.parse(userJson),
            token,
            isAuthenticated: true
          });
        } else {
          // Token expired, clear storage
          await clearAuthStorage();
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      await clearAuthStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const isTokenValid = (token: string): boolean => {
    try {
      const decoded = jwt_decode<TokenPayload>(token);
      // Check if token is expired
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const isTokenExpired = (): boolean => {
    if (!authState.token) return true;
    return !isTokenValid(authState.token);
  };

  const clearAuthStorage = async () => {
    try {
      await AsyncStorage.multiRemove([USER_STORAGE_KEY, TOKEN_STORAGE_KEY]);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  };

  const setUser = (user: User | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user
    }));
  };

  // In the login function, modify it to return user role:
const login = async (email: string, password: string) => {
  try {
    setIsLoading(true);
    const response = await fetch('https://stratoliftapp.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (!data.token || !data.user) {
      throw new Error('Invalid response from server');
    }

    // Store user data and token separately
    await Promise.all([
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user)),
      AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token)
    ]);

    setAuthState({
      user: data.user,
      token: data.token,
      isAuthenticated: true
    });
    
    return data.user.role; // Return the user role
  } catch (error) {
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const logout = async () => {
    try {
      setIsLoading(true);
      await clearAuthStorage();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        user: authState.user, 
        token: authState.token,
        isAuthenticated: authState.isAuthenticated,
        isLoading, 
        setUser, 
        login, 
        logout,
        isTokenExpired
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};