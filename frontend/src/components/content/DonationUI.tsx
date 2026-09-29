import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

export interface DonationUIProps {
  clubName?: string;
  upiId?: string;
  onPaymentSubmitted?: (details: { amount: number | string; utr: string }) => void;
}

export const DonationUI: React.FC<DonationUIProps> = ({
  clubName = 'Mahaveer Youth Club',
  upiId = 'clubname@upi',
  onPaymentSubmitted,
}) => {
  const presetAmounts = [101, 501, 1001, 2001];
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(501);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = selectedAmount === 'custom' ? customAmount : selectedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || Number(finalAmount) <= 0) {
      setError('Please select or enter a valid donation amount.');
      return;
    }
    if (!utrNumber.trim()) {
      setError('Please enter the 12-digit UPI Transaction / UTR reference number.');
      return;
    }

    setError(null);
    setIsSubmitted(true);
    if (onPaymentSubmitted) {
      onPaymentSubmitted({ amount: finalAmount, utr: utrNumber });
    }
  };

  return (
    <div className="max-w-xl mx-auto text-left">
      <Card className="p-6 sm:p-8 shadow-warm-lg border-2 border-[#E9DED1]">
        {/* Header Badge & Title */}
        <div className="text-center mb-6">
          <span className="text-3xl mb-2 inline-block">❤️</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#241A17] tracking-tight">
            SUPPORT OUR CLUB
          </h3>
          <p className="text-xs sm:text-sm text-[#6B625D] mt-1.5 max-w-md mx-auto leading-relaxed">
            Your contribution helps us continue our Puja rituals, cultural celebrations, and community social welfare activities.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-[#DCFCE7] text-[#15803D] rounded-full flex items-center justify-center text-2xl mx-auto border-2 border-[#86EFAC]">
              ✓
            </div>
            <h4 className="text-lg font-bold text-[#241A17]">Thank You! 🙏</h4>
            <p className="text-sm text-[#6B625D] max-w-sm mx-auto">
              Your donation verification details for <strong className="text-[#241A17]">₹{finalAmount}</strong> (Ref: {utrNumber}) have been recorded for Phase 3 receipt generation.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsSubmitted(false);
                setUtrNumber('');
              }}
            >
              Submit Another Contribution
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="error" title="Action Required">
                {error}
              </Alert>
            )}

            {/* Step 1: Select Amount */}
            <div>
              <label className="block text-xs font-bold text-[#241A17] uppercase tracking-wider mb-2.5">
                1. Select Contribution Amount (INR ₹)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setError(null);
                    }}
                    className={`py-2 px-3 rounded-md text-xs sm:text-sm font-bold border transition-all ${
                      selectedAmount === amt
                        ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm scale-[1.02]'
                        : 'bg-[#FFF8EE] text-[#241A17] border-[#E9DED1] hover:border-[#D1C0AF]'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAmount('custom');
                    setError(null);
                  }}
                  className={`py-2 px-3 rounded-md text-xs sm:text-sm font-bold border transition-all ${
                    selectedAmount === 'custom'
                      ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm scale-[1.02]'
                      : 'bg-[#FFF8EE] text-[#241A17] border-[#E9DED1] hover:border-[#D1C0AF]'
                  }`}
                >
                  Custom
                </button>
              </div>

              {selectedAmount === 'custom' && (
                <div className="mt-3">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter custom amount (e.g. 5100)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    leftIcon={<span className="text-xs font-bold">₹</span>}
                    required
                  />
                </div>
              )}
            </div>

            {/* Step 2: UPI QR Placeholder Card */}
            <div className="bg-[#FFF8EE] p-5 rounded-lg border border-[#E9DED1] flex flex-col items-center text-center">
              <span className="text-xs font-bold text-[#8B1E1E] uppercase tracking-wider mb-2">
                2. Scan using any UPI App
              </span>

              {/* Simulated QR Box */}
              <div className="w-44 h-44 bg-white rounded-lg border-2 border-dashed border-[#D4A017] p-3 flex flex-col items-center justify-center shadow-xs my-2">
                <div className="w-full h-full bg-[#FBF4EA] rounded flex flex-col items-center justify-center p-2 text-center border border-[#E9DED1]">
                  <span className="text-4xl mb-1">📱</span>
                  <span className="text-[11px] font-bold text-[#8B1E1E]">OFFICIAL CLUB QR</span>
                  <span className="text-[10px] text-[#6B625D] mt-0.5">Amount: ₹{finalAmount || 0}</span>
                </div>
              </div>

              <div className="mt-2 space-y-0.5">
                <p className="text-xs font-extrabold text-[#241A17]">{clubName}</p>
                <p className="text-xs font-mono font-semibold text-[#8B1E1E] bg-white px-2.5 py-0.5 rounded border border-[#E9DED1] inline-block">
                  {upiId}
                </p>
                <p className="text-[11px] text-[#6B625D] pt-1">
                  Supported apps: GPay • PhonePe • Paytm • BHIM UPI
                </p>
              </div>
            </div>

            {/* Step 3: Transaction ID Entry */}
            <div>
              <label className="block text-xs font-bold text-[#241A17] uppercase tracking-wider mb-1.5">
                3. Enter Transaction / Reference ID
              </label>
              <Input
                placeholder="12-digit UTR / UPI Reference No."
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                helperText="Enter the 12-digit reference number from your payment app receipt"
                required
              />
            </div>

            {/* Submit CTA */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              className="font-bold shadow-festive"
            >
              I Have Completed Payment →
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
