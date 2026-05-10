import type { Metadata, Viewport } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "X-Hydride Lab",
    template: "%s — X-Hydride Lab",
  },
  description:
    "A Grok-native AI discovery platform for hydride-based superconductors. Extending the Grokene framework into structured candidate generation, scoring, simulation preparation, and open DeSci research documentation.",
  applicationName: "X-Hydride Lab",
  keywords: [
    "X-Hydride Lab",
    "hydride superconductors",
    "DeSci",
    "Grokene",
    "xAI Grok",
    "AI research",
  ],
  authors: [{ name: "X-Hydride Lab" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "X-Hydride Lab",
    description:
      "A Grok-native AI discovery platform for hydride-based superconductors.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0c13",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${orbitron.variable}`}>
      <body className="min-h-screen bg-graphite-950 text-graphite-100 antialiased">
        {children}
      </body>
    </html>
  );
}
