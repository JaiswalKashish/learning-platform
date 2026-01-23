import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "EduVerse – Immersive Smart Learning Platform",
  description: "Learn Science in 3D, VR, and AI. Interactive learning platform for Class 6-12 students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="d887b428-a1a0-458d-9b07-a20399f293b4"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <div className="min-h-screen mesh-gradient">
          <Header />
          {children}
        </div>
        <Toaster />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
