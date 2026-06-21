import "../globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
                <ToastContainer position="top-right" autoClose={4000} />
            </body>
        </html>
    );
}
