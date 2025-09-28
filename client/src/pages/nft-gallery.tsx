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
        { id: '1', name: 'Cyber Punk Collection', count: 1000, floorPrice: 2.1 },
        { id: '2', name: 'DeSocial AI Collection', count: 500, floorPrice: 1.5 },
        { id: '3', name: 'Blockchain Warriors', count: 2500, floorPrice: 0.8 }
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
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-3">
                        <LeftSidebar />
                    </div>

                    <main className="lg:col-span-6 space-y-6">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Images className="w-8 h-8 text-blue-500" />
                                <h1 className="text-3xl font-bold">NFT Gallery</h1>
                                <Badge variant="secondary" className="ml-auto">
                                    {displayNFTs.length} NFTs
                                </Badge>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search NFTs, collections, or artists..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === "grid" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode("list")}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Collections Filter */}
                            <Tabs value={selectedCollection} onValueChange={setSelectedCollection}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    {displayCollections.slice(0, 3).map((collection) => (
                                        <TabsTrigger key={collection.id} value={collection.id}>
                                            {collection.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* NFT Grid/List */}
                        <div className={viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
                            : "space-y-4"
                        }>
                            {displayNFTs.map((nft) => (
                                <Card key={nft.id} className="group hover:shadow-lg transition-all duration-300">
                                    <CardHeader className="p-0">
                                        <div className="relative overflow-hidden rounded-t-lg">
                                            <img
                                                src={nft.image}
                                                alt={nft.name}
                                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/favicon.png';
                                                }}
                                            />

                                            {/* Overlay Actions */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => handleLike(nft.id)}>
                                                    <Heart className={`w-4 h-4 ${nft.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => handleShare(nft.id)}>
                                                    <Share2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="secondary">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="secondary">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Rarity Badge */}
                                            <div className="absolute top-2 left-2">
                                                <Badge className={getRarityColor(nft.rarity)}>
                                                    <Crown className="w-3 h-3 mr-1" />
                                                    {nft.rarity}
                                                </Badge>
                                            </div>

                                            {/* Owned Badge */}
                                            {nft.isOwned && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge variant="default" className="bg-green-500">
                                                        Owned
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-lg">{nft.name}</h3>
                                                <p className="text-sm text-gray-500">{nft.collection}</p>
                                            </div>
                                            {nft.price && (
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold">{nft.price} {nft.currency}</p>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2">{nft.description}</p>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" />
                                                {nft.likes}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {nft.views}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Zap className="w-4 h-4" />
                                                #{nft.tokenId}
                                            </div>
                                        </div>

                                        {/* Attributes */}
                                        <div className="flex flex-wrap gap-1">
                                            {nft.attributes.slice(0, 3).map((attr, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {attr.trait_type}: {attr.value}
                                                </Badge>
                                            ))}
                                            {nft.attributes.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{nft.attributes.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
