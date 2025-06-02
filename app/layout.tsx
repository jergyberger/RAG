import "./global.css";

export const metadata = {
    title: "Portfolio-RAG",
    description: "Here you can ask questions about Jørgen - mostly academic and professional.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
