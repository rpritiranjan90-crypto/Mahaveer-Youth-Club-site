import React, { useState, useEffect } from 'react';
import { adminApi } from './api';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import {
  HeartHandshake,
  Save,
  QrCode,
  ShieldAlert,
  Upload,
  RefreshCw,
} from 'lucide-react';

export const AdminDonationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    club_name: 'Mahaveer Youth Club',
    upi_id: 'mahaveeryouthclub@upi',
    qr_image_url: '',
    description: '',
    suggested_amounts: '101,501,1001,2001',
  });

  useEffect(() => {
    fetchDonationSettings();
  }, []);

  const fetchDonationSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getDonation();
      setFormData({
        club_name: data.club_name || 'Mahaveer Youth Club',
        upi_id: data.upi_id || 'mahaveeryouthclub@upi',
        qr_image_url: data.qr_image_url || '',
        description: data.description || '',
        suggested_amounts: data.suggested_amounts || '101,501,1001,2001',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load donation configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    setError(null);
    try {
      const res = await adminApi.uploadImage(file);
      setFormData((prev) => ({ ...prev, qr_image_url: res.file_url || res.url }));
    } catch (err: any) {
      setError(err?.message || 'QR code image upload failed. Ensure JPG/PNG/WebP under 5MB.');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.upi_id.trim() || !formData.club_name.trim()) {
      setError('Official Club Name and UPI ID are strictly required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await adminApi.updateDonation(formData);
      setSuccessMsg('Official donation configuration and UPI credentials updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to update donation settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" color="saffron" />
        <p className="text-xs text-slate-500 font-medium">Loading donation configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Donation & UPI QR Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure the official club UPI identifier, QR image, and suggested contribution amounts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDonationSettings}
          className="text-slate-600 hover:text-slate-900 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          <span>Reload</span>
        </Button>
      </div>

      {/* Critical Warning Alert */}
      <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start space-x-3.5 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-amber-900 uppercase tracking-wide">
            Mandatory Verification Required
          </p>
          <p className="leading-relaxed">
            Please double-check and verify all donation information before publishing. Ensure the
            UPI ID and QR code belong exclusively to the official Mahaveer Youth Club bank account.
            No payment gateways or intermediary webhooks are used.
          </p>
        </div>
      </div>

      {successMsg && (
        <Alert variant="success">
          {successMsg}
        </Alert>
      )}

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Official UPI QR Credentials</h2>
        </div>

        {/* Club Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Beneficiary Account Name *
          </label>
          <input
            type="text"
            required
            value={formData.club_name}
            onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
            placeholder="Mahaveer Youth Club"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* UPI ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Official Club UPI Identifier (VPA) *
          </label>
          <input
            type="text"
            required
            value={formData.upi_id}
            onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
            placeholder="mahaveeryouthclub@upi"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Devotees can copy this UPI address directly into PhonePe, Google Pay, Paytm, or BHIM.
          </p>
        </div>

        {/* QR Code Upload / Preview */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Official UPI QR Code Image
          </label>
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-28 h-28 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0">
              {formData.qr_image_url ? (
                <img
                  src={formData.qr_image_url}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-12 h-12 text-slate-300" />
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-800">
                {formData.qr_image_url
                  ? 'Custom QR Code Active'
                  : 'Default auto-generated QR is active'}
              </p>
              <p className="text-[11px] text-slate-500">
                Upload your official bank-provided UPI QR image (PNG, JPG, WebP up to 5MB).
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                <label className="cursor-pointer px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingQr ? 'Uploading...' : 'Upload QR Image'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleQrUpload}
                    className="hidden"
                    disabled={uploadingQr}
                  />
                </label>
                {formData.qr_image_url && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, qr_image_url: '' })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Amounts */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Suggested Contribution Amounts (Comma-separated)
          </label>
          <input
            type="text"
            value={formData.suggested_amounts}
            onChange={(e) => setFormData({ ...formData, suggested_amounts: e.target.value })}
            placeholder="101,501,1001,2001,5001"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            These preset amounts appear as clickable quick-select pills on the Donate page.
          </p>
        </div>

        {/* Description / Mission Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Transparency & Purpose Note
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Explaining how contributions support Maha Bhog, pandal construction, and blood camps..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>Update Donation Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
