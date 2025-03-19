import { useQueryState } from "nuqs";

export function useShouldRequestAIDefinitionQueryState() {
    const [shouldRequestAIDefinition, setShouldRequestAIDefinition] =
        useQueryState("should-request-ai-definition");

    return {
        shouldRequestAIDefinition: shouldRequestAIDefinition === "1",
        setShouldRequestAIDefinition: (value: boolean) =>
            setShouldRequestAIDefinition(value ? "1" : null),
    };
}
