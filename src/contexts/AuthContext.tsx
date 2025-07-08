import { set } from 'date-fns';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userInfo: any;
  login: (userInfo: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with a default logged-in user for testing
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userInfo, setUserInfo] = useState({
    user: {
      name: 'Test User',
      email: 'test@example.com'
    },
    token_type: 'Bearer',
    access_token: 'test-token-123'
  });

  // Check for existing JWT token in cookies on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      //check for JWT token in cookies
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
              name: decoded.preferred_username || decoded.sub || 'User',
              email: decoded.email || 'N/A',
              
            },
            token_type: 'Bearer',
            access_token: jwtToken,
            method: "jwt"
          });
        } catch (error) {
          console.error('Failed to decode JWT:', error);
          // If token is invalid, clear it
          document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }

      //2. check internal session
      try {
        const res = await fetch('/api/auth/session/status', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserInfo({
            user: {
              name: data.user.name || 'User',
              email: data.user.email || 'N/A',
            },
            method: "internal"
          });
        } else {
          console.log('No active session found, user is not logged in');
          setIsLoggedIn(false);
          setUserInfo(null); 
        }

      } catch (error) {
        console.error('Error checking session status:', error);
        setIsLoggedIn(false);
        setUserInfo(null);
      }


    };

    checkAuthStatus();
  }, []);

  const login = (userInfo: any) => {
    console.log('Login called with user info:', userInfo);
    setIsLoggedIn(true);
    setUserInfo(userInfo);
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    // Clear JWT token from cookies
    document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    console.log('User logged out, JWT token cleared');
     // Redirect to home page
    // Optionally, you can also clear the session on the server
    try {
      await fetch('/api/auth/session/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error clearing session on server:', error);
    }
    window.location.href = '/';

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
