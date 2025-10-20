export interface ProposalInput {
    title: string;
    description: string;
    proposalType: 'governance' | 'feature' | 'community';
}

export interface Proposal extends ProposalInput {
    id: string;
    creatorUserId: string;
    createdAt: number;
    votesFor: number;
    votesAgainst: number;
}

export interface VoteInput {
    voteType: 'for' | 'against';
    weight?: number;
}

class DACService {
    private proposals: Map<string, Proposal> = new Map();
    private balances: Map<string, number> = new Map();

    createProposal(userId: string, input: ProposalInput): Proposal {
        const id = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const proposal: Proposal = {
            id,
            creatorUserId: userId,
            title: input.title,
            description: input.description,
            proposalType: input.proposalType,
            createdAt: Date.now(),
            votesFor: 0,
            votesAgainst: 0,
        };
        this.proposals.set(id, proposal);
        return proposal;
    }

    listProposals(): Proposal[] {
        return Array.from(this.proposals.values()).sort((a, b) => b.createdAt - a.createdAt);
    }

    vote(proposalId: string, vote: VoteInput): Proposal {
        const p = this.proposals.get(proposalId);
        if (!p) throw new Error('Proposal not found');
        const weight = Math.max(1, Math.min(1000, vote.weight || 1));
        if (vote.voteType === 'for') p.votesFor += weight; else p.votesAgainst += weight;
        return p;
    }

    tally(proposalId: string): { proposalId: string; for: number; against: number; passed: boolean } {
        const p = this.proposals.get(proposalId);
        if (!p) throw new Error('Proposal not found');
        const passed = p.votesFor > p.votesAgainst;
        return { proposalId, for: p.votesFor, against: p.votesAgainst, passed };
    }

    // Token mocks
    issueCommunityTokens(address: string, amount: number): { address: string; amount: number } {
        const current = this.balances.get(address) || 0;
        const next = current + Math.max(0, amount);
        this.balances.set(address, next);
        return { address, amount: next };
    }

    balanceOf(address: string): { address: string; amount: number } {
        return { address, amount: this.balances.get(address) || 0 };
    }

    // Treasury stubs
    createTreasuryProposal(input: { title: string; amount: number; to: string; reason: string }) {
        return { id: `tre_${Date.now()}`, status: 'pending', ...input };
    }

    executeTreasuryProposal(id: string) {
        return { id, status: 'executed', txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}` };
    }
}

export const dacService = new DACService();


