export type WordData = {
    word: string;
    results: {
        definition: string;
        partOfSpeech: string | null;
        synonyms?: string[];
        instanceOf?: string[];
        hasInstances?: string[];
        typeOf?: string[];
        hasTypes?: string[];
        examples?: string[];
        hasCategories?: string[];
        hasParts?: string[];
        derivation?: string[];
        partOf?: string[];
    }[];
    syllables: {
        count: number;
        list: string[];
    };
    pronunciation: {
        all: string;
    };
    frequency: number;
};

export type WordStatus = 'NONE' | 'TO_LEARN' | 'LEARNED' | 'HIDDEN';

export type DBWord = {
    word: string;
    raw: WordData;
    status: WordStatus;
    created_at: string;
};

export type WordStats = {
    total: number;
    successful: number;
    failed: number;
    ratio: number;
};
