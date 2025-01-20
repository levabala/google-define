import { OpenAI } from "openai";
import throttle from "lodash.throttle";

// Rate limiting configuration
export const MINUTE_LIMIT = 30; // Max calls per minute
export const HOUR_LIMIT = 200; // Max calls per hour
export const MINUTE_MS = 60000; // Milliseconds in a minute
export const HOUR_MS = 3600000; // Milliseconds in an hour
export const THROTTLE_MS = 500; // Throttle delay in milliseconds

// Track call history (exported for testing)
export const callHistory: number[] = [];

function checkRateLimit(): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();

    // Remove calls older than 1 hour
    while (callHistory.length > 0 && callHistory[0] < now - HOUR_MS) {
        callHistory.shift();
    }

    // Count calls in last minute
    const minuteCount = callHistory.filter((t) => t > now - MINUTE_MS).length;

    // Check limits
    if (callHistory.length >= HOUR_LIMIT) {
        const retryAfter = HOUR_MS - (now - callHistory[0]);
        return { allowed: false, retryAfter };
    }
    if (minuteCount >= MINUTE_LIMIT) {
        const retryAfter =
            MINUTE_MS - (now - callHistory[callHistory.length - MINUTE_LIMIT]);
        return { allowed: false, retryAfter };
    }

    // Add current call to history
    callHistory.push(now);
    return { allowed: true };
}

type CreateParams = Parameters<typeof openai.chat.completions.create>;

let openai: OpenAI;
async function callAIInternal(...args: CreateParams) {
    if (!openai) {
        openai = new OpenAI({
            baseURL: "https://api.deepseek.com",
            apiKey: process.env.DEEPSEEK_API_KEY,
        });
    }

    const { allowed, retryAfter } = checkRateLimit();
    if (!allowed) {
        const error = new Error(
            `Rate limit exceeded. Try again in ${Math.ceil((retryAfter || 0) / 1000)} seconds`,
        );
        error.name = 'RateLimitError';
        throw error;
    }

    return await openai.chat.completions.create(...args);
}

// Throttle to 1 call every 500ms
export const ai = throttle(callAIInternal, THROTTLE_MS, {
    leading: true,
    trailing: false,
});
