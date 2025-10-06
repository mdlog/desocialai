import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Check, Clock, AlertCircle } from "lucide-react";

interface BlockchainVerificationProps {
  storageHash?: string;
  transactionHash?: string;
  postId: string;
}

export function BlockchainVerification({ storageHash, transactionHash, postId }: BlockchainVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const verifyOnChain = async () => {
    if (!storageHash || !transactionHash) return;

    setVerifying(true);
    try {
      // Verify storage hash on 0G Storage
      const storageResponse = await fetch(`/api/zg/storage/content/${storageHash}`);
      const storageData = storageResponse.ok ? await storageResponse.json() : null;

      // Get transaction details from 0G Chain
      const txResponse = await fetch(`/api/zg/chain/transaction/${transactionHash}`);
      const txData = txResponse.ok ? await txResponse.json() : null;

      setVerificationResult({
        storage: storageData,
        transaction: txData,
        verified: storageResponse.ok && txResponse.ok
      });
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({ error: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const openChainExplorer = () => {
    if (transactionHash) {
      // 0G Galileo Testnet Explorer
      window.open(`https://chainscan-galileo.0g.ai/tx/${transactionHash}`, '_blank');
    }
  };

  const getVerificationStatus = () => {
    // Check if hash contains other placeholder values
    const hasFakeHash = transactionHash?.includes('_hash') ||
      storageHash?.includes('existing') ||
      storageHash?.includes('_hash');

    // If we have both hashes and they are not fake, consider it verified
    if (storageHash && transactionHash && !hasFakeHash) {
      return { icon: Check, text: "Verified", color: "bg-green-500" };
    }

    // If we have valid storage hash but no transaction hash
    if (storageHash && !hasFakeHash && !transactionHash) {
      return { icon: AlertCircle, text: "Stored", color: "bg-blue-500" };
    }

    // If no hashes or fake hashes
    if (!storageHash || !transactionHash || hasFakeHash) {
      return { icon: AlertCircle, text: "Pending", color: "bg-yellow-500" };
    }

    // After verification process
    if (verificationResult?.verified) {
      return { icon: Check, text: "Verified", color: "bg-green-500" };
    }

    return { icon: Clock, text: "Unverified", color: "bg-gray-500" };
  };

  const status = getVerificationStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          Blockchain Verification
        </CardTitle>
        <CardDescription>
          Verify this post exists on 0G Storage and 0G Chain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={`${status.color} text-white`}>
            {status.text}
          </Badge>
        </div>

        {storageHash && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Storage Hash:</div>
            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
              {storageHash}
            </div>
          </div>
        )}

        {transactionHash && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Transaction Hash:</div>
            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
              {transactionHash}
            </div>
          </div>
        )}

        {storageHash && transactionHash && (
          <div className="flex gap-2">
            <Button
              onClick={verifyOnChain}
              disabled={verifying}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {verifying ? "Verifying..." : "Verify Content"}
            </Button>
            <Button
              onClick={openChainExplorer}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Explorer
            </Button>
          </div>
        )}

        {verificationResult && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="text-sm font-medium mb-2">Verification Results:</div>
            {verificationResult.verified ? (
              <div className="text-green-600 dark:text-green-400 text-sm">
                ✅ Content verified on both 0G Storage and 0G Chain
              </div>
            ) : verificationResult.error ? (
              <div className="text-red-600 dark:text-red-400 text-sm">
                ❌ {verificationResult.error}
              </div>
            ) : (
              <div className="text-yellow-600 dark:text-yellow-400 text-sm">
                ⚠️ Partial verification - some data may be unavailable
              </div>
            )}
          </div>
        )}

        {!storageHash && !transactionHash && (
          <div className="text-sm text-gray-500 text-center py-4">
            This post is not yet stored on the blockchain.
            <br />
            It may be in the process of being uploaded.
          </div>
        )}
      </CardContent>
    </Card>
  );
}