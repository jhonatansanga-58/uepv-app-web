import "../globals.css";
import "../input.css";
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
