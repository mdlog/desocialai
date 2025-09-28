/**
 * 0G Data Availability Client Service
 * Real implementation using gRPC client connection to DA Client Node
 * Based on official 0G DA documentation
 */

import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";

export interface DASubmitResponse {
  success: boolean;
  blobId?: string;
  commitment?: string;
  error?: string;
  retryable?: boolean;
}

export interface DARetrieveResponse {
  success: boolean;
  data?: string;
  error?: string;
}

class ZGDAClientService {
  private client: any = null;
  private isConnected: boolean = false;
  private readonly grpcEndpoint: string;
  
  constructor() {
    // Default to production gRPC server as per official documentation
    this.grpcEndpoint = process.env.ZG_DA_GRPC_ENDPOINT || '34.111.179.208:51001';
    this.initializeClient();
  }

  /**
   * Initialize gRPC client connection to DA Client Node
   */
  private async initializeClient() {
    try {
      const PROTO_PATH = path.join(process.cwd(), 'server/proto/da.proto');
      
      const packageDef = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });
      
      const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
      const daService = grpcObj.da.DataAvailabilityService;

      this.client = new daService(
        this.grpcEndpoint,
        grpc.credentials.createInsecure()
      );

      // Test connection with a simple ping
      await this.testConnection();
      
      console.log(`[0G DA Client] ✅ Connected to DA Client Node at ${this.grpcEndpoint}`);
      this.isConnected = true;

    } catch (error) {
      console.warn(`[0G DA Client] ⚠️ Failed to connect to DA Client Node:`, error);
      this.isConnected = false;
    }
  }

  /**
   * Test gRPC connection to DA Client Node
   */
  private async testConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject(new Error('gRPC client not initialized'));
      }

      // Test with a small data blob
      const testData = Buffer.from("connection-test", "utf-8");
      
      this.client.SubmitBlob({ data: testData }, (err: any, response: any) => {
        if (err) {
          // Connection failed
          reject(err);
        } else {
          // Connection successful
          resolve();
        }
      });
    });
  }

  /**
   * Submit data blob to 0G DA network
   */
  async submitBlob(data: string | Buffer): Promise<DASubmitResponse> {
    try {
      if (!this.isConnected || !this.client) {
        // Try to reconnect
        await this.initializeClient();
        
        if (!this.isConnected) {
          return {
            success: false,
            error: `0G DA Client Node tidak terhubung pada ${this.grpcEndpoint}. 

Pastikan DA Client Node Docker sedang berjalan:

1. Siapkan file .env dengan konfigurasi:
   COMBINED_SERVER_CHAIN_RPC=https://0g-galileo-testnet.drpc.org/
   COMBINED_SERVER_PRIVATE_KEY=YOUR_PRIVATE_KEY
   ENTRANCE_CONTRACT_ADDR=0xE75A073dA5bb7b0eC622170Fd268f35E675a957B
   GRPC_SERVER_PORT=51001

2. Jalankan DA Client:
   docker run --env-file .env -p 51001:51001 0g-da-client

3. Pastikan port 51001 terbuka dan dapat diakses`,
            retryable: true
          };
        }
      }

      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf-8");

      return new Promise((resolve) => {
        this.client.SubmitBlob({ data: dataBuffer }, (err: any, response: any) => {
          if (err) {
            console.error('[0G DA Client] Submit error:', err);
            resolve({
              success: false,
              error: `Gagal mengirim data ke 0G DA: ${err.message}`,
              retryable: true
            });
          } else {
            console.log(`[0G DA Client] ✅ Blob submitted successfully - ID: ${response.blobId}`);
            resolve({
              success: true,
              blobId: response.blobId,
              commitment: response.commitment
            });
          }
        });
      });

    } catch (error: any) {
      console.error('[0G DA Client] Submit blob error:', error);
      return {
        success: false,
        error: `Error submitting to 0G DA: ${error.message}`,
        retryable: false
      };
    }
  }

  /**
   * Retrieve data blob from 0G DA network
   */
  async retrieveBlob(blobId: string): Promise<DARetrieveResponse> {
    try {
      if (!this.isConnected || !this.client) {
        await this.initializeClient();
        
        if (!this.isConnected) {
          return {
            success: false,
            error: 'DA Client Node not connected'
          };
        }
      }

      return new Promise((resolve) => {
        this.client.GetBlob({ blobId }, (err: any, response: any) => {
          if (err) {
            console.error('[0G DA Client] Retrieve error:', err);
            resolve({
              success: false,
              error: `Failed to retrieve blob: ${err.message}`
            });
          } else {
            const data = Buffer.from(response.data).toString("utf-8");
            console.log(`[0G DA Client] ✅ Blob retrieved successfully - ID: ${blobId}`);
            resolve({
              success: true,
              data: data
            });
          }
        });
      });

    } catch (error: any) {
      console.error('[0G DA Client] Retrieve blob error:', error);
      return {
        success: false,
        error: `Error retrieving from 0G DA: ${error.message}`
      };
    }
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; endpoint: string } {
    return {
      connected: this.isConnected,
      endpoint: this.grpcEndpoint
    };
  }
}

// Export singleton instance
export const zgDAClientService = new ZGDAClientService();
export const zgDAService = zgDAClientService;