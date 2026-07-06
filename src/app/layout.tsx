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
      <body className="font-sans antialiased">
        <CursorGlow />
        <NavigationBanner />
        {children}
      </body>
    </html>
  );
}
