import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AccountSelectionDialog from "@/components/AccountSelectionDialog";

const SSO = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, userInfo, login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'account_conflict'>('loading');
  const [message, setMessage] = useState('Processing push authorization request...');
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [ssoUserData, setSsoUserData] = useState<any>(null);
  const [pendingTokenData, setPendingTokenData] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const ssoToken = urlParams.get('sso_token');

    console.log("SSO callback received:", { ssoToken, fullUrl: window.location.href });

    if (!ssoToken) {
      setStatus('error');
      setMessage('No SSO token received');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    handlePushAuthRequest(ssoToken);
  }, [location]);

  const generateCodeVerifier = () => {
    const codeVerifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    document.cookie = `code_verifier=${codeVerifier}; path=/; max-age=3600`; // Store for 1 hour
    return codeVerifier;
  }
  const generateCodeChallenge = (codeVerifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    return crypto.subtle.digest("SHA-256", data).then((hash) => {
      const base64Url = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      return base64Url;
    });
  }

  const handlePushAuthRequest = async (ssoToken: string) => {
    try {
      const codeVerifier = generateCodeVerifier();
      document.cookie = `code_verifier=${codeVerifier}; path=/; max-age=3600`;
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      console.log('Step 1: Calling /api/sso/par with sso_token');
      setMessage('Step 1: Processing push authorization request...');
      
      const parResponse = await fetch(`https://localhost:8080/api/sso/par`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'web-app-prod-client',
          sso_token: ssoToken,
          state: Math.random().toString(36).substring(7),
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          redirect_uri: `${window.location.origin}/callback`
        })
      });

      if (!parResponse.ok) {
        console.error('PAR request failed:', parResponse.status, parResponse.statusText);
        throw new Error(`PAR request failed: ${parResponse.status} ${parResponse.statusText}`);
      }

      const parData = await parResponse.json();
      console.log('PAR response received:', parData);

      if (parData.token) {
        console.log('Received refresh_token');
        
        // Check if user is already logged in locally
        if (isLoggedIn && userInfo) {
          // Decode the SSO token to get user info
          try {
            const base64Url = parData.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const decoded = JSON.parse(jsonPayload);
            const ssoUser = {
              name: decoded.sub || decoded.preferred_username || 'SSO User',
              email: decoded.email || 'N/A'
            };
            
            setSsoUserData(ssoUser);
            setPendingTokenData({ token: parData.token, state: parData.state });
            setStatus('account_conflict');
            setMessage('Account conflict detected. Please choose which account to continue with.');
            setShowAccountDialog(true);
            return;
          } catch (error) {
            console.error('Failed to decode SSO token:', error);
          }
        }
        
        // No conflict, proceed normally
        setStatus('success');
        setMessage('Push authorization completed successfully! Redirecting...');
        navigate(`/callback?token=${parData.token}&state=${parData.state}`);
        return;
      }

      if (!parData.request_uri && !parData.token) {
        throw new Error('No request_uri received from PAR endpoint');
      }

      console.log('Step 2: Redirecting to /api/sso/par/authorized with request_uri');
      setMessage('Step 2: Authorizing request...');

      const authorizeResponse = await fetch('https://localhost:8080/api/sso/par/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_uri: parData.request_uri
        })
      });

      if (!authorizeResponse.ok) {
        console.error('Authorization request failed:', authorizeResponse.status, authorizeResponse.statusText);
        throw new Error(`Authorization request failed: ${authorizeResponse.status} ${authorizeResponse.statusText}`);
      }

      const authorizeData = await authorizeResponse.json();
      console.log('Authorization response received:', authorizeData);

      setStatus('success');
      setMessage('Push authorization completed successfully! Redirecting...');
      
      navigate(`/callback?code=${authorizeData.code}&state=${parData.state}&par=true`);
      
      setTimeout(() => navigate('/'), 2000);
      
    } catch (error) {
      console.error('Push authorization failed:', error);
      setStatus('error');
      setMessage(`Push authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => navigate('/'), 3000);
    }
  };

  const handleSelectSSO = () => {
    if (pendingTokenData) {
      setShowAccountDialog(false);
      setStatus('success');
      setMessage('Continuing with SSO account. Redirecting...');
      navigate(`/callback?token=${pendingTokenData.token}&state=${pendingTokenData.state}`);
    }
  };

  const handleSelectLocal = () => {
    setShowAccountDialog(false);
    setStatus('success');
    setMessage('Continuing with local account. Redirecting to home...');
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  status === 'loading' ? 'bg-purple-100' :
                  status === 'success' ? 'bg-green-100' : 
                  status === 'account_conflict' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {status === 'loading' && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  )}
                  {status === 'success' && (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                  {status === 'account_conflict' && (
                    <div className="h-6 w-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  )}
                  {status === 'error' && (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <CardTitle className={`text-2xl font-bold ${
                  status === 'loading' ? 'text-purple-900' :
                  status === 'success' ? 'text-green-900' : 
                  status === 'account_conflict' ? 'text-yellow-900' : 'text-red-900'
                }`}>
                  {status === 'loading' ? 'Processing Push Auth...' :
                   status === 'success' ? 'Authorization Successful' : 
                   status === 'account_conflict' ? 'Account Selection Required' : 'Authorization Failed'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {message}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      <AccountSelectionDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
        localUser={userInfo?.user}
        ssoUser={ssoUserData}
        onSelectLocal={handleSelectLocal}
        onSelectSSO={handleSelectSSO}
      />
    </>
  );
};

export default SSO;
