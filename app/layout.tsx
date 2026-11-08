import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UpdateMeOnAI · Newest AI tools, models & updates",
  description:
    "Daily summaries of the newest AI tools, models, and updates, with links to the original reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
