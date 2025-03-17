import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Providers } from "./v1/providerss";
import "./globals.css";
import { Toast } from "./v1/toastt";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Define",
    description: "Define - personal dictionary",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`dark ${geistSans.variable} ${geistMono.variable}`}
            >
                <NuqsAdapter>
                    <Providers>{children}</Providers>
                </NuqsAdapter>
                <Toast />
            </body>
        </html>
    );
}
