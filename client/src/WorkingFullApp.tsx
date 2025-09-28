import React from 'react';
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { RainbowKitProviderWrapper } from "@/providers/rainbowkit-provider";
import Home from "./pages/home";
import { ProfilePage } from "./pages/profile";
import { AIRecommendationsPage } from "./pages/ai-recommendations";
import { CommunitiesPage } from "./pages/communities";
import { BookmarksPage } from "./pages/bookmarks";
import { SettingsPage } from "./pages/settings";
import { ExplorePage } from "./pages/explore";
import { NFTGalleryPage } from "./pages/nft-gallery";
import { WalletPage } from "./pages/wallet";
import ChatPage from "./pages/chat";
import MessagesPage from "./pages/messages";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/not-found";

function Router() {
    console.log("🌐 DeSocialAI Router initializing...");

    return (
        <Switch>
            <Route path="/" component={Home} />
            <Route path="/explore" component={ExplorePage} />
            <Route path="/nft-gallery" component={NFTGalleryPage} />
            <Route path="/wallet" component={WalletPage} />
            <Route path="/profile/:username" component={ProfilePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/ai-recommendations" component={AIRecommendationsPage} />
            <Route path="/communities" component={CommunitiesPage} />
            <Route path="/bookmarks" component={BookmarksPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/chat" component={ChatPage} />
            <Route path="/messages" component={MessagesPage} />
            <Route path="/admin" component={AdminPage} />
            <Route component={NotFound} />
        </Switch>
    );
}

function WorkingFullApp() {
    console.log("📱 DeSocialAI Full App component rendering...");

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

export default WorkingFullApp;


