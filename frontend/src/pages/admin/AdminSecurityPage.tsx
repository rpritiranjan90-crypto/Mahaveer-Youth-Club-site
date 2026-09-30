import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../admin/AuthContext';
import { apiService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { usePageMeta } from '../../hooks/usePageMeta';

export const AdminSecurityPage: React.FC = () => {
  usePageMeta({
    title: 'Security & 2FA Settings',
    description: 'Manage two-factor authentication and password security.',
  });

  const { token, user, refreshUser } = useAuth();

  // 2FA Setup State
  const [setupData, setSetupData] = useState<{ secret: string; provisioning_uri: string } | null>(null);
  const [setupCode, setSetupCode] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [generatedRecoveryCodes, setGeneratedRecoveryCodes] = useState<string[] | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // 2FA Disable State
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // 1. Initialize 2FA Setup
  const handleStartSetup = async () => {
    if (!token) return;
    setSetupError(null);
    setSetupLoading(true);
    try {
      const data = await apiService.setup2FA(token);
      setSetupData(data);
      setGeneratedRecoveryCodes(null);
    } catch (err: any) {
      setSetupError(err?.message || 'Failed to initialize 2FA setup.');
    } finally {
      setSetupLoading(false);
    }
  };

  // 2. Enable 2FA with Code
  const handleEnableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSetupError(null);
    setSetupLoading(true);
    try {
      const res = await apiService.enable2FA(token, setupCode);
      setGeneratedRecoveryCodes(res.recovery_codes);
      setSetupData(null);
      setSetupCode('');
      await refreshUser();
    } catch (err: any) {
      setSetupError(err?.message || 'Invalid 6-digit TOTP code.');
    } finally {
      setSetupLoading(false);
    }
  };

  // 3. Disable 2FA
  const handleDisableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setDisableError(null);
    setDisableLoading(true);
    try {
      await apiService.disable2FA(token, disablePassword, disableCode);
      setShowDisableForm(false);
      setDisablePassword('');
      setDisableCode('');
      setGeneratedRecoveryCodes(null);
      await refreshUser();
    } catch (err: any) {
      setDisableError(err?.message || 'Failed to disable 2FA. Verify password and code.');
    } finally {
      setDisableLoading(false);
    }
  };

  // 4. Change Password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 12) {
      setPwdError('New password must be at least 12 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await apiService.changePassword(token, currentPassword, newPassword);
      setPwdSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err?.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    if (generatedRecoveryCodes) {
      navigator.clipboard.writeText(generatedRecoveryCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="saffron">SECURITY & CREDENTIALS</Badge>
            <Badge variant="neutral">ADMIN ID: {user?.id}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Security & Authentication Settings
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Manage your two-factor authentication (2FA) and administrator password.
          </p>
        </div>

        <Link to="/admin">
          <Button variant="secondary" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* SECTION 1: TWO-FACTOR AUTHENTICATION */}
      <Card className="p-6 sm:p-8 bg-white border border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xl">
              🛡️
            </span>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Two-Factor Authentication (RFC 6238 TOTP)
              </h2>
              <p className="text-xs text-stone-500">
                Requires an authenticator app (Google Authenticator, Microsoft Authenticator, Authy) on login.
              </p>
            </div>
          </div>
          <Badge variant={user?.totp_enabled ? 'success' : 'amber'}>
            {user?.totp_enabled ? '2FA ACTIVE' : '2FA DISABLED'}
          </Badge>
        </div>

        {/* Display Recovery Codes When Newly Generated */}
        {generatedRecoveryCodes && (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-4 animate-in fade-in">
            <div className="flex items-start space-x-3">
              <span className="text-2xl shrink-0" aria-hidden="true">🎉</span>
              <div>
                <h3 className="text-base font-bold text-emerald-900">
                  2FA Successfully Enabled — Backup Recovery Codes
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                  Save these recovery codes somewhere secure. Each code can be used once as a fallback if you lose your authenticator app.{' '}
                  <strong className="underline">They will not be shown again.</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-4 rounded-lg border border-emerald-200 font-mono text-center text-xs sm:text-sm font-bold text-stone-800 select-all">
              {generatedRecoveryCodes.map((code, idx) => (
                <div key={idx} className="p-2 bg-stone-50 rounded border border-stone-200">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={copyRecoveryCodes}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                {copiedCodes ? '✓ Copied to Clipboard' : '📋 Copy All Codes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
              >
                🖨️ Print Codes
              </Button>
            </div>
          </div>
        )}

        {/* Setup Flow (When 2FA Disabled) */}
        {!user?.totp_enabled && !generatedRecoveryCodes && (
          <div className="space-y-4">
            {setupError && <Alert variant="error">{setupError}</Alert>}

            {!setupData ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-900">
                    Protect your administrative account
                  </h4>
                  <p className="text-xs text-stone-600">
                    Scan a QR code with any standard TOTP authenticator app and verify setup.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStartSetup}
                  disabled={setupLoading}
                  className="shrink-0 font-bold"
                >
                  {setupLoading ? 'Initializing...' : 'Set Up 2FA Now →'}
                </Button>
              </div>
            ) : (
              <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl space-y-6">
                <div className="space-y-2">
                  <Badge variant="saffron">STEP 1 OF 2</Badge>
                  <h3 className="text-base font-bold text-stone-900">
                    Add Mahaveer Youth Club to your Authenticator App
                  </h3>
                  <p className="text-xs text-stone-600">
                    Scan the provisioning key or manually enter the secret into your authenticator app.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-stone-200 space-y-3 max-w-md">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Manual Base32 Secret Key
                  </label>
                  <div className="p-3 bg-stone-100 rounded border border-stone-300 font-mono text-center text-sm font-bold tracking-widest text-orange-900 select-all">
                    {setupData.secret}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Account Name: <span className="font-semibold">{user?.email}</span>
                  </p>
                </div>

                <form onSubmit={handleEnableSubmit} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Badge variant="saffron">STEP 2 OF 2</Badge>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Enter 6-Digit Code from Authenticator
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      value={setupCode}
                      onChange={(e) => setSetupCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-center font-mono text-lg tracking-widest focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={setupLoading || setupCode.length !== 6}
                      className="font-bold"
                    >
                      {setupLoading ? 'Activating...' : 'Verify & Activate 2FA'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setSetupData(null);
                        setSetupCode('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Manage Flow (When 2FA Enabled) */}
        {user?.totp_enabled && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-emerald-900 block">
                  ✓ Two-Factor Authentication is currently active
                </span>
                <span className="text-xs text-emerald-800">
                  Your login sessions require TOTP app verification or backup recovery codes.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisableForm(!showDisableForm)}
                className="text-rose-700 border-rose-300 hover:bg-rose-50"
              >
                {showDisableForm ? 'Close Disable Form' : 'Disable 2FA'}
              </Button>
            </div>

            {showDisableForm && (
              <form
                onSubmit={handleDisableSubmit}
                className="p-6 bg-rose-50/50 border border-rose-200 rounded-xl space-y-4 max-w-md animate-in fade-in"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-900">
                    Confirm 2FA Deactivation
                  </h4>
                  <p className="text-xs text-rose-700">
                    Requires your current password and a valid authenticator or recovery code.
                  </p>
                </div>

                {disableError && <Alert variant="error">{disableError}</Alert>}

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    6-Digit TOTP or Recovery Code
                  </label>
                  <input
                    type="text"
                    required
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.toUpperCase())}
                    placeholder="123456 or XXXX-XXXX"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-rose-700 hover:bg-rose-800 text-white font-bold"
                    disabled={disableLoading}
                  >
                    {disableLoading ? 'Disabling...' : 'Confirm Disable 2FA'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDisableForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Card>

      {/* SECTION 2: PASSWORD CHANGE */}
      <Card className="p-6 sm:p-8 bg-white border border-stone-200 space-y-6">
        <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
          <span className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center text-xl">
            🔑
          </span>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Change Administrator Password</h2>
            <p className="text-xs text-stone-500">
              Must be at least 12 characters long. Changing password revokes active refresh tokens.
            </p>
          </div>
        </div>

        {pwdError && <Alert variant="error">{pwdError}</Alert>}
        {pwdSuccess && <Alert variant="success">{pwdSuccess}</Alert>}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              New Password (min 12 characters)
            </label>
            <input
              type="password"
              required
              minLength={12}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={12}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={pwdLoading}
              className="font-bold shadow-sm"
            >
              {pwdLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
