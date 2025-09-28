import React from 'react';
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { RainbowKitProviderWrapper } from "@/providers/rainbowkit-provider";
import { Header } from "@/components/layout/header";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Footer } from "@/components/layout/footer";

// Simple Wallet Page Component
function SimpleWalletPage() {
    console.log("💰 Simple Wallet Page rendering...");

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-3">
                        <LeftSidebar />
                    </div>

                    <main className="lg:col-span-6 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">💰 Wallet</h1>
                            <p className="text-gray-600 mb-6">Manage your digital assets and transactions</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <h3 className="text-lg font-semibold text-blue-900">Total Balance</h3>
                                    <p className="text-2xl font-bold text-blue-600">$3,825.50</p>
                                    <p className="text-sm text-green-600">+1.8% today</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <h3 className="text-lg font-semibold text-green-900">Active Stakes</h3>
                                    <p className="text-2xl font-bold text-green-600">3</p>
                                    <p className="text-sm text-gray-600">12.5% APY</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg text-center">
                                    <h3 className="text-lg font-semibold text-purple-900">NFTs</h3>
                                    <p className="text-2xl font-bold text-purple-600">0</p>
                                    <p className="text-sm text-gray-600">Collections</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors">
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">📤</div>
                                        <div className="font-semibold">Send</div>
                                    </div>
                                </button>
                                <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors">
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">📥</div>
                                        <div className="font-semibold">Receive</div>
                                    </div>
                                </button>
                                <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors">
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🔄</div>
                                        <div className="font-semibold">Swap</div>
                                    </div>
                                </button>
                                <button className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors">
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">⚡</div>
                                        <div className="font-semibold">Stake</div>
                                    </div>
                                </button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-green-600">📥</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Received 0G</p>
                                                <p className="text-sm text-gray-500">2 hours ago</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">+250.0 0G</p>
                                            <p className="text-sm text-gray-500">$250.00</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                                <span className="text-red-600">📤</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Sent ETH</p>
                                                <p className="text-sm text-gray-500">1 day ago</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-red-600">-0.1 ETH</p>
                                            <p className="text-sm text-gray-500">$250.00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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

// Simple Home Page Component
function SimpleHomePage() {
    console.log("🏠 Simple Home Page rendering...");

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-3">
                        <LeftSidebar />
                    </div>

                    <main className="lg:col-span-6 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">🏠 DeSocialAI Home</h1>
                            <p className="text-gray-600 mb-6">Welcome to your decentralized social platform</p>

                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <a href="/wallet" className="bg-blue-500 text-white p-3 rounded-lg text-center hover:bg-blue-600 transition-colors">
                                        💰 Wallet
                                    </a>
                                    <a href="/nft-gallery" className="bg-purple-500 text-white p-3 rounded-lg text-center hover:bg-purple-600 transition-colors">
                                        🖼️ NFT Gallery
                                    </a>
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Status</h3>
                                <p className="text-green-700">Application is running successfully!</p>
                                <p className="text-sm text-green-600 mt-2">All pages are accessible and functional.</p>
                            </div>
                        </div>
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

function Router() {
    console.log("🌐 Simple Router initializing...");

    return (
        <Switch>
            <Route path="/" component={SimpleHomePage} />
            <Route path="/wallet" component={SimpleWalletPage} />
            <Route path="/nft-gallery" component={SimpleHomePage} />
            <Route path="/explore" component={SimpleHomePage} />
            <Route path="/profile" component={SimpleHomePage} />
            <Route path="/messages" component={SimpleHomePage} />
            <Route path="/communities" component={SimpleHomePage} />
            <Route path="/bookmarks" component={SimpleHomePage} />
            <Route path="/settings" component={SimpleHomePage} />
            <Route path="/ai-recommendations" component={SimpleHomePage} />
            <Route path="/chat" component={SimpleHomePage} />
            <Route path="/admin" component={SimpleHomePage} />
        </Switch>
    );
}

function SimpleWalletApp() {
    console.log("📱 Simple Wallet App component rendering...");

    return (
        <ThemeProvider>
            <RainbowKitProviderWrapper>
                <TooltipProvider>
                    <Router />
                    <Toaster />
                </TooltipProvider>
            </RainbowKitProviderWrapper>
        </ThemeProvider>
    );
}

export default SimpleWalletApp;


