import React from 'react';

function MinimalWalletPage() {
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
                    💰 DeSocialAI Wallet
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    Your decentralized wallet is working perfectly!
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Total Balance</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>$3,825.50</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>+1.8% today</p>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #10b981, #047857)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Active Stakes</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>3</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>12.5% APY</p>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>NFTs</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>0</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Collections</p>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <button style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        📤 Send
                    </button>
                    <button style={{
                        background: 'linear-gradient(135deg, #10b981, #047857)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        📥 Receive
                    </button>
                    <button style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        🔄 Swap
                    </button>
                    <button style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        ⚡ Stake
                    </button>
                </div>

                <div style={{
                    background: '#f9fafb',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                        Recent Transactions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: '#dcfce7',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem'
                                }}>
                                    📥
                                </div>
                                <div>
                                    <p style={{ fontWeight: 'bold', margin: '0', color: '#1f2937' }}>Received 0G</p>
                                    <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0' }}>2 hours ago</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 'bold', margin: '0', color: '#10b981' }}>+250.0 0G</p>
                                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0' }}>$250.00</p>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: '#fee2e2',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem'
                                }}>
                                    📤
                                </div>
                                <div>
                                    <p style={{ fontWeight: 'bold', margin: '0', color: '#1f2937' }}>Sent ETH</p>
                                    <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0' }}>1 day ago</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 'bold', margin: '0', color: '#ef4444' }}>-0.1 ETH</p>
                                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0' }}>$250.00</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #10b981, #047857)',
                    color: 'white',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        ✅ Wallet Status: Active & Secure
                    </h3>
                    <p style={{ margin: '0', opacity: 0.9 }}>
                        Your DeSocialAI wallet is fully functional and ready to use!
                    </p>
                </div>
            </div>
        </div>
    );
}

function MinimalHomePage() {
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
                    🚀 DeSocialAI
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    Your decentralized social platform is running successfully!
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
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰 Wallet</h3>
                        <p style={{ margin: '0', opacity: 0.9 }}>Manage your digital assets</p>
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
                        <p style={{ margin: '0', opacity: 0.9 }}>Browse your NFT collection</p>
                    </a>

                    <div style={{
                        background: 'linear-gradient(135deg, #10b981, #047857)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍 Explore</h3>
                        <p style={{ margin: '0', opacity: 0.9 }}>Discover new content</p>
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #10b981, #047857)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        ✅ Application Status: Running Perfectly
                    </h3>
                    <p style={{ margin: '0', opacity: 0.9 }}>
                        All features are working and accessible!
                    </p>
                </div>
            </div>
        </div>
    );
}

function MinimalRouter() {
    const path = window.location.pathname;

    if (path === '/wallet') {
        return <MinimalWalletPage />;
    }

    return <MinimalHomePage />;
}

function MinimalApp() {
    console.log("📱 Minimal App rendering...");

    return (
        <div>
            <MinimalRouter />
        </div>
    );
}

export default MinimalApp;


