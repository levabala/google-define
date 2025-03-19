import { useQueryState } from "nuqs";

export function useQuizQueryState() {
    const [isQuizMode, setIsQuizMode] = useQueryState("quiz");

    return {
        isQuizMode: isQuizMode === "1",
        setIsQuizMode: (value: boolean) => setIsQuizMode(value ? "1" : null),
    };
}
