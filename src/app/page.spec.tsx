import { test, expect } from "bun:test";
import { screen, render } from "@testing-library/react";
import { Main } from "./page";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock data
const mockWords = [
    { word: 'apple', status: 'KNOWN' },
    { word: 'banana', status: 'TO_LEARN' },
    { word: 'cherry', status: 'HIDDEN' }
];

// Mock useQueryGetWordsAll hook
jest.mock('./hooks/useQueryGetWordsAll', () => ({
    useQueryGetWordsAll: () => ({
        data: mockWords,
        isLoading: false
    })
}));

test("all words are fetched and displayed, except the hidden ones", async () => {
    const queryClient = new QueryClient();
    
    render(
        <QueryClientProvider client={queryClient}>
            <Main />
        </QueryClientProvider>
    );

    // Check visible words
    expect(screen.getByText('apple')).toBeTruthy();
    expect(screen.getByText('banana')).toBeTruthy();
    
    // Verify hidden word is not displayed
    expect(screen.queryByText('cherry')).toBeNull();
});
