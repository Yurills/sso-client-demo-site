
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LocalLoginFormProps {
  onCancel: () => void;
}

const LocalLoginForm = ({ onCancel }: LocalLoginFormProps) => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/session/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Check session status to get user info
        const sessionResponse = await fetch('/api/auth/session/status', {
          credentials: 'include',
        });
        
        if (sessionResponse.ok) {
          const userData = await sessionResponse.json();
          login({
            user: userData.user,
            method: "internal"
          });
          onCancel(); // Close the form
        }
      } else {
        const errorText = await response.text();
        setError(errorText || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-blue-100">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Local Login</CardTitle>
        <CardDescription className="text-gray-600">
          Sign in with your local account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 hover:shadow-lg gap-2"
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>Demo credentials: admin / admin123</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalLoginForm;
