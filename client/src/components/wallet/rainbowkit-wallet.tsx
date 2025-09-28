import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function RainbowKitWallet() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation untuk sync wallet connection dengan backend
  const syncWalletConnection = useMutation({
    mutationFn: async (connectionData: { 
      address: string; 
      chainId: number; 
      network: string; 
    }) => {
      const response = await fetch('/api/web3/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData),
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries terkait wallet dan user
      queryClient.invalidateQueries({ queryKey: ['/api/web3/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/web3/status'] });
      
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to 0G Chain Galileo testnet",
      });
    },
    onError: (error: any) => {
      console.error('Failed to sync wallet connection:', error);
      toast({
        title: "Connection Error",
        description: "Failed to sync wallet with backend",
        variant: "destructive",
      });
    },
  });

  // Mutation untuk disconnect wallet dari backend
  const syncWalletDisconnection = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/web3/disconnect', {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries terkait wallet dan user
      queryClient.invalidateQueries({ queryKey: ['/api/web3/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/web3/status'] });
      
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from DeSocialAI",
      });
    },
  });

  // Sync wallet status dengan backend ketika koneksi berubah
  useEffect(() => {
    if (isConnected && address && chain) {
      console.log('🔗 RainbowKit wallet connected:', { address, chainId: chain.id, network: chain.name });
      
      // Sync dengan backend
      syncWalletConnection.mutate({
        address,
        chainId: chain.id,
        network: chain.name,
      });
    } else if (!isConnected) {
      console.log('🔌 RainbowKit wallet disconnected');
      
      // Sync disconnection dengan backend
      syncWalletDisconnection.mutate();
    }
  }, [isConnected, address, chain?.id]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Tidak render apa-apa jika belum mounted (untuk SSR)
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="cyber-button flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                      <polyline points="16,2 22,8 15,15 11,11 16,2"></polyline>
                    </svg>
                    <span>Connect Wallet</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-300 border border-red-400/30 rounded-2xl hover:border-red-400 transition-all duration-300"
                  >
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Wrong network</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3 px-4 py-2 cyber-glass dark:cyber-glass-dark rounded-2xl neon-border-cyan">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
                    <span className="text-sm font-semibold text-cyan-100">
                      {account.displayName}
                    </span>
                    <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 rounded px-2 py-1">
                      {chain.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="px-3 py-2 cyber-glass dark:cyber-glass-dark text-cyan-300 hover:text-cyan-100 border border-cyan-400/30 hover:border-cyan-400 transition-all duration-300 rounded text-sm"
                    >
                      Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        disconnect();
                      }}
                      type="button"
                      className="px-4 py-2 cyber-glass dark:cyber-glass-dark text-red-300 hover:text-red-100 border border-red-400/30 hover:border-red-400 transition-all duration-300 rounded text-sm"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}