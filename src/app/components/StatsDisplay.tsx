import { WordStats } from '../types';
import { useQueryGetPronunciationStats } from '../hooks/useQueryGetPronunciationStats';
import { useQueryGetRecentPronunciations } from '../hooks/useQueryGetRecentPronunciations';

type Props = {
    stats: WordStats | undefined;
    word: string;
    isLoading: boolean;
    recentGuesses?: boolean[];
};

const emptyStats: WordStats = {
    total: 0,
    successful: 0,
    failed: 0,
    ratio: 0,
};

export function StatsDisplay({ stats, word, isLoading, recentGuesses }: Props) {
    const pronunciationQuery = useQueryGetPronunciationStats(word);
    const recentPronunciationsQuery = useQueryGetRecentPronunciations(word);

    const pronunciationStats = pronunciationQuery.data ?? emptyStats;
    const recentPronunciations = recentPronunciationsQuery.data ?? [];

    if (!word) return null;

    if (isLoading) {
        return (
            <div className="text-white text-sm inline-flex gap-3 items-center opacity-50">
                <span className="opacity-70">Stats:</span>
                <span>Loading...</span>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="text-white text-sm flex flex-wrap gap-x-3 gap-y-1 items-baseline">
            <span className="opacity-70">Stats:</span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <div
                    title="Definition guesses"
                    className="flex items-center gap-1"
                >
                    <div>
                        📖
                        <span className="text-green-400">
                            ✓{stats?.successful ?? 0}
                        </span>
                        <span className="text-red-400">
                            ✗{stats?.failed ?? 0}
                        </span>
                        <span>({((stats?.ratio ?? 0) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => {
                            const guess = recentGuesses?.slice(-5).reverse()[
                                index
                            ];
                            return (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${
                                        guess === undefined
                                            ? 'bg-gray-400 opacity-20'
                                            : guess
                                              ? 'bg-green-400'
                                              : 'bg-red-400'
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>
                <div
                    title="Pronunciation attempts"
                    className="flex items-center gap-1"
                >
                    <div>
                        🎤
                        <span className="text-green-400">
                            ✓{pronunciationStats.successful}
                        </span>
                        <span className="text-red-400">
                            ✗{pronunciationStats.failed}
                        </span>
                        <span>
                            ({(pronunciationStats.ratio * 100).toFixed(0)}%)
                        </span>
                    </div>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => {
                            const pronunciation = recentPronunciations
                                .slice()
                                .reverse()[index];
                            return (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${
                                        pronunciation === undefined
                                            ? 'bg-gray-400 opacity-20'
                                            : pronunciation
                                              ? 'bg-green-400'
                                              : 'bg-red-400'
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
