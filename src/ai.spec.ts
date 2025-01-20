import { describe, it, expect, beforeEach, mock, afterEach, setSystemTime } from 'bun:test';
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
        // Start with current time
        setSystemTime(Date.now());
    });

    afterEach(() => {
        // Restore real time
        setSystemTime();
    });

    it('should allow calls within rate limits', async () => {
        // Make 29 calls (1 under the minute limit)
        for (let i = 0; i < 29; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            });
            setSystemTime(Date.now() + 500); // Advance time by 500ms
        }
    });

    it('should throw error when minute limit is exceeded', async () => {
        // Make 30 calls to hit the limit
        for (let i = 0; i < 30; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            });
            setSystemTime(Date.now() + 500); // Advance time by 500ms
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
            setSystemTime(Date.now() + 500); // Advance time by 500ms
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
        setSystemTime(Date.now() + 500);
        await ai({
            model: 'gpt-3.5-turbo',
            messages: [],
        });
        setSystemTime(Date.now() + 500);
        await ai({
            model: 'gpt-3.5-turbo',
            messages: [],
        });

        // Verify throttle timing
        expect(Date.now() - start).toBe(1000); // 2 intervals of 500ms
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
        setSystemTime(Date.now() + 61000);

        // Should allow new calls
        await expect(
            ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            })
        ).resolves.toBeDefined();
    });
});
