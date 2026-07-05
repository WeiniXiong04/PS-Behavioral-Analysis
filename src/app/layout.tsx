import type { Metadata } from "next";
import "./globals.css";
import { CursorGlow } from "@/components/CursorGlow";
import { NavigationBanner } from "@/components/NavigationBanner";

export const metadata: Metadata = {
  title: "Public Space Behavior Analysis Platform",
  description:
    "A deployable prototype for loading a public space model, defining analysis scale, and generating plan and 3D overlays."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Doto:wght@400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <CursorGlow />
        <NavigationBanner />
        {children}
      </body>
    </html>
  );
}
