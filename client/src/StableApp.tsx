import React from 'react';

// Import components without hot reload issues
function StableApp() {
    console.log("📱 DeSocialAI Stable App rendering...");

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    🚀 DeSocialAI - Full Application
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    Your complete decentralized social platform is running!
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <a href="/wallet" style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'block'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰 Enhanced Wallet</h3>
                        <p style={{ margin: '0', opacity: 0.9 }}>Portfolio, DeFi, Analytics, NFTs</p>
                    </a>

                    <a href="/nft-gallery" style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'block'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🖼️ NFT Gallery</h3>
                        <p style={{ margin: '0', opacity: 0.9 }}>Browse, search, filter collections</p>
                    </a>

                    <a href="/explore" style={{
                        background: 'linear-gradient(135deg, #10b981, #047857)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'block'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍 Explore</h3>
                        <p style={{ margin: '0', opacity: 0.9 }}>Discover trending content</p>
                    </a>

                    <a href="/profile" style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'block'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👤 Profile</h3>
                        <p style={{ margin: '0', opacity: 0.9 }}>Manage your identity</p>
                    </a>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #10b981, #047857)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        ✅ All Features Available
                    </h3>
                    <p style={{ margin: '0', opacity: 0.9 }}>
                        Wallet with enhanced portfolio management, NFT gallery, and full social features!
                    </p>
                </div>

                <div style={{
                    background: '#f9fafb',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                        🎯 Available Pages
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <a href="/" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>🏠 Home</a>
                        <a href="/explore" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>🔍 Explore</a>
                        <a href="/nft-gallery" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>🖼️ NFT Gallery</a>
                        <a href="/wallet" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>💰 Wallet</a>
                        <a href="/profile" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>👤 Profile</a>
                        <a href="/messages" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>💬 Messages</a>
                        <a href="/communities" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>🏘️ Communities</a>
                        <a href="/bookmarks" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>🔖 Bookmarks</a>
                        <a href="/settings" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>⚙️ Settings</a>
                        <a href="/ai-recommendations" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>🤖 AI Recommendations</a>
                        <a href="/chat" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>💬 Chat</a>
                        <a href="/admin" style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', textDecoration: 'none', color: '#374151', border: '1px solid #e5e7eb' }}>👨‍💼 Admin</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StableApp;


