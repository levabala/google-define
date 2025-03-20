export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    console.log('------- vocabulary layout', typeof window);

    return (
        <main className="bg-background flex h-screen flex-col gap-2 p-2 max-w-[500px] mx-auto">
            {children}
        </main>
    );
}
