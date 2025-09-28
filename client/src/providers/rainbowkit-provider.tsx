import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { wagmiConfig } from '../lib/rainbowkit-config';
import { useTheme } from '../hooks/use-theme';

interface RainbowKitProviderWrapperProps {
  children: React.ReactNode;
}

export function RainbowKitProviderWrapper({ children }: RainbowKitProviderWrapperProps) {
  const { theme } = useTheme();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={theme === 'dark' ? darkTheme() : lightTheme()}
          appInfo={{
            appName: 'DeSocialAI',
            disclaimer: ({ Text, Link }) => (
              <Text>
                Decentralized social media platform powered by{' '}
                <Link href="https://0g.ai">0G Chain infrastructure</Link>
              </Text>
            ),
          }}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}