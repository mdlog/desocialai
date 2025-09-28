import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Images,
    Search,
    Filter,
    Grid3X3,
    List,
    ExternalLink,
    Heart,
    Share2,
    Download,
    Eye,
    Crown,
    Zap
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";

interface NFT {
    id: string;
    name: string;
    description: string;
    image: string;
    contractAddress: string;
    tokenId: string;
    owner: string;
    collection: string;
    rarity: string;
    attributes: Array<{
        trait_type: string;
        value: string;
    }>;
    price?: number;
    currency?: string;
    likes: number;
    views: number;
    isLiked?: boolean;
    isOwned?: boolean;
}

export function NFTGalleryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCollection, setSelectedCollection] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("recent");

    const { data: nfts = [], isLoading } = useQuery({
        queryKey: ['/api/nft-gallery', { search: searchQuery, collection: selectedCollection, sort: sortBy }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCollection !== 'all') params.append('collection', selectedCollection);
            if (sortBy) params.append('sort', sortBy);

            const response = await fetch(`/api/nft-gallery?${params}`);
            if (!response.ok) throw new Error('Failed to fetch NFTs');
            return response.json();
        },
    });

    const { data: collections = [] } = useQuery({
        queryKey: ['/api/nft-gallery/collections'],
        queryFn: async () => {
            const response = await fetch('/api/nft-gallery/collections');
            if (!response.ok) throw new Error('Failed to fetch collections');
            return response.json();
        },
    });

    // Mock data for demonstration
    const mockNFTs: NFT[] = [
        {
            id: '1',
            name: 'Cyber Punk #001',
            description: 'A futuristic cyberpunk character with neon lights',
            image: '/favicon.png',
            contractAddress: '0x1234...5678',
            tokenId: '1',
            owner: '0xabcd...efgh',
            collection: 'Cyber Punk Collection',
            rarity: 'Legendary',
            attributes: [
                { trait_type: 'Background', value: 'Neon City' },
                { trait_type: 'Eyes', value: 'Laser Red' },
                { trait_type: 'Accessory', value: 'Cyber Helmet' }
            ],
            price: 2.5,
            currency: 'ETH',
            likes: 42,
            views: 156,
            isLiked: false,
            isOwned: false
        },
        {
            id: '2',
            name: 'DeSocial AI Avatar #042',
            description: 'AI-generated avatar for DeSocial platform',
            image: '/favicon.png',
            contractAddress: '0x9876...5432',
            tokenId: '42',
            owner: '0x1234...5678',
            collection: 'DeSocial AI Collection',
            rarity: 'Epic',
            attributes: [
                { trait_type: 'AI Model', value: 'GPT-4' },
                { trait_type: 'Style', value: 'Abstract' },
                { trait_type: 'Color', value: 'Blue Gradient' }
            ],
            price: 1.8,
            currency: 'ETH',
            likes: 28,
            views: 89,
            isLiked: true,
            isOwned: true
        },
        {
            id: '3',
            name: 'Blockchain Warrior #777',
            description: 'A warrior representing the power of blockchain technology',
            image: '/favicon.png',
            contractAddress: '0xabcd...efgh',
            tokenId: '777',
            owner: '0x5678...9abc',
            collection: 'Blockchain Warriors',
            rarity: 'Rare',
            attributes: [
                { trait_type: 'Weapon', value: 'Crypto Sword' },
                { trait_type: 'Armor', value: 'Blockchain Shield' },
                { trait_type: 'Power', value: 'Mining Strength' }
            ],
            price: 0.95,
            currency: 'ETH',
            likes: 15,
            views: 67,
            isLiked: false,
            isOwned: false
        }
    ];

    const mockCollections = [
        { id: '1', name: 'Cyber Punk', count: 1000, floorPrice: 2.1 },
        { id: '2', name: 'DeSocial AI', count: 500, floorPrice: 1.5 },
        { id: '3', name: 'Blockchain', count: 2500, floorPrice: 0.8 }
    ];

    const displayNFTs = nfts.length > 0 ? nfts : mockNFTs;
    const displayCollections = collections.length > 0 ? collections : mockCollections;

    const handleLike = async (nftId: string) => {
        // Implement like functionality
        console.log('Liking NFT:', nftId);
    };

    const handleShare = async (nftId: string) => {
        // Implement share functionality
        console.log('Sharing NFT:', nftId);
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity.toLowerCase()) {
            case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'uncommon': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3">
                        <LeftSidebar />
                    </div>

                    <main className="lg:col-span-6 space-y-8">
                        {/* Header */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                        <Images className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            NFT Gallery
                                        </h1>
                                        <p className="text-muted-foreground mt-1">
                                            Discover and explore unique digital collectibles
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                                        {displayNFTs.length} NFTs
                                    </Badge>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <Input
                                            placeholder="Search NFTs, collections, or artists..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-12 h-12 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-700/50 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant={viewMode === "grid" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setViewMode("grid")}
                                            className="h-12 px-4 rounded-xl"
                                        >
                                            <Grid3X3 className="w-4 h-4 mr-2" />
                                            Grid
                                        </Button>
                                        <Button
                                            variant={viewMode === "list" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setViewMode("list")}
                                            className="h-12 px-4 rounded-xl"
                                        >
                                            <List className="w-4 h-4 mr-2" />
                                            List
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Collections Filter */}
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                                <Tabs value={selectedCollection} onValueChange={setSelectedCollection}>
                                    <TabsList className="inline-flex w-full bg-slate-100 dark:bg-slate-700 rounded-xl p-1 overflow-x-auto">
                                        <TabsTrigger
                                            value="all"
                                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 whitespace-nowrap px-3 py-2 text-sm"
                                        >
                                            All
                                        </TabsTrigger>
                                        {displayCollections.slice(0, 3).map((collection) => (
                                            <TabsTrigger
                                                key={collection.id}
                                                value={collection.id}
                                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 whitespace-nowrap px-3 py-2 text-sm"
                                            >
                                                {collection.name.length > 12 ? `${collection.name.substring(0, 12)}...` : collection.name}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>

                        {/* NFT Grid/List */}
                        <div className={viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            : "space-y-4"
                        }>
                            {displayNFTs.map((nft) => (
                                <Card key={nft.id} className="group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                                    <CardHeader className="p-0">
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={nft.image}
                                                alt={nft.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/favicon.png';
                                                }}
                                            />

                                            {/* Overlay Actions - Simplified */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleLike(nft.id)}
                                                        className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white h-8 w-8 p-0"
                                                    >
                                                        <Heart className={`w-4 h-4 ${nft.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleShare(nft.id)}
                                                        className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white h-8 w-8 p-0"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Rarity Badge - Simplified */}
                                            <div className="absolute top-2 left-2">
                                                <Badge className={`${getRarityColor(nft.rarity)} text-xs px-2 py-1`}>
                                                    {nft.rarity}
                                                </Badge>
                                            </div>

                                            {/* Owned Badge - Simplified */}
                                            {nft.isOwned && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                                                        ✓
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-4 space-y-3">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">{nft.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{nft.collection}</p>
                                        </div>

                                        {/* Price and Stats - Simplified */}
                                        <div className="flex items-center justify-between">
                                            {nft.price && (
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{nft.price} {nft.currency}</p>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-3 h-3" />
                                                    <span>{nft.likes}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    <span>{nft.views}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center py-16">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Loading NFTs...</p>
                                </div>
                            </div>
                        )}
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
