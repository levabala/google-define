import { removeNonAlphanumeric } from "./utils";
import { Word } from "./types";

export function sortWordsAll(wordsAll: Word[]) {
    return wordsAll.slice().sort((a, b) => {
        if (a.status === "LEARNED" && b.status !== "LEARNED") {
            return 1;
        }

        if (a.status !== "LEARNED" && b.status === "LEARNED") {
            return -1;
        }

        if (a.createdAt < b.createdAt) {
            return 1;
        }

        if (a.createdAt > b.createdAt) {
            return -1;
        }

        return 0;
    });
}

export function normalizeWord(str: string): string {
    return removeNonAlphanumeric(str).trim().toLowerCase();
}

export function areWordsEqual(w1: string, w2: string) {
    return normalizeWord(w1) === normalizeWord(w2);
}
