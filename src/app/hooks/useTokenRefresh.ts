import { useEffect } from "react";

export function useTokenRefresh() {
    useEffect(() => {
        const refreshToken = async () => {
            try {
                const response = await fetch("/api/refresh", {
                    method: "POST",
                    credentials: "include",
                });

                if (!response.ok) {
                    console.log("Token refresh failed");
                    window.location.href = "/login";
                }
            } catch (error) {
                console.log("Token refresh error:", error);
            }
        };

        const interval = setInterval(
            () => {
                refreshToken();
            },
            6 * 24 * 60 * 60 * 1000,
        ); // Refresh every 6 days

        return () => clearInterval(interval);
    }, []);
}
