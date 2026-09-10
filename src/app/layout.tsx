import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GNF Esports - Admin & Moderation Console",
  description: "Esports Tournament Control & Room ID Vault",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0E131F] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
