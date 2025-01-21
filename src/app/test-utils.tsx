import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

export const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    const WrapperComponent = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <div role="main">{children}</div>
        </QueryClientProvider>
    );
    WrapperComponent.displayName = "TestWrapper";
    return WrapperComponent;
};
