import { WordStats } from '../types';

type Props = {
    stats: WordStats | undefined;
    word: string;
    isLoading: boolean;
};

export function StatsDisplay({ stats, word, isLoading }: Props) {
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
        <div className="text-white text-sm inline-flex gap-3 items-center">
            <span className="opacity-70">Stats:</span>
            <span className="text-green-400">✓{stats.successful}</span>
            <span className="text-red-400">✗{stats.failed}</span>
            <span>({(stats.ratio * 100).toFixed(0)}%)</span>
        </div>
    );
}
