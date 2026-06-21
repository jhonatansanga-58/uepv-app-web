import "../globals.css";
export const metadata = {
    title: "Iniciar sesión",
};

export default function AuthRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
