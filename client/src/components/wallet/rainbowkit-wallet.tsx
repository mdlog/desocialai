import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function RainbowKitWallet() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isDisconnecting = useRef(false);
  const previousConnectedState = useRef(isConnected);

  // Mutation untuk sync wallet connection dengan backend
  const syncWalletConnection = useMutation({
    mutationFn: async (connectionData: {
      address: string;
      chainId: number;
      network: string;
    }) => {
      console.log('🔗 Syncing wallet connection:', connectionData);
      console.log('🔗 Fetch URL:', window.location.origin + '/api/web3/connect');

      try {
        const response = await fetch('/api/web3/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(connectionData),
          credentials: 'include', // Important for session cookies
        });

        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('❌ Server error:', errorData);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Wallet sync response:', data);
        return data;
      } catch (error: any) {
        console.error('❌ Fetch error:', error);

        // Check if it's a network error
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
          throw new Error('Cannot connect to server. Please make sure the server is running on port 5000.');
        }

        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log('✅ Wallet connected successfully:', data);

      // Remove cache to force fresh fetch
      queryClient.removeQueries({ queryKey: ['/api/web3/wallet'] });
      queryClient.removeQueries({ queryKey: ['/api/users/me'] });
      
      // Invalidate queries terkait wallet dan user
      queryClient.invalidateQueries({ queryKey: ['/api/web3/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/web3/status'] });

      // Dispatch event immediately - sidebar will handle retry logic
      console.log('📢 Dispatching walletConnected event...');
      window.dispatchEvent(new CustomEvent('walletConnected'));

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to 0G Chain Mainnet",
      });
    },
    onError: (error: any) => {
      console.error('❌ Failed to sync wallet connection:', error);

      let errorMessage = error.message || "Failed to sync wallet with backend";
      let errorTitle = "Connection Error";

      // Provide more specific error messages
      if (error.message?.includes('Cannot connect to server')) {
        errorTitle = "Server Not Running";
        errorMessage = "Please start the development server with 'npm run dev'";
      } else if (error.message?.includes('Network request failed')) {
        errorTitle = "Network Error";
        errorMessage = "Please check your internet connection and try again";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
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
    // Handle connection
    if (isConnected && address && chain) {
      console.log('🔗 RainbowKit wallet connected:', { address, chainId: chain.id, network: chain.name });
      isDisconnecting.current = false; // Reset flag on connect
      previousConnectedState.current = true;

      // Sync dengan backend
      syncWalletConnection.mutate({
        address,
        chainId: chain.id,
        network: chain.name,
      });
    }
    // Handle disconnection - only if transitioning from connected to disconnected
    else if (!isConnected && previousConnectedState.current && !isDisconnecting.current) {
      console.log('🔌 RainbowKit wallet disconnected - performing complete logout');

      // Set flag to prevent multiple executions
      isDisconnecting.current = true;
      previousConnectedState.current = false;

      // Perform logout asynchronously
      (async () => {
        try {
          // 1. Dispatch disconnect event immediately for UI update
          console.log('[DISCONNECT] Dispatching walletDisconnected event...');
          window.dispatchEvent(new CustomEvent('walletDisconnected'));

          // 2. Clear backend session and wait for response
          console.log('[DISCONNECT] Clearing backend session...');
          await fetch('/api/web3/disconnect', {
            method: 'POST',
            credentials: 'include',
          });
          console.log('[DISCONNECT] Backend session cleared');

          // 3. Clear all React Query cache
          console.log('[DISCONNECT] Clearing React Query cache...');
          queryClient.clear();

          // 4. Show toast
          toast({
            title: "Disconnected",
            description: "You have been logged out successfully",
          });

          // 5. Wait a bit then reload
          await new Promise(resolve => setTimeout(resolve, 300));

          // 6. Reload page to reset all state
          console.log('[DISCONNECT] Reloading page...');
          window.location.href = '/';
        } catch (error) {
          console.error('[DISCONNECT] Error during logout:', error);
          // Still reload even if there's an error
          window.location.href = '/';
        }
      })();
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
                        console.log('🔌 Manual disconnect button clicked');

                        // Set flag to let useEffect handle the logout
                        isDisconnecting.current = true;

                        // Just disconnect - useEffect will handle the rest
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