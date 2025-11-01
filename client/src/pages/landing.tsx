import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Lock, Zap, Database, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function LandingPage() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const [ctaLoading, setCtaLoading] = useState(false);

    const handleGetStarted = async () => {
        setCtaLoading(true);
        // Simulate wallet connection
        setTimeout(() => {
            setCtaLoading(false);
            if (user) {
                setLocation('/');
            } else {
                // Redirect to wallet connection
                setLocation('/wallet');
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="container mx-auto px-4 py-16 lg:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

                        {/* Content: 7 columns */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                                <span>✨</span>
                                <span>Powered by 0G Chain</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
                                Decentralized Social Media
                                <span className="block bg-gradient-to-r from-primary via-purple-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                                    Powered by AI
                                </span>
                            </h1>

                            {/* Subheadline */}
                            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                                Own your data, discover smarter feeds, and monetize your content.
                                Connect your wallet to try—no sign-up required.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Primary CTA */}
                                <Button
                                    size="lg"
                                    onClick={handleGetStarted}
                                    disabled={ctaLoading}
                                    className="group/btn relative px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                                >
                                    {ctaLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            Get Started
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                                </Button>

                                {/* Secondary CTA */}
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setLocation('/')}
                                    className="px-8 py-6 text-lg font-semibold rounded-xl border-2"
                                >
                                    See Demo
                                </Button>
                            </div>

                            {/* Trust Signals */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <span>Audited Smart Contracts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-green-500" />
                                    <span>E2E Encrypted Messages</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <span>Connect in 30s</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual: 5 columns */}
                        <div className="lg:col-span-5">
                            <div className="relative">
                                {/* Hero Illustration - Placeholder */}
                                <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-border/50 p-8 flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="text-6xl">🌐</div>
                                        <h3 className="text-xl font-semibold">Decentralized Network</h3>
                                        <p className="text-sm text-muted-foreground">Powered by 0G Chain</p>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse" />
                                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16 lg:py-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose DeSocialAI?</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Built on cutting-edge blockchain technology with AI-powered features
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Feature Cards */}
                    {[
                        { icon: Shield, title: 'Security First', desc: 'Audited smart contracts and E2E encryption' },
                        { icon: Database, title: 'Own Your Data', desc: 'Decentralized storage on 0G DA' },
                        { icon: Zap, title: 'Lightning Fast', desc: 'Built on 0G Chain infrastructure' },
                        { icon: Wallet, title: 'Easy Wallet Connect', desc: 'Support for all major wallets' }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
