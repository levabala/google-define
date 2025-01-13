import { useMutation } from '@tanstack/react-query';

type TrainingGuessParams = {
    word: string;
    success: boolean;
    definition: string;
};

export function useMutationTrainingGuess() {
    return useMutation({
        mutationFn: async ({ word, success, definition }: TrainingGuessParams) => {
            const response = await fetch('/api/training/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word, success, definition }),
            });
            return response.json();
        },
    });
}
