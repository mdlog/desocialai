/**
 * Helper functions for content categorization and discovery
 */

export function getCategoryForHashtag(tag: string): string {
    const categories: { [key: string]: string } = {
        'defi': 'DeFi',
        'nft': 'NFT',
        'ai': 'AI',
        'blockchain': 'Infrastructure',
        'web3': 'Infrastructure',
        '0g': 'Infrastructure',
        'dao': 'Governance',
        'gaming': 'Gaming',
        'crypto': 'DeFi'
    };

    const tagLower = tag.toLowerCase();
    for (const [key, category] of Object.entries(categories)) {
        if (tagLower.includes(key)) {
            return category;
        }
    }
    return 'General';
}

export function getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
        'DeFi': 'Decentralized Finance protocols, DEXs, and financial applications',
        'NFT': 'Non-fungible tokens, digital collectibles, and NFT marketplaces',
        'AI': 'Artificial Intelligence, machine learning, and AI-powered applications',
        'Infrastructure': 'Blockchain infrastructure, protocols, and technical discussions',
        'Gaming': 'Web3 gaming, GameFi, and play-to-earn applications',
        'Governance': 'DAO governance, voting, and community management',
        'General': 'General discussions and miscellaneous content'
    };
    return descriptions[category] || 'General content and discussions';
}

export function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
        'DeFi': '#10B981',
        'NFT': '#8B5CF6',
        'AI': '#F59E0B',
        'Infrastructure': '#3B82F6',
        'Gaming': '#EF4444',
        'Governance': '#6366F1',
        'General': '#6B7280'
    };
    return colors[category] || '#6B7280';
}

export async function categorizeContent(content: string): Promise<string | null> {
    const contentLower = content.toLowerCase();

    if (contentLower.includes('defi') || contentLower.includes('liquidity') || contentLower.includes('yield')) {
        return 'DeFi';
    }
    if (contentLower.includes('nft') || contentLower.includes('collectible') || contentLower.includes('mint')) {
        return 'NFT';
    }
    if (contentLower.includes('ai') || contentLower.includes('artificial intelligence') || contentLower.includes('machine learning')) {
        return 'AI';
    }
    if (contentLower.includes('blockchain') || contentLower.includes('protocol') || contentLower.includes('0g')) {
        return 'Infrastructure';
    }
    if (contentLower.includes('gaming') || contentLower.includes('game') || contentLower.includes('play-to-earn')) {
        return 'Gaming';
    }
    if (contentLower.includes('dao') || contentLower.includes('governance') || contentLower.includes('voting')) {
        return 'Governance';
    }

    return 'General';
}

export function generateHashtagsForCategory(category: string, content: string): string[] {
    const categoryHashtags: { [key: string]: string[] } = {
        'DeFi': ['#DeFi', '#yield', '#liquidity', '#protocol'],
        'NFT': ['#NFT', '#collectibles', '#digitalart', '#mint'],
        'AI': ['#AI', '#MachineLearning', '#tech', '#innovation'],
        'Infrastructure': ['#blockchain', '#0G', '#infrastructure', '#protocol'],
        'Gaming': ['#gaming', '#GameFi', '#PlayToEarn', '#Web3Gaming'],
        'Governance': ['#DAO', '#governance', '#voting', '#community'],
        'General': ['#crypto', '#web3', '#blockchain', '#decentralized']
    };

    const baseHashtags = categoryHashtags[category] || categoryHashtags['General'];
    const contentWords = content.toLowerCase().split(' ');

    const additionalHashtags: string[] = [];
    if (contentWords.some(word => word.includes('bitcoin') || word.includes('btc'))) {
        additionalHashtags.push('#Bitcoin');
    }
    if (contentWords.some(word => word.includes('ethereum') || word.includes('eth'))) {
        additionalHashtags.push('#Ethereum');
    }

    return [...baseHashtags.slice(0, 2), ...additionalHashtags].slice(0, 5);
}
