import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

const appName = "Darts Score";

export const metadata: Metadata = {
  title: appName,
  description: "Калькулятор для подсчёта очков в дартс",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
