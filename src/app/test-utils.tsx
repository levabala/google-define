import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "./queryClient";

export const createWrapper = () => {
    const WrapperComponent = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <div role="main">{children}</div>
        </QueryClientProvider>
    );
    WrapperComponent.displayName = "TestWrapper";
    return WrapperComponent;
};
