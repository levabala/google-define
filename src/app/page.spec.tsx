import { test, expect } from "bun:test";
import { screen, render, waitFor } from "@testing-library/react";
import { createWrapper } from './test-utils';
import { Main } from './page';
import { DBWord } from './types';
import { mockFetch } from '../testing-preload';

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
    mockFetch.mockImplementationOnce(async () => {
        return new Response(JSON.stringify(mockWords), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    });

    const Wrapper = createWrapper();
    
    render(
        <Wrapper>
            <Main />
        </Wrapper>
    );

    // Print snapshot of rendered HTML
    console.log(document.documentElement.outerHTML);

    // Wait for words to be loaded
    await waitFor(() => {
        // Check visible words
        expect(screen.getByText('apple')).toBeTruthy();
        expect(screen.getByText('banana')).toBeTruthy();
        
        // Check hidden word is not displayed
        expect(screen.queryByText('cherry')).toBeNull();
    });
});
