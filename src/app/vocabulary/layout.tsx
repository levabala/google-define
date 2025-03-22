export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="bg-background flex h-screen flex-col gap-2 p-2 max-w-[500px] mx-auto">
            {children}
        </main>
    );
}
