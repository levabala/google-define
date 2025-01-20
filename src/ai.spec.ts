import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ai, callHistory } from './ai';

// Mock OpenAI
mock.module('openai', () => {
    return {
        OpenAI: class {
            chat = {
                completions: {
                    create: () => {
                        // Simulate a real API call delay
                        return new Promise((resolve) => 
                            setTimeout(() => resolve({}), 10)
                        );
                    }
                }
            }
        }
    };
});

describe('AI Rate Limiting', () => {
    beforeEach(() => {
        // Reset call history before each test
        callHistory.length = 0;
    });

    it('should allow calls within rate limits', async () => {
        // Make 29 calls (1 under the minute limit) with proper timing
        const promises = [];
        for (let i = 0; i < 29; i++) {
            promises.push(ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            }));
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        await Promise.all(promises);
    });

    it('should throw error when minute limit is exceeded', async () => {
        // Make 30 calls to hit the limit
        for (let i = 0; i < 30; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            });
        }

        // 31st call should fail
        expect(
            ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            })
        ).rejects.toMatch(/Rate limit exceeded/i);
    });

    it('should throw error when hour limit is exceeded', async () => {
        // Make 200 calls to hit the hour limit
        for (let i = 0; i < 200; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            });
        }

        // 201st call should fail
        expect(
            ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            })
        ).rejects.toMatch(/Rate limit exceeded/i);
    });

    it('should throttle calls to 500ms', async () => {
        const start = Date.now();

        // Make 3 calls with proper timing
        await ai({
            model: 'gpt-3.5-turbo',
            messages: [],
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        await ai({
            model: 'gpt-3.5-turbo',
            messages: [],
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        await ai({
            model: 'gpt-3.5-turbo',
            messages: [],
        });

        const duration = Date.now() - start;
        expect(duration).toBeGreaterThanOrEqual(1000 - 1); // 2 intervals of 500ms with some tolerance
    });

    it('should allow calls after rate limit window passes', async () => {
        // Hit the minute limit
        for (let i = 0; i < 30; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            });
        }

        // Fast forward time by 61 seconds
        const originalDateNow = Date.now;
        Date.now = () => originalDateNow() + 61000;

        // Should allow new calls
        expect(
            ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            })
        ).resolves.toBeDefined();

        // Restore original Date.now
        Date.now = originalDateNow;
    });
});
