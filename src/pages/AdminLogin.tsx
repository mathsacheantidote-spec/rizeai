import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { signIn, signUp, getCurrentUser } from '@/lib/auth';

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        if (user.role === 'admin') {
          // Admin user, redirect to admin panel
          navigate('/admin');
        } else {
          // Non-admin user, show error and sign out
          setError('Your account does not have admin access. Please contact an administrator.');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    const { user, error: authError } = await signIn(formData.email, formData.password);

    if (authError) {
      setError(authError);
      setAuthLoading(false);
      return;
    }

    if (user?.role !== 'admin') {
      setError('You do not have admin access');
      setAuthLoading(false);
      return;
    }

    navigate('/admin');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setError('Name is required');
      setAuthLoading(false);
      return;
    }

    const { user, error: authError } = await signUp(formData.email, formData.password, formData.name);

    if (authError) {
      setError(authError);
      setAuthLoading(false);
      return;
    }

    if (user?.role !== 'admin') {
      setError('New accounts are created with user role. Please contact an administrator to grant admin access.');
      setAuthLoading(false);
      return;
    }

    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-slate-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
              <p className="text-slate-400">
                {isSignUp ? 'Create an admin account' : 'Sign in to your admin account'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={authLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={authLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={authLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={authLoading || !formData.email || !formData.password || (isSignUp && !formData.name)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 rounded-lg"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  <>{isSignUp ? 'Create Account' : 'Sign In'}</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                {' '}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setFormData({ email: '', password: '', name: '' });
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </Card>

        <p className="text-center text-slate-500 text-xs mt-6">
          Admin access is restricted. Contact your administrator for account creation.
        </p>
      </div>
    </div>
  );
}
