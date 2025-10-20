import { zgComputeService } from './zg-compute';

export interface ModerationResult {
    allowed: boolean;
    reasons: string[];
    severity: 'low' | 'medium' | 'high';
    categories: string[];
}

class ModerationService {
    private policy: string = `
Policy: Prohibit hate speech, explicit sexual content, direct threats, self-harm encouragement, and doxxing. Flag spam, scams, impersonation, and malware links. Allow constructive discussion with respectful language. Consider cultural context and intent. If uncertain, prefer caution.
Return JSON: { allowed: boolean, reasons: string[], severity: 'low'|'medium'|'high', categories: string[] }
`;

    async checkContent(content: string, context: Record<string, any> = {}): Promise<ModerationResult> {
        try {
            const prompt = `Moderate the following content based on policy. Content: ${JSON.stringify(content)} Context: ${JSON.stringify(context)} ${this.policy}`;
            const result = await zgComputeService.generateResponse({ prompt, maxTokens: 200, temperature: 0.2 });
            const parsed: ModerationResult = JSON.parse(result);
            return parsed;
        } catch (e) {
            console.error('[Moderation] Fallback allow due to error:', e);
            return { allowed: true, reasons: ['engine_error'], severity: 'low', categories: [] };
        }
    }

    getPolicy(): string {
        return this.policy;
    }
}

export const moderationService = new ModerationService();


