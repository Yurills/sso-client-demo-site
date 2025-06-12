
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    console.log("OAuth callback received:", { code, error, state, fullUrl: window.location.href });

    if (error) {
      setStatus('error');
      setMessage(`Authentication failed: ${error}`);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    // Exchange authorization code for access token
    exchangeCodeForToken(code, state);
  }, [location, navigate, login]);

  const exchangeCodeForToken = async (code: string, state: string | null) => {
    try {
      setMessage('Exchanging authorization code for access token...');
      
      // Get SSO config from localStorage (set by the main page)
      const ssoConfig = JSON.parse(localStorage.getItem('ssoConfig') || '{}');
      
      // In a real implementation, this would be a POST request to your SSO portal's token endpoint
      // For demo purposes, we'll simulate the token exchange
      console.log('Exchanging code for token:', {
        code,
        client_id: ssoConfig.clientId,
        redirect_uri: ssoConfig.redirectUri,
        grant_type: 'authorization_code'
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful token response
      const mockUserInfo = {
        access_token: 'mock_access_token_' + Math.random().toString(36).substring(7),
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: '12345',
          email: 'user@example.com',
          name: 'Demo User'
        }
      };

      // Store user info and mark as logged in
      login(mockUserInfo);
      
      setStatus('success');
      setMessage('Successfully authenticated! Redirecting to home...');
      
      // Redirect to home after 2 seconds
      setTimeout(() => navigate('/'), 2000);
      
    } catch (error) {
      console.error('Token exchange failed:', error);
      setStatus('error');
      setMessage('Failed to exchange authorization code for access token');
      setTimeout(() => navigate('/'), 3000);
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
