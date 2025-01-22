import { toast } from "react-toastify";
import { Definitions } from "./Definitions";
import { DefinitionsTrain } from "./DefinitionsTrain";
import { SpellingTrain } from "./SpellingTrain";
import { Spinner } from "./Spinner";
import { DBWord } from "../types";
import { useMutationTrainingGuess } from "../hooks/useMutationTrainingGuess";

export type TrainingMode = "definition" | "spelling";

export type MainBodyProps = {
    isFetchingWordCurrent: boolean;
    isTraining: boolean;
    wordCurrent: DBWord;
    wordToTrain: DBWord | null;
    wordsAll: DBWord[];
    textSourceSubmitted: string;
    setTextSourceCurrent: (text: string) => void;
    setTextSourceSubmitted: (text: string) => void;
    trainingMode: TrainingMode;
    onWordClickCommon: (word: string, addToLearn?: boolean) => void;
    wordToTrainNext: string | null;
};

export function MainBody({
    isFetchingWordCurrent,
    isTraining,
    setIsTraining,
    wordCurrent,
    wordToTrain,
    wordsAll,
    textSourceSubmitted,
    setTextSourceCurrent,
    setTextSourceSubmitted,
    trainingMode,
    onWordClickCommon,
    wordToTrainNext,
}: MainBodyProps) {
    const trainingGuessMutation = useMutationTrainingGuess();

    if (isFetchingWordCurrent) {
        return <Spinner />;
    }

    if (isTraining && wordToTrain && wordsAll) {
        if (trainingMode === "spelling") {
            return (
                <SpellingTrain
                    word={wordToTrain}
                    definition={
                        wordToTrain.ai_definition?.definition ||
                        wordToTrain.raw.results?.[0]?.definition ||
                        "No definition available"
                    }
                    onSuccess={() => {
                        trainingGuessMutation.mutate({
                            word: textSourceSubmitted,
                            success: true,
                            definition: "spelling_correct",
                        });
                        toast.success("Perfect spelling! 🎉");
                    }}
                    onFailure={(errors) => {
                        trainingGuessMutation.mutate({
                            word: textSourceSubmitted,
                            success: false,
                            definition: `spelling_errors:${errors}`,
                        });
                        toast.error(`Spelling errors: ${errors} ❌`);
                    }}
                    onNext={() => {
                        if (!wordToTrainNext) {
                            setIsTraining(false);
                            return;
                        }
                        setTextSourceCurrent(wordToTrainNext);
                        setTextSourceSubmitted(wordToTrainNext);
                    }}
                />
            );
        }

        if (trainingMode === "definition") {
            return (
                <DefinitionsTrain
                    results={wordToTrain.raw.results}
                    wordsAll={wordsAll}
                    word={wordToTrain}
                    onWordClick={(word, addToLearn) => {
                        onWordClickCommon(word, addToLearn);
                        setIsTraining(false);
                    }}
                    onSuccess={(definition) => {
                        if (!textSourceSubmitted) return;
                        trainingGuessMutation.mutate({
                            word: textSourceSubmitted,
                            success: true,
                            definition: definition,
                        });
                    }}
                    onFailure={(definition) => {
                        if (!textSourceSubmitted) return;
                        trainingGuessMutation.mutate({
                            word: textSourceSubmitted,
                            success: false,
                            definition: definition,
                        });
                    }}
                    onNext={() => {
                        if (!wordToTrainNext) {
                            setIsTraining(false);
                            return;
                        }

                        setTextSourceCurrent(wordToTrainNext);
                        setTextSourceSubmitted(wordToTrainNext);
                    }}
                />
            );
        }
    }

    return (
        <Definitions
            results={wordCurrent.raw.results}
            textSourceSubmitted={textSourceSubmitted}
            onWordClick={onWordClickCommon}
            aiDefinition={wordCurrent.ai_definition || undefined}
            wordsAll={wordsAll}
        />
    );
}
