
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Home, Copy } from "lucide-react";
import { toast } from "sonner";

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authData, setAuthData] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    console.log("OAuth callback received:", { code, error, state, fullUrl: window.location.href });

    if (error) {
      setIsSuccess(false);
      setAuthData({ error, error_description: urlParams.get('error_description') });
    } else if (code) {
      setIsSuccess(true);
      setAuthData({
        code,
        state,
        message: "Authorization code received successfully!"
      });
    } else {
      setIsSuccess(false);
      setAuthData({ error: "No authorization code or error received" });
    }
  }, [location]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const goHome = () => {
    navigate('/');
  };

  if (isSuccess === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing OAuth callback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                isSuccess ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isSuccess ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <CardTitle className={`text-2xl font-bold ${
                isSuccess ? 'text-green-900' : 'text-red-900'
              }`}>
                {isSuccess ? 'Authentication Successful' : 'Authentication Failed'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {isSuccess 
                  ? 'OAuth flow completed successfully'
                  : 'There was an issue with the authentication process'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auth Data Display */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Response Details:</h3>
                {Object.entries(authData || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-600 capitalize">
                      {key.replace('_', ' ')}:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-mono bg-white px-2 py-1 rounded text-xs max-w-32 truncate">
                        {String(value)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(String(value))}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {isSuccess && (
                <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                  <strong>Next Steps:</strong> In a real application, you would now exchange this authorization code for an access token using your backend server.
                </div>
              )}

              <Button onClick={goHome} className="w-full gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Callback;
