import "express-session";

interface AIFeedStatus {
  deployed: boolean;
  status: string;
  mode: string;
}

declare module "express-session" {
  interface SessionData {
    walletConnection?: {
      connected: boolean;
      address: string | null;
      balance: string | null;
      network: string | null;
      chainId: string | null;
    };
    aiFeed?: AIFeedStatus;
  }
}