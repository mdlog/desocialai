import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Cpu,
  Shield,
  Activity,
  HardDrive,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ZGStorageStats {
  totalStorage: string;
  availableSpace: string;
  networkNodes: number;
  replicationFactor: number;
}

interface ZGComputeStats {
  totalInstances: number;
  activeUsers: number;
  computeCapacity: string;
  averageResponseTime: number;
  mode?: string;
  status?: string;
  error?: string;
  note?: string;
}

interface ZGDAStats {
  totalTransactions: number;
  pendingTransactions: number;
  processedBatches: number;
  avgBatchSize: number;
  dataAvailability: number;
}



interface Web3Status {
  connected: boolean;
  infrastructureConnected: boolean;
  network: string;
  chainId: string;
  blockExplorer: string;
  rpcUrl: string;
  blockHeight: number;
  gasPrice: string;
}

export function ZGInfrastructureStatus() {
  const { data: storageStats } = useQuery<ZGStorageStats>({
    queryKey: ["/api/zg/storage/stats"],
    refetchInterval: 30000,
  });

  const { data: computeStats } = useQuery<ZGComputeStats>({
    queryKey: ["/api/zg/compute/stats"],
    refetchInterval: 10000,
  });

  const { data: daStats } = useQuery<ZGDAStats>({
    queryKey: ["/api/zg/da/stats"],
    refetchInterval: 5000,
  });

  const { data: web3Status } = useQuery<Web3Status>({
    queryKey: ["/api/web3/status"],
    refetchInterval: 1000, // Update every second for real-time block height
  });

  return (
    <div className="space-y-2 text-xs">
      {/* Storage Stats */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3 text-blue-500" />
          Storage:
        </span>
        <span className="font-medium">{storageStats?.totalStorage || '...'}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-blue-500" />
          Nodes:
        </span>
        <span className="font-medium">{storageStats?.networkNodes || '...'}</span>
      </div>

      {/* Compute Stats */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-orange-500" />
          Compute:
        </span>
        <span className="font-medium">
          {computeStats?.mode === 'error' ? 'Offline' :
            computeStats?.mode === 'simulation' ? 'Simulation' :
              computeStats?.totalInstances || '...'}
          {computeStats?.mode !== 'error' && computeStats?.mode !== 'simulation' && ' instances'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-orange-500" />
          Status:
        </span>
        <span className="font-medium">
          {computeStats?.mode === 'error' ? 'Error' :
            computeStats?.mode === 'simulation' ? 'Simulation' :
              computeStats?.mode === 'real' ? 'Real' : '...'}
        </span>
      </div>

      {/* DA Stats */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-purple-500" />
          DA Transactions:
        </span>
        <span className="font-medium">{daStats?.totalTransactions || '...'}</span>
      </div>

      {/* Chain Status */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-500" />
          Block Height:
        </span>
        <span className="font-medium">{web3Status?.blockHeight?.toLocaleString() || '...'}</span>
      </div>
    </div>
  );
}

export function ZGInfrastructureStatusCards() {
  const { data: storageStats } = useQuery<ZGStorageStats>({
    queryKey: ["/api/zg/storage/stats"],
    refetchInterval: 30000,
  });

  const { data: computeStats } = useQuery<ZGComputeStats>({
    queryKey: ["/api/zg/compute/stats"],
    refetchInterval: 10000,
  });

  const { data: daStats } = useQuery<ZGDAStats>({
    queryKey: ["/api/zg/da/stats"],
    refetchInterval: 5000,
  });

  const { data: web3Status } = useQuery<Web3Status>({
    queryKey: ["/api/web3/status"],
    refetchInterval: 1000, // Update every second for real-time block height
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 0G Storage */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-og-primary" />
              <h3 className="text-sm font-medium">0G Storage</h3>
              <Badge variant="outline" className="ml-auto text-xs">
                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                Online
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-bold text-og-primary">{storageStats?.totalStorage || '...'}</div>
              <div className="text-xs text-og-slate-600 dark:text-og-slate-400">Total Storage</div>
            </div>
            <div className="flex justify-between text-xs">
              <span>Available:</span>
              <span className="font-medium">{storageStats?.availableSpace || '...'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Nodes:</span>
              <span className="font-medium">{storageStats?.networkNodes || '...'}</span>
            </div>
          </CardContent>
        </Card>

        {/* 0G Compute */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-og-secondary" />
              <h3 className="text-sm font-medium">0G Compute</h3>
              <Badge variant="outline" className="ml-auto text-xs">
                {computeStats?.mode === 'error' ? (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1 text-red-500" />
                    Error
                  </>
                ) : computeStats?.mode === 'simulation' ? (
                  <>
                    <Activity className="w-3 h-3 mr-1 text-yellow-500" />
                    Simulation
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    Active
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-bold text-og-secondary">
                {computeStats?.mode === 'error' ? 'Offline' :
                  computeStats?.mode === 'simulation' ? 'Simulation' :
                    computeStats?.totalInstances || '...'}
              </div>
              <div className="text-xs text-og-slate-600 dark:text-og-slate-400">
                {computeStats?.mode === 'error' ? 'Connection Failed' :
                  computeStats?.mode === 'simulation' ? 'Development Mode' :
                    'AI Instances'}
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span>Status:</span>
              <span className="font-medium">
                {computeStats?.mode === 'error' ? 'Error' :
                  computeStats?.mode === 'simulation' ? 'Simulation' :
                    computeStats?.mode === 'real' ? 'Real' : '...'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Capacity:</span>
              <span className="font-medium">
                {computeStats?.mode === 'error' ? 'N/A' :
                  computeStats?.computeCapacity || '...'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 0G Data Availability */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-medium">0G DA</h3>
              <Badge variant="outline" className="ml-auto text-xs">
                {daStats?.dataAvailability || 0}% Available
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{daStats?.totalTransactions?.toLocaleString() || '...'}</div>
              <div className="text-xs text-og-slate-600 dark:text-og-slate-400">Transactions</div>
            </div>
            <div className="flex justify-between text-xs">
              <span>Pending:</span>
              <span className="font-medium">{daStats?.pendingTransactions || '...'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Batches:</span>
              <span className="font-medium">{daStats?.processedBatches || '...'}</span>
            </div>
          </CardContent>
        </Card>

        {/* 0G Chain Status */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium">0G Chain</h3>
              <Badge variant="outline" className={`ml-auto text-xs ${web3Status?.infrastructureConnected ? "text-green-600" : "text-red-600"}`}>
                {web3Status?.infrastructureConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{web3Status?.blockHeight?.toLocaleString() || '...'}</div>
              <div className="text-xs text-og-slate-600 dark:text-og-slate-400">Block Height</div>
            </div>
            <div className="flex justify-between text-xs">
              <span>Network:</span>
              <span className="font-medium">{web3Status?.network || '...'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Chain ID:</span>
              <span className="font-medium">{web3Status?.chainId || '...'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}