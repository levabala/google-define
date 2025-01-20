import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ai, callHistory } from './ai';
import OpenAI from 'openai';

// Mock OpenAI
vi.mock('openai', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: vi.fn().mockResolvedValue({})
                }
            }
        }))
    };
});

describe('AI Rate Limiting', () => {
    beforeEach(() => {
        // Reset call history before each test
        callHistory.length = 0;
    });

    it('should allow calls within rate limits', async () => {
        // Make 29 calls (1 under the minute limit)
        for (let i = 0; i < 29; i++) {
            await expect(ai({
                model: 'gpt-3.5-turbo',
                messages: []
            })).resolves.not.toThrow();
        }
    });

    it('should throw error when minute limit is exceeded', async () => {
        // Make 30 calls to hit the limit
        for (let i = 0; i < 30; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: []
            });
        }

        // 31st call should fail
        await expect(ai({
            model: 'gpt-3.5-turbo',
            messages: []
        })).rejects.toThrow('Rate limit exceeded');
    });

    it('should throw error when hour limit is exceeded', async () => {
        // Make 200 calls to hit the hour limit
        for (let i = 0; i < 200; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: []
            });
        }

        // 201st call should fail
        await expect(ai({
            model: 'gpt-3.5-turbo',
            messages: []
        })).rejects.toThrow('Rate limit exceeded');
    });

    it('should throttle calls to 500ms', async () => {
        const start = Date.now();
        
        // Make 3 calls
        await ai({
            model: 'gpt-3.5-turbo',
            messages: []
        });
        await ai({
            model: 'gpt-3.5-turbo',
            messages: []
        });
        await ai({
            model: 'gpt-3.5-turbo',
            messages: []
        });

        const duration = Date.now() - start;
        expect(duration).toBeGreaterThanOrEqual(1000); // 2 intervals of 500ms
    });

    it('should allow calls after rate limit window passes', async () => {
        // Hit the minute limit
        for (let i = 0; i < 30; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: []
            });
        }

        // Fast forward time by 61 seconds
        vi.useFakeTimers();
        vi.advanceTimersByTime(61000);

        // Should allow new calls
        await expect(ai({
            model: 'gpt-3.5-turbo',
            messages: []
        })).resolves.not.toThrow();
        vi.useRealTimers();
    });
});
