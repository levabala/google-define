import { useQueryState } from "nuqs";

export function useCurrentWordStr() {
    const [currentWordStr, setCurrentWordStr] = useQueryState("word", {
        history: "push",
    });

    return { currentWordStr, setCurrentWordStr };
}
