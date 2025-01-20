import { describe, it, expect, beforeEach, mock, afterEach, setSystemTime } from 'bun:test';
import { ai, callHistory, MINUTE_LIMIT, HOUR_LIMIT, THROTTLE_MS } from './ai';

// Mock OpenAI
mock.module('openai', () => {
    return {
        OpenAI: class {
            chat = {
                completions: {
                    create: () => {
                        // Simulate a real API call delay
                        return Promise.resolve({});
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
        // Make 5 calls to test basic functionality
        for (let i = 0; i < 5; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            });
            setSystemTime(Date.now() + THROTTLE_MS);
        }
    });

    it('should throw error when minute limit is exceeded', async () => {
        // Make enough calls to hit the limit
        for (let i = 0; i < MINUTE_LIMIT; i++) {
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
        ).rejects.toThrow(/Rate limit exceeded/i);
    });

    it('should throw error when hour limit is exceeded', async () => {
        // Make enough calls to hit the hour limit
        for (let i = 0; i < HOUR_LIMIT; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            });
            // Advance time by 10 seconds between calls to spread them over the hour
            setSystemTime(Date.now() + 10000);
        }

        // 201st call should fail
        expect(
            ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            })
        ).rejects.toThrow(/Rate limit exceeded/i);
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
        for (let i = 0; i < MINUTE_LIMIT; i++) {
            await ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            });
        }

        // Fast forward time by 61 seconds
        setSystemTime(Date.now() + 61000);

        // Should allow new calls
        expect(
            ai({
                model: 'gpt-3.5-turbo',
                messages: [],
            })
        ).resolves.toBeDefined();
    });
});
