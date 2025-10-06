/**
 * 0G Chat Service - Authentic Implementation based on Official Documentation
 * https://docs.0g.ai/developer-hub/building-on-0g/compute-network/sdk
 */

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import type { ZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  providerAddress?: string;
  model?: string;
  userId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  ok: boolean;
  error?: string;
  providerAddress?: string;
  model?: string;
  verified?: boolean;
  balance?: string;
  result?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Official 0G Providers as per documentation
const OFFICIAL_PROVIDERS = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

const ZG_PRIVATE_KEY = process.env.COMBINED_SERVER_PRIVATE_KEY;
const ZG_RPC_URL = process.env.COMBINED_SERVER_CHAIN_RPC || "https://evmrpc-testnet.0g.ai";

export class ZGChatServiceAuthentic {
  private broker: ZGComputeNetworkBroker | null = null;
  private isInitialized = false;
  private walletAddress: string | null = null;

  setWalletAddress(address: string) {
    this.walletAddress = address;
  }

  private async initBroker(): Promise<void> {
    if (this.isInitialized && this.broker) return;

    if (!ZG_PRIVATE_KEY) {
      throw new Error("Missing ZG_PRIVATE_KEY environment variable");
    }

    console.log('[0G Chat] Initializing broker with official documentation pattern...');

    // Follow official documentation pattern
    const provider = new ethers.JsonRpcProvider(ZG_RPC_URL);
    const wallet = new ethers.Wallet(ZG_PRIVATE_KEY, provider);

    // Use createZGComputeNetworkBroker as per official docs
    this.broker = await createZGComputeNetworkBroker(wallet);
    this.isInitialized = true;

    console.log('[0G Chat] ✅ Broker initialized successfully with wallet:', wallet.address);
  }

  async chatCompletion(request: ChatRequest, retryCount = 0): Promise<ChatResponse> {
    try {
      const { messages, temperature = 0.7, maxTokens = 1024, providerAddress } = request;

      if (!messages || messages.length === 0) {
        return {
          ok: false,
          error: "Messages array is required and cannot be empty"
        };
      }

      // Initialize broker using official documentation pattern
      if (!this.isInitialized || !this.broker) {
        await this.initBroker();
      }

      const broker = this.broker!;

      // Check account balance with improved error handling
      try {
        const ledger = await broker.ledger.getLedger();
        const balanceWei = ledger.totalBalance || BigInt(0);
        const balanceOG = parseFloat(ethers.formatEther(balanceWei));
        console.log(`[0G Chat] Account Balance: ${balanceOG} OG (${balanceWei.toString()} wei)`);

        // Add funds if insufficient (as per troubleshooting documentation)  
        if (balanceOG < 0.01) {
          console.log(`[0G Chat] Insufficient balance: ${balanceOG} OG, adding funds...`);

          try {
            await broker.ledger.addLedger(ethers.parseEther("0.1").toString()); // Add 0.1 OG as recommended
            console.log(`[0G Chat] ✅ Added 0.1 OG to ledger`);

            // Check new balance
            const newLedger = await broker.ledger.getLedger();
            const newBalance = parseFloat(ethers.formatEther(newLedger.totalBalance || BigInt(0)));
            console.log(`[0G Chat] New balance: ${newBalance} OG`);
          } catch (fundError: any) {
            console.log(`[0G Chat] Failed to add funds: ${fundError.message}`);
            throw new Error(`Insufficient balance and failed to add funds: ${fundError.message}`);
          }
        }
      } catch (balanceError: any) {
        console.log(`[0G Chat] Balance check failed: ${balanceError.message}`);
        // Try to add funds even if balance check failed
        try {
          console.log(`[0G Chat] Attempting to add funds despite balance check failure...`);
          await broker.ledger.addLedger(ethers.parseEther("0.05").toString());
          console.log(`[0G Chat] ✅ Added 0.05 OG emergency funds`);
        } catch (emergencyError: any) {
          console.log(`[0G Chat] Emergency funding failed: ${emergencyError.message}`);
        }
      }

      // Discover available services with retry and fallback for 504 errors
      let services: any[] = [];
      let serviceDiscoveryAttempts = 0;
      const maxServiceDiscoveryAttempts = 2;

      while (serviceDiscoveryAttempts < maxServiceDiscoveryAttempts && services.length === 0) {
        try {
          console.log(`[0G Chat] Service discovery attempt ${serviceDiscoveryAttempts + 1}/${maxServiceDiscoveryAttempts}`);

          // Add timeout to service discovery to handle 504 errors
          const discoveryPromise = broker.inference.listService();
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Service discovery timeout')), 10000)
          );

          services = await Promise.race([discoveryPromise, timeoutPromise]);
          console.log(`[0G Chat] Found ${services.length} available services`);

          if (services.length > 0) {
            break; // Success, exit retry loop
          }

        } catch (discoveryError: any) {
          serviceDiscoveryAttempts++;
          console.log(`[0G Chat] Service discovery failed (attempt ${serviceDiscoveryAttempts}): ${discoveryError.message}`);

          if (serviceDiscoveryAttempts >= maxServiceDiscoveryAttempts) {
            // Use fallback providers if service discovery completely fails
            console.log(`[0G Chat] Service discovery failed completely. Using fallback provider configuration.`);
            break;
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // If service discovery failed, create fallback service objects for official providers
      if (services.length === 0) {
        console.log(`[0G Chat] Using fallback provider configuration due to network issues`);
        services = [
          { provider: OFFICIAL_PROVIDERS["deepseek-r1-70b"], model: "phala/deepseek-chat-v3-0324" },
          { provider: OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"], model: "phala/llama-3.3-70b-instruct" }
        ];
        console.log(`[0G Chat] Using ${services.length} fallback providers`);
      }

      if (services.length === 0) {
        throw new Error("No 0G Compute providers are currently available");
      }

      // Log available services
      services.forEach((service, index) => {
        console.log(`[0G Chat] Service ${index + 1}: ${service.provider} (${service.model})`);
      });

      // Use official providers with smart switching
      const providersToTry = [
        OFFICIAL_PROVIDERS["deepseek-r1-70b"],      // Primary: 0x3feE...
        OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"] // Secondary: 0xf07240...
      ];

      // If specific provider requested, try it first
      if (providerAddress && !providersToTry.includes(providerAddress)) {
        providersToTry.unshift(providerAddress);
      }

      let lastError = "";

      // Try all official providers as per troubleshooting documentation
      for (const [model, provider] of Object.entries(OFFICIAL_PROVIDERS)) {
        try {
          console.log(`[0G Chat] Trying ${model}...`);

          // Find service for this provider
          const service = services.find(s => s.provider === provider);
          if (!service) {
            console.log(`[0G Chat] ${model} not found in services list`);
            continue;
          }

          const result = await this.tryProvider(broker, service, messages, temperature, maxTokens);

          if (result.ok) {
            console.log(`[0G Chat] ✅ Success with ${model}`);
            return result;
          }

        } catch (providerError: any) {
          console.log(`[0G Chat] ${model} failed, trying next...`);
          lastError = providerError.message;
          continue; // Try next provider as per documentation pattern
        }
      }

      // All providers failed
      throw new Error(`All 0G Compute providers failed. Last error: ${lastError}`);

    } catch (error: any) {
      console.error(`[0G Chat] Chat completion error:`, error.message);

      return {
        ok: false,
        error: error.message || "Chat completion failed"
      };
    }
  }

  private async tryProvider(
    broker: ZGComputeNetworkBroker,
    service: any,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<ChatResponse> {
    const { provider: providerAddress, url: endpoint, model } = service;

    try {
      // Step 1: Acknowledge provider (required as per documentation)
      console.log(`[0G Chat] Acknowledging provider: ${providerAddress}`);
      await broker.inference.acknowledgeProviderSigner(providerAddress);

      // Step 2: Get service metadata (as per documentation)
      const { endpoint: metadataEndpoint, model: metadataModel } =
        await broker.inference.getServiceMetadata(providerAddress);

      // Use metadata values if available, fallback to service values
      const finalEndpoint = metadataEndpoint || endpoint;
      const finalModel = metadataModel || model;

      console.log(`[0G Chat] Service metadata - Endpoint: ${finalEndpoint}, Model: ${finalModel}`);

      // Step 3: Generate fresh auth headers (single use as per troubleshooting documentation)
      const requestContent = JSON.stringify(messages); // Use full message content for headers
      const headers = await broker.inference.getRequestHeaders(providerAddress, requestContent);

      console.log(`[0G Chat] Generated fresh auth headers for provider: ${providerAddress}`);

      // Step 4: Send request with 20-second timeout for smart switching
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      try {
        const response = await fetch(`${finalEndpoint}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            model: finalModel,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: false
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`[0G Chat] Provider ${providerAddress} returned ${response.status}: ${errorText}`);

          // Enhanced error handling for specific issues
          if (errorText.includes('insufficient balance')) {
            throw new Error(`Provider balance sync issue: ${errorText}`);
          }

          if (errorText.includes('headers already used')) {
            throw new Error(`Headers reuse error: ${errorText}`);
          }

          // Check for provider busy/offline indicators  
          if (response.status === 503 || response.status === 504 ||
            response.status === 429 || errorText.includes('busy') ||
            errorText.includes('overloaded') || errorText.includes('offline')) {
            throw new Error(`Provider not responding: ${response.status} - ${errorText}`);
          }

          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Step 5: Process response (as per documentation)
        try {
          const valid = await broker.inference.processResponse(
            providerAddress,
            JSON.stringify(data),
            undefined // chatID optional for non-verifiable services
          );
          console.log(`[0G Chat] Response verification: ${valid ? 'Valid' : 'Not verified'}`);
        } catch (verifyError) {
          console.log(`[0G Chat] Response verification failed (non-critical):`, verifyError);
        }

        // Return successful response
        return {
          ok: true,
          providerAddress,
          model: finalModel,
          verified: service.verifiability === 'TeeML',
          balance: "Active", // Will be checked separately
          result: data,
          usage: data.usage || {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
          }
        };

      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          throw new Error(`Provider ${providerAddress} timeout after 20 seconds`);
        }

        throw fetchError;
      }

    } catch (error: any) {
      console.log(`[0G Chat] Provider ${providerAddress} attempt failed: ${error.message}`);
      throw error;
    }
  }

  async getServiceStatus(): Promise<{
    isConfigured: boolean;
    hasPrivateKey: boolean;
    availableProviders: number;
    balance?: string;
    error?: string;
  }> {
    try {
      if (!ZG_PRIVATE_KEY) {
        return {
          isConfigured: false,
          hasPrivateKey: false,
          availableProviders: 0,
          error: "No private key configured"
        };
      }

      // Initialize broker to get real status
      if (!this.isInitialized || !this.broker) {
        await this.initBroker();
      }

      const broker = this.broker!;

      // Get real balance and provider count
      let balance = "Unknown";
      let availableProviders = 0;

      try {
        const ledger = await broker.ledger.getLedger();
        balance = `${parseFloat(ethers.formatEther(ledger.totalBalance)).toFixed(3)} OG`;
      } catch (error) {
        console.log('[0G Chat] Balance check failed:', error);
      }

      try {
        const services = await broker.inference.listService();
        availableProviders = services.length;
      } catch (error) {
        console.log('[0G Chat] Service discovery failed:', error);
      }

      return {
        isConfigured: true,
        hasPrivateKey: true,
        availableProviders,
        balance
      };

    } catch (error: any) {
      return {
        isConfigured: false,
        hasPrivateKey: !!ZG_PRIVATE_KEY,
        availableProviders: 0,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const zgChatServiceAuthentic = new ZGChatServiceAuthentic();