import OpenAI from 'openai';
import { throttle } from 'lodash';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

// Rate limiting configuration
const MINUTE_LIMIT = 30; // Max calls per minute
const HOUR_LIMIT = 200; // Max calls per hour

// Track call history
const callHistory: number[] = [];

function checkRateLimit(): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    
    // Remove calls older than 1 hour
    while (callHistory.length > 0 && callHistory[0] < now - 3600000) {
        callHistory.shift();
    }

    // Count calls in last minute
    const minuteCount = callHistory.filter(t => t > now - 60000).length;
    
    // Check limits
    if (minuteCount >= MINUTE_LIMIT) {
        const retryAfter = 60000 - (now - callHistory[callHistory.length - MINUTE_LIMIT]);
        return { allowed: false, retryAfter };
    }
    if (callHistory.length >= HOUR_LIMIT) {
        const retryAfter = 3600000 - (now - callHistory[0]);
        return { allowed: false, retryAfter };
    }

    // Add current call to history
    callHistory.push(now);
    return { allowed: true };
}

type CreateParams = Parameters<typeof openai.chat.completions.create>;

async function callAIInternal(...args: CreateParams) {
    const { allowed, retryAfter } = checkRateLimit();
    if (!allowed) {
        throw new Error(
            `Rate limit exceeded. Try again in ${Math.ceil((retryAfter || 0) / 1000)} seconds`,
        );
    }

    return openai.chat.completions.create(...args);
}

// Throttle to 1 call every 500ms
export const ai = throttle(callAIInternal, 500, {
    leading: true,
    trailing: false
});
