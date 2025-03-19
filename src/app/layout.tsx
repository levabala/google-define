import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import type { Metadata } from "next";
import { Toast } from "./toast";
import "./globals.css";

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
        <html className="dark">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if (new URL(window.location).searchParams.get('exit') === "1") {
                                window.close();
                            }
                        `,
                    }}
                />
                <NuqsAdapter>
                    <Providers>{children}</Providers>
                </NuqsAdapter>
                <Toast />
            </body>
        </html>
    );
}
