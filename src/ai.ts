import OpenAI from 'openai';
import { funnel } from 'remeda';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

function callAIInternal(
    ...args: Parameters<typeof openai.chat.completions.create>
) {
    return openai.chat.completions.create(...args);
}

export const ai = funnel(callAIInternal, { minGapMs: 500, triggerAt: 'start' });
