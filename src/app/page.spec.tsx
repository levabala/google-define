import { test, expect, vi } from "bun:test";
import { screen, render, waitFor } from "@testing-library/react";
import { createWrapper } from './test-utils';
import Page from './page';
import { DBWord } from './types';

const mockWords: DBWord[] = [
    {
        word: 'apple',
        status: 'TO_LEARN',
        raw: {
            word: 'apple',
            results: [],
            pronunciation: { all: 'ap-uhl' }
        },
        ai_definition: null,
        created_at: new Date().toISOString()
    },
    {
        word: 'banana',
        status: 'LEARNED',
        raw: {
            word: 'banana',
            results: [],
            pronunciation: { all: 'buh-nan-uh' }
        },
        ai_definition: null,
        created_at: new Date().toISOString()
    },
    {
        word: 'cherry',
        status: 'HIDDEN',
        raw: {
            word: 'cherry',
            results: [],
            pronunciation: { all: 'cher-ee' }
        },
        ai_definition: null,
        created_at: new Date().toISOString()
    }
];

test("all words are fetched and displayed, except the hidden ones", async () => {
    // Mock the fetch implementation
    global.fetch = vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockWords),
        })
    );

    const Wrapper = createWrapper();
    
    render(
        <Wrapper>
            <Page />
        </Wrapper>
    );

    // Wait for words to be loaded
    await waitFor(() => {
        // Check visible words
        expect(screen.getByText('apple')).toBeInTheDocument();
        expect(screen.getByText('banana')).toBeInTheDocument();
        
        // Check hidden word is not displayed
        expect(screen.queryByText('cherry')).not.toBeInTheDocument();
    });
});
