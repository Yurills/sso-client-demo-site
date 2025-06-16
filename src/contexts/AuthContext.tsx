
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userInfo: any;
  login: (userInfo: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Check for existing JWT token in cookies on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const jwtToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt_token='))
        ?.split('=')[1];

      if (jwtToken) {
        console.log('Found JWT token in cookies:', jwtToken);
        // Decode JWT to get user info (simple decode without verification for demo)
        try {
          const base64Url = jwtToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const decoded = JSON.parse(jsonPayload);
          console.log('Decoded JWT payload:', decoded);
          
          setIsLoggedIn(true);
          setUserInfo({
            user: {
              name: decoded.sub || decoded.preferred_username || 'User',
              email: decoded.email || 'N/A',
              
            },
            token_type: 'Bearer',
            access_token: jwtToken
          });
        } catch (error) {
          console.error('Failed to decode JWT:', error);
          // If token is invalid, clear it
          document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userInfo: any) => {
    console.log('Login called with user info:', userInfo);
    setIsLoggedIn(true);
    setUserInfo(userInfo);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    // Clear JWT token from cookies
    document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    console.log('User logged out, JWT token cleared');
    window.location.href = '/'; // Redirect to home page
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
