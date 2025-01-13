import { WordStats } from '../types';

type Props = {
    stats: WordStats | undefined;
    word: string;
    isLoading: boolean;
    recentGuesses?: boolean[];
};

export function StatsDisplay({ stats, word, isLoading, recentGuesses }: Props) {
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
        <div className="text-white text-sm inline-flex gap-3 items-center align-baseline">
            <span className="opacity-70">Stats:</span>
            <span className="text-green-400">✓{stats.successful}</span>
            <span className="text-red-400">✗{stats.failed}</span>
            <span>({(stats.ratio * 100).toFixed(0)}%)</span>
            {recentGuesses && recentGuesses.length > 0 && (
                <div className="flex gap-1 ml-2">
                    {recentGuesses.slice(-5).map((success, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                                success ? 'bg-green-400' : 'bg-red-400'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
