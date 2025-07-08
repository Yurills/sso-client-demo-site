
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { parseJwt } from "@/lib/jwt";
import { parse } from "path";

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, userInfo } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing OAuth callback...');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    const token = urlParams.get('token');
    const par = urlParams.get('par');


  

    console.log("OAuth callback received:", { code, error, state, token, fullUrl: window.location.href });

    if (error) {
      setStatus('error');
      setMessage(`Authentication failed: ${error}`);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (!code && !token) {
      setStatus('error');
      setMessage('No authorization code or token received');

      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (!state) {
      setStatus('error');
      setMessage('No state parameter received');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    const stateCookie = document.cookie.split('; ').find(row => row.startsWith('state='));
    const stateCookieValue = stateCookie ? stateCookie.split('=')[1] : undefined;
    if (!par && code && state !== stateCookieValue) {
      setStatus('error');
      setMessage(`Invalid state parameter: code=${code}, state=${state}, cookie=${document.cookie}`);
      setTimeout(() => navigate('/'), 30000);
      return;
    }

    // Exchange authorization code for access token
    if (code && state) {
      setStatus('loading');
      exchangeCodeForToken('authorization_code', code, state);
    }
    // If we received a token directly (e.g. from push auth), handle it
    else if (token) {
      setStatus('loading');
      exchangeCodeForToken('refresh_token', token, state);
    }
  }, [location]);

  const exchangeCodeForToken = async (type: string, code: string, state: string | null) => {
    try {
      setMessage('Exchanging authorization code for access token...');
      
      // Get SSO config from localStorage (set by the main page)
      const ssoConfig = JSON.parse(localStorage.getItem('ssoConfig') || '{}');
      
      // Get code verifier from cookie
      const codeVerifier = document.cookie
        .split('; ')
        .find(row => row.startsWith('code_verifier='))
        ?.split('=')[1];

      if (!codeVerifier) {
        throw new Error('Code verifier not found in cookies');
      }

      // Make API request using proxy to avoid CORS issues
      const tokenResponse = await fetch('https://localhost:8080/api/sso/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: type,
          code: code,
          client_id: ssoConfig.clientId,
          // redirect_uri: ssoConfig.redirectUri,
          code_verifier: codeVerifier,
          nonce: Math.random().toString(36).substring(2, 15), // Generate a random nonce
        }).toString()
      });
      console.log(code)

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokenResponse.status, tokenResponse.statusText);
        throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('Token exchange successful:', tokenData);

      // Store JWT token in browser cookie (expires in 1 hour)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      document.cookie = `jwt_token=${tokenData.access_token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict `;

      // Clean up code verifier cookie
      document.cookie = 'code_verifier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      //handle session switch if needed
      const callbackRes = await fetch(`/api/auth/sso/callback?token=${tokenData.access_token}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (callbackRes.status === 409) {
        console.log("session conflict")
        localStorage.setItem('pending_oauth_user', JSON.stringify(tokenData));
        navigate('/session-prompt');
        return;
      }

      if (!callbackRes.ok) {
        throw new Error(`Callback processing failed: ${callbackRes.status} ${callbackRes.statusText}`);
      }

      //no conflict:
      login({
        user:{
          name: parseJwt(tokenData.access_token)?.preferred_username || 'N/A',
          email: parseJwt(tokenData.access_token)?.email || 'N/A',
        },
        token_type: 'Bearer',
        access_token: tokenData.access_token,
        method: 'jwt',
      })

      setStatus('success');
      setMessage('Authentication successful! Redirecting to home page...');
      setTimeout(() => {
        // Redirect to home page after successful authentication
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Token exchange failed:', error);
      setStatus('error');
      setMessage(`Failed to exchange authorization code: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => window.location.href = '/', 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                status === 'loading' ? 'bg-blue-100' :
                status === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {status === 'loading' && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                )}
                {status === 'success' && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                {status === 'error' && (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <CardTitle className={`text-2xl font-bold ${
                status === 'loading' ? 'text-blue-900' :
                status === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {status === 'loading' ? 'Authenticating...' :
                 status === 'success' ? 'Authentication Successful' : 'Authentication Failed'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {message}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Callback;
