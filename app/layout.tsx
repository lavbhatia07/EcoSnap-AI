import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoSnap AI – Snap. Analyze. Reduce.",
  description: "Upload or capture a photo and discover its carbon footprint instantly using AI Vision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
