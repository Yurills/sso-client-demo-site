
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, ExternalLink, Settings } from "lucide-react";

const Index = () => {
  const [ssoConfig, setSsoConfig] = useState({
    ssoPortalUrl: "https://your-sso-portal.com",
    clientId: "demo-client-123",
    redirectUri: `${window.location.origin}/callback`,
    scope: "openid profile email"
  });

  const [showConfig, setShowConfig] = useState(false);

  const handleSSOLogin = () => {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: ssoConfig.clientId,
      redirect_uri: ssoConfig.redirectUri,
      scope: ssoConfig.scope,
      state: Math.random().toString(36).substring(7) // Simple state for demo
    });

    const ssoUrl = `${ssoConfig.ssoPortalUrl}/oauth/authorize?${params.toString()}`;
    console.log("Redirecting to SSO portal:", ssoUrl);
    
    // In a real implementation, you would redirect here
    // window.location.href = ssoUrl;
    
    // For demo purposes, we'll just log the URL
    alert(`Demo: Would redirect to:\n${ssoUrl}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">SSO Demo Client</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Config
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto space-y-6">
          {/* Main Login Card */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in securely using Single Sign-On
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSSOLogin}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 hover:shadow-lg gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Login with SSO
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                Secure authentication powered by OAuth 2.0
              </div>
            </CardContent>
          </Card>

          {/* Configuration Panel */}
          {showConfig && (
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">SSO Configuration</CardTitle>
                <CardDescription>
                  Configure your SSO portal settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ssoPortalUrl">SSO Portal URL</Label>
                  <Input
                    id="ssoPortalUrl"
                    value={ssoConfig.ssoPortalUrl}
                    onChange={(e) => setSsoConfig(prev => ({ ...prev, ssoPortalUrl: e.target.value }))}
                    placeholder="https://your-sso-portal.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={ssoConfig.clientId}
                    onChange={(e) => setSsoConfig(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="your-client-id"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="redirectUri">Redirect URI</Label>
                  <Input
                    id="redirectUri"
                    value={ssoConfig.redirectUri}
                    onChange={(e) => setSsoConfig(prev => ({ ...prev, redirectUri: e.target.value }))}
                    placeholder={`${window.location.origin}/callback`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Input
                    id="scope"
                    value={ssoConfig.scope}
                    onChange={(e) => setSsoConfig(prev => ({ ...prev, scope: e.target.value }))}
                    placeholder="openid profile email"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> This client will generate OAuth URLs and log them to the console. 
                In production, users would be redirected to your SSO portal for authentication.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
