import { useQuery } from "@tanstack/react-query";
import { sortWordsAll } from "../helpers";
import { useTRPC } from "../trpc/client";
import { useMemo } from "react";

export function useWordsAllQuery() {
    const trpc = useTRPC();

    const query = useQuery(
        trpc.getWordsAll.queryOptions(undefined, {
            refetchOnMount: false,
        }),
    );

    const data = useMemo(() => {
        return query.data ? sortWordsAll(query.data) : query.data;
    }, [query.data]);

    return useMemo(() => {
        return {
            ...query,
            data,
        };
    }, [query, data]);
}
