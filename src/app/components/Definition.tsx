import { Fragment } from 'react';
import { Word } from './Word';
import { Examples } from './Examples';
import { DBWord, WordData } from '../types';

type DefinitionProps = {
    result: NonNullable<WordData['results']>[number];
    wordsAll?: DBWord[];
    textSourceSubmitted: string | null;
    onWordClick: (word: string, addToLearn?: boolean) => void;
    hideExamples?: boolean;
    disableWordClick?: boolean;
    word: string;
    useMutationAIDefinition: () => ReturnType<typeof useMutationAIDefinition>
};

export function Definition({
    result,
    wordsAll,
    textSourceSubmitted,
    onWordClick,
    hideExamples,
    disableWordClick,
    word,
    useMutationAIDefinition,
}: DefinitionProps) {
    const aiDefinition = wordsAll?.find(w => w.word === word)?.raw.ai_definition;
    const mutation = useMutationAIDefinition();
    return (
        <div className="text-white">
            {result.partOfSpeech && (
                <span className="font-bold">{result.partOfSpeech}: </span>
            )}
            {result.definition.split(' ').map((word: string, wordIndex: number, array: string[]) => (
                <Fragment key={`${word}-${wordIndex}`}>
                    <Word
                        word={word}
                        allWords={wordsAll}
                        currentWord={textSourceSubmitted}
                        onClick={onWordClick}
                        disableWordClick={disableWordClick}
                    />
                    {wordIndex < array.length - 1 ? ' ' : ''}
                </Fragment>
            ))}
            {aiDefinition && (
                <div className="mt-2 p-2 bg-blue-900 rounded">
                    <div className="text-sm text-blue-300 mb-1 flex items-center gap-2">
                        <span>AI Definition</span>
                        <span className="bg-blue-700 text-white px-2 py-1 rounded text-xs">AI</span>
                    </div>
                    <p className="text-white">{aiDefinition.definition}</p>
                    {aiDefinition.examples && aiDefinition.examples.length > 0 && (
                        <Examples
                            examples={aiDefinition.examples}
                            wordsAll={wordsAll}
                            textSourceSubmitted={textSourceSubmitted}
                            onWordClick={onWordClick}
                        />
                    )}
                </div>
            )}
            
            {!aiDefinition && textSourceSubmitted === word && (
                <button
                    onClick={() => mutation.mutate(word)}
                    className="mt-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? 'Generating...' : 'Generate AI Definition'}
                </button>
            )}

            {!hideExamples && result.examples && result.examples.length > 0 && (
                <Examples
                    examples={result.examples}
                    wordsAll={wordsAll}
                    textSourceSubmitted={textSourceSubmitted}
                    onWordClick={onWordClick}
                />
            )}
        </div>
    );
}
