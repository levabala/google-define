import { DBWord } from "../types";

export function sortWordsByStatus(words: DBWord[]) {
    // Sort words by status priority (none -> to learn -> learned) then alphabetically
    const statusOrder = { undefined: 0, TO_LEARN: 1, LEARNED: 2 };
    return [...words].sort((a, b) => {
        const statusA = statusOrder[a.status as keyof typeof statusOrder] || 0;
        const statusB = statusOrder[b.status as keyof typeof statusOrder] || 0;
        if (statusA !== statusB) return statusA - statusB;
        return a.word.localeCompare(b.word);
    });
}
