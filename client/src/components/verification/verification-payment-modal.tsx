import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, CreditCard, CheckCircle, ExternalLink, Copy } from 'lucide-react';

interface VerificationPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
}

interface VerificationFeeInfo {
  fee: string;
  recipient: string;
  currency: string;
}

interface VerificationResult {
  success: boolean;
  verified: boolean;
  message?: string;
  verificationId?: string;
  transactionHash?: string;
}

export function VerificationPaymentModal({
  isOpen,
  onClose,
  onVerificationComplete
}: VerificationPaymentModalProps) {
  const [step, setStep] = useState<'info' | 'payment' | 'verification' | 'success'>('info');
  const [transactionHash, setTransactionHash] = useState('');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get verification fee info
  const { data: feeInfo, isLoading: loadingFee } = useQuery({
    queryKey: ['/api/users/verification-fee'],
    enabled: isOpen,
  });

  // Process verification payment
  const verificationMutation = useMutation({
    mutationFn: async ({ transactionHash, amount }: { transactionHash: string; amount: string }) => {
      const response = await apiRequest('/api/users/verify-payment', {
        method: 'POST',
        body: { transactionHash, amount }
      });
      return response as VerificationResult;
    },
    onSuccess: (result) => {
      if (result.success && result.verified) {
        setStep('success');
        toast({
          title: "✅ Verification Successful!",
          description: "You now have unlimited character posting privileges.",
        });
        // Invalidate user data to refresh verification status
        queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
        onVerificationComplete();
      } else {
        toast({
          title: "❌ Verification Failed",
          description: result.message || "Payment verification failed. Please check your transaction details.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "❌ Verification Error",
        description: error.message || "Failed to process verification payment.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step === 'info') {
      setStep('payment');
    } else if (step === 'payment' && feeInfo) {
      setAmount(feeInfo.fee);
      setStep('verification');
    }
  };

  const handleVerifyPayment = () => {
    if (!transactionHash.trim()) {
      toast({
        title: "Missing Transaction Hash",
        description: "Please enter your transaction hash.",
        variant: "destructive",
      });
      return;
    }

    if (!amount.trim()) {
      toast({
        title: "Missing Amount",
        description: "Please enter the payment amount.",
        variant: "destructive",
      });
      return;
    }

    verificationMutation.mutate({ transactionHash: transactionHash.trim(), amount: amount.trim() });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard.",
    });
  };

  const handleClose = () => {
    setStep('info');
    setTransactionHash('');
    setAmount('');
    onClose();
  };

  if (loadingFee) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-600" />
            Premium Verification
          </DialogTitle>
        </DialogHeader>

        {step === 'info' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Unlimited Character Posting</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Unlock unlimited character posting by getting verified with 0G Chain payment.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">What you get:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Unlimited character posting (no 280 limit)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Verified badge on your profile
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Enhanced posting capabilities
                </li>
              </ul>
            </div>

            {feeInfo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {feeInfo.fee} {feeInfo.currency}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    One-time verification fee
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleNext} 
              className="w-full"
              data-testid="button-continue-verification"
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 'payment' && feeInfo && (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Make Payment</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Send {feeInfo.fee} {feeInfo.currency} to the address below
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Label className="text-sm font-semibold">Payment Details:</Label>
              <div className="mt-2 space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Amount:</div>
                  <div className="font-semibold text-lg text-blue-600">
                    {feeInfo.fee} {feeInfo.currency}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Recipient Address:</div>
                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border text-sm font-mono">
                    <span className="flex-1 break-all">{feeInfo.recipient}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(feeInfo.recipient)}
                      data-testid="button-copy-address"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('info')}
                className="flex-1"
                data-testid="button-back"
              >
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                className="flex-1"
                data-testid="button-payment-sent"
              >
                Payment Sent
              </Button>
            </div>
          </div>
        )}

        {step === 'verification' && feeInfo && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verify Payment</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your transaction details to complete verification
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="txHash">Transaction Hash</Label>
                <Input
                  id="txHash"
                  placeholder="0x..."
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  className="font-mono text-sm"
                  data-testid="input-transaction-hash"
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount ({feeInfo.currency})</Label>
                <Input
                  id="amount"
                  placeholder={feeInfo.fee}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-amount"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('payment')}
                className="flex-1"
                data-testid="button-back-payment"
              >
                Back
              </Button>
              <Button 
                onClick={handleVerifyPayment}
                disabled={verificationMutation.isPending}
                className="flex-1"
                data-testid="button-verify-payment"
              >
                {verificationMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  'Verify Payment'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 text-center">
            <div>
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-green-600 mb-2">Verification Complete!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You now have unlimited character posting privileges. Your verified status is active.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">∞ VERIFIED</span>
              </div>
            </div>

            <Button 
              onClick={handleClose} 
              className="w-full"
              data-testid="button-done"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}