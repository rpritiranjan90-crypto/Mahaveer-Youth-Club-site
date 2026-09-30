import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../admin/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { usePageMeta } from '../../hooks/usePageMeta';

export const AdminLoginPage: React.FC = () => {
  usePageMeta({
    title: 'Admin Authentication',
    description: 'Secure administrator login for Mahaveer Youth Club Banza.',
  });

  const { login, verify2FA, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA Challenge states
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.requires_2fa && res.challenge_token) {
        setChallengeToken(res.challenge_token);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeToken) return;
    setError(null);
    setLoading(true);

    try {
      await verify2FA(challengeToken, twoFactorCode);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid authentication code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-xs border border-stone-200 shrink-0">
              <img
                src="/images/official_club_logo.png"
                alt="Mahaveer Youth Club"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <Badge variant="saffron">ADMIN PORTAL</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {challengeToken ? 'Two-Factor Verification' : 'Administrator Sign In'}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600">
            {challengeToken
              ? useRecoveryCode
                ? 'Enter an 8-character single-use recovery code.'
                : 'Enter the 6-digit code from your authenticator app.'
              : 'Mahaveer Youth Club Banza Control Panel'}
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-stone-200 shadow-sm space-y-6">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {!challengeToken ? (
            /* 1. Primary Login Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mahaveeryouthclub.org"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In →'}
                </Button>
              </div>
            </form>
          ) : (
            /* 2. 2FA Challenge Form */
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {useRecoveryCode ? 'Backup Recovery Code' : '6-Digit TOTP Code'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseRecoveryCode(!useRecoveryCode);
                      setTwoFactorCode('');
                      setError(null);
                    }}
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    {useRecoveryCode ? '← Use Authenticator Code' : 'Use Recovery Code →'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                  placeholder={useRecoveryCode ? 'XXXX-XXXX' : '123456'}
                  maxLength={useRecoveryCode ? 15 : 6}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 text-center font-mono text-lg tracking-widest focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue →'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-stone-600"
                  onClick={() => {
                    setChallengeToken(null);
                    setTwoFactorCode('');
                    setError(null);
                  }}
                >
                  ← Back to Password Login
                </Button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-stone-100 text-center">
            <Link
              to="/"
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
            >
              ← Return to Public Website
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
