import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Wallet,
    Send,
    Download as Receive,
    History,
    Copy,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    Eye,
    EyeOff,
    RefreshCw,
    Plus,
    Minus,
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    Coins,
    Shield,
    CheckCircle,
    AlertCircle,
    BarChart3,
    PieChart,
    Zap,
    QrCode,
    Star,
    Award,
    Target,
    Activity
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";

interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'swap' | 'mint' | 'burn';
    amount: string;
    currency: string;
    to?: string;
    from?: string;
    timestamp: string;
    status: 'pending' | 'completed' | 'failed';
    hash?: string;
    description?: string;
}

interface Token {
    symbol: string;
    name: string;
    balance: string;
    usdValue: string;
    change24h: number;
    icon?: string;
    contractAddress?: string;
    decimals?: number;
    price?: number;
    marketCap?: string;
}

interface PortfolioStats {
    totalValue: number;
    change24h: number;
    change7d: number;
    change30d: number;
    bestPerformer: string;
    worstPerformer: string;
    totalTransactions: number;
    activeStakes: number;
}

interface DeFiPosition {
    id: string;
    protocol: string;
    type: 'lending' | 'staking' | 'farming' | 'pool';
    asset: string;
    amount: string;
    apy: number;
    rewards: string;
    status: 'active' | 'pending' | 'completed';
}

export function WalletPage() {
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const { data: walletInfo, isLoading: walletLoading } = useQuery({
        queryKey: ['/api/web3/wallet'],
        queryFn: async () => {
            const response = await fetch('/api/web3/wallet');
            if (!response.ok) throw new Error('Failed to fetch wallet info');
            return response.json();
        },
    });

    const { data: transactions = [], isLoading: txLoading } = useQuery({
        queryKey: ['/api/wallet/transactions'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/transactions');
            if (!response.ok) return [];
            return response.json();
        },
        refetchInterval: 30000,
    });

    const { data: tokens = [], isLoading: tokensLoading } = useQuery({
        queryKey: ['/api/wallet/tokens'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/tokens');
            if (!response.ok) return [];
            return response.json();
        },
    });

    const { data: defiPositions = [] } = useQuery({
        queryKey: ['/api/wallet/defi'],
        queryFn: async () => {
            const response = await fetch('/api/wallet/defi');
            if (!response.ok) return [];
            return response.json();
        },
        refetchInterval: 30000,
    });





    // Use real data from API, fallback to empty/default values
    const displayWalletInfo = walletInfo || {
        address: "Not connected",
        balance: "0.000 0G",
        network: "0G Mainnet",
        chainId: 16661
    };
    const displayTokens = tokens.length > 0 ? tokens : [];
    const displayTransactions = transactions.length > 0 ? transactions : [];
    const displayDeFi = (defiPositions as DeFiPosition[]).length > 0 ? defiPositions as DeFiPosition[] : [];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const totalValue = displayTokens.reduce((sum, token) => {
        const value = parseFloat(token.usdValue.replace(/[$,]/g, ''));
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

    // Total native token (0G) amount for real on-chain portfolio
    const totalOG = displayTokens.reduce((sum, token) => {
        const bal = parseFloat(token.balance.replace(/[,]/g, ''));
        return sum + (Number.isFinite(bal) ? bal : 0);
    }, 0);

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'send': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
            case 'receive': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
            case 'swap': return <RefreshCw className="w-4 h-4 text-blue-500" />;
            case 'mint': return <Plus className="w-4 h-4 text-purple-500" />;
            case 'burn': return <Minus className="w-4 h-4 text-orange-500" />;
            default: return <DollarSign className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-3">
                        <LeftSidebar />
                    </div>

                    <main className="lg:col-span-6 space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-blue-500" />
                            <h1 className="text-3xl font-bold">Wallet</h1>
                            <Badge variant="secondary" className="ml-auto">
                                {displayWalletInfo.network}
                            </Badge>
                        </div>

                        {/* Wallet Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Wallet Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-sm">
                                                {showPrivateKey ? displayWalletInfo.address :
                                                    `${displayWalletInfo.address.slice(0, 6)}...${displayWalletInfo.address.slice(-4)}`}
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                                            >
                                                {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(displayWalletInfo.address)}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View on Explorer
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Balance</p>
                                        <p className="text-2xl font-bold">{walletLoading ? '—' : (displayWalletInfo.balance || '—')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Network</p>
                                        <p className="text-lg font-semibold">{displayWalletInfo.network}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button className="h-20 flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600">
                                <Send className="w-6 h-6" />
                                Send
                            </Button>
                            <Button variant="outline" className="h-20 flex flex-col gap-2 border-green-500 text-green-600 hover:bg-green-50">
                                <Receive className="w-6 h-6" />
                                Receive
                            </Button>
                            <Button variant="outline" className="h-20 flex flex-col gap-2 border-purple-500 text-purple-600 hover:bg-purple-50">
                                <RefreshCw className="w-6 h-6" />
                                Swap
                            </Button>
                            <Button variant="outline" className="h-20 flex flex-col gap-2 border-orange-500 text-orange-600 hover:bg-orange-50">
                                <Zap className="w-6 h-6" />
                                Stake
                            </Button>
                        </div>


                        {/* Portfolio Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Portfolio Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Total Balance</p>
                                        <p className="text-2xl font-bold">{walletLoading ? '—' : (displayWalletInfo.balance || '0.000 0G')}</p>
                                        <p className="text-xs text-gray-400 mt-1">On-chain balance</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Total Assets</p>
                                        <p className="text-lg font-semibold">{displayTokens.length}</p>
                                        <p className="text-xs text-gray-400 mt-1">Token types</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Transactions</p>
                                        <p className="text-lg font-semibold">{displayTransactions.length}</p>
                                        <p className="text-xs text-gray-400 mt-1">Total history</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">DeFi Positions</p>
                                        <p className="text-lg font-semibold">{displayDeFi.length}</p>
                                        <p className="text-xs text-gray-400 mt-1">Active stakes</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Portfolio</TabsTrigger>
                                <TabsTrigger value="defi">DeFi</TabsTrigger>
                                <TabsTrigger value="transactions">History</TabsTrigger>
                                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            </TabsList>

                            {/* Tokens Tab */}
                            <TabsContent value="overview" className="space-y-4">
                                <div className="space-y-3">
                                    {displayTokens.map((token, index) => (
                                        <Card key={index}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                            <Coins className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{token.symbol}</p>
                                                            <p className="text-sm text-gray-500">{token.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{token.balance}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm text-gray-500">{token.usdValue}</p>
                                                            <div className={`flex items-center gap-1 text-xs ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                                                                }`}>
                                                                {token.change24h >= 0 ?
                                                                    <TrendingUp className="w-3 h-3" /> :
                                                                    <TrendingDown className="w-3 h-3" />
                                                                }
                                                                {Math.abs(token.change24h)}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Transactions Tab */}
                            <TabsContent value="transactions" className="space-y-4">
                                <div className="space-y-3">
                                    {displayTransactions.map((tx) => (
                                        <Card key={tx.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {getTransactionIcon(tx.type)}
                                                        <div>
                                                            <p className="font-semibold capitalize">{tx.type}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {tx.description || `${tx.type} ${tx.amount} ${tx.currency}`}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(tx.timestamp).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(tx.status)}
                                                            <Badge variant={
                                                                tx.status === 'completed' ? 'default' :
                                                                    tx.status === 'pending' ? 'secondary' : 'destructive'
                                                            }>
                                                                {tx.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm font-semibold">
                                                            {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.currency}
                                                        </p>
                                                        {tx.hash && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => copyToClipboard(tx.hash!)}
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* DeFi Tab */}
                            <TabsContent value="defi" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Zap className="w-5 h-5" />
                                                Active Positions
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {displayDeFi.map((position) => (
                                                <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-semibold">{position.protocol}</p>
                                                        <p className="text-sm text-gray-500">{position.asset}</p>
                                                        <p className="text-xs text-gray-400">{position.amount}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        {position.apy !== undefined && <p className="text-sm font-semibold text-green-600">+{position.apy}% APY</p>}
                                                        {position.rewards && <p className="text-xs text-gray-500">{position.rewards} rewards</p>}
                                                        <Badge variant={position.status === 'active' ? 'default' : 'secondary'}>
                                                            {position.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Target className="w-5 h-5" />
                                                DeFi Opportunities
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <p className="font-semibold text-blue-900">0G Staking Pool</p>
                                                <p className="text-sm text-blue-700">Stake your 0G tokens for 12.5% APY</p>
                                                <Button size="sm" className="mt-2">Stake Now</Button>
                                            </div>
                                            <div className="p-3 bg-green-50 rounded-lg">
                                                <p className="font-semibold text-green-900">Liquidity Mining</p>
                                                <p className="text-sm text-green-700">Provide liquidity for 8.3% APY</p>
                                                <Button size="sm" variant="outline" className="mt-2">Add Liquidity</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Analytics Tab */}
                            <TabsContent value="analytics" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <PieChart className="w-5 h-5" />
                                                Asset Allocation
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {displayTokens.map((token) => {
                                                    const valueOG = parseFloat(token.balance.replace(/[,]/g, ''));
                                                    const denom = totalOG > 0 ? totalOG : 1;
                                                    const percentage = Math.max(0, Math.min(100, (valueOG / denom) * 100));
                                                    return (
                                                        <div key={token.symbol} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                                <span className="font-medium">{token.symbol}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={percentage} className="w-20 h-2" />
                                                                <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Activity className="w-5 h-5" />
                                                Performance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Total Transactions</span>
                                                <span className="font-semibold">{displayTransactions.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Total Assets</span>
                                                <span className="font-semibold">{displayTokens.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">DeFi Positions</span>
                                                <span className="font-semibold">{displayDeFi.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Network</span>
                                                <span className="font-semibold">{displayWalletInfo.network}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>


                        </Tabs>
                    </main>

                    <div className="lg:col-span-3">
                        <RightSidebar />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
