import { Tables } from "@/database.types";

export function sortWordsAll(wordsAll: Tables<'word'>[]) {
    return wordsAll.slice().sort((a,b) => {
        if (a.status === 'LEARNED' && b.status !== 'LEARNED') {
            return 1;
        }

        if (a.status !== 'LEARNED' && b.status === 'LEARNED') {
            return -1;
        }

        if (a.created_at < b.created_at) {
            return 1;
        }

        if (a.created_at > b.created_at) {
            return -1;
        }

        return 0;
    })
}
