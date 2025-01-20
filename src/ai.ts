import OpenAI from 'openai';
import { funnel } from 'remeda';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

// In-memory rate limiting
const callHistory: number[] = [];
const MINUTE_LIMIT = 30; // Max calls per minute
const HOUR_LIMIT = 200; // Max calls per hour

function checkRateLimit(): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();

    // Remove old entries
    while (callHistory.length > 0 && callHistory[0] < now - 3600000) {
        callHistory.shift();
    }

    // Count calls in last minute and hour
    const minuteCount = callHistory.filter(t => t > now - 60000).length;
    const hourCount = callHistory.length;

    // Check limits
    if (minuteCount >= MINUTE_LIMIT) {
        const retryAfter =
            60000 - (now - callHistory[callHistory.length - MINUTE_LIMIT]);
        return { allowed: false, retryAfter };
    }
    if (hourCount >= HOUR_LIMIT) {
        const retryAfter = 3600000 - (now - callHistory[0]);
        return { allowed: false, retryAfter };
    }

    // Add current call to history
    callHistory.push(now);
    return { allowed: true };
}

type CreateParams = Parameters<typeof openai.chat.completions.create>;

function callAIInternal(
    ...args: CreateParams
) {
    const { allowed, retryAfter } = checkRateLimit();
    if (!allowed) {
        throw new Error(
            `Rate limit exceeded. Try again in ${Math.ceil((retryAfter || 0) / 1000)} seconds`,
        );
    }

    return openai.chat.completions.create(...args);
}

export const ai = funnel(callAIInternal, {
    minGapMs: 500,
    triggerAt: 'start',
    reducer: (_, args: CreateParams) => args,
});
