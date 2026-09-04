import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SearchProvider } from "@/components/layout/SearchProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const monoData = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-data",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tradehere.example"),
  title: {
    default: "Tradehere — Understand the markets",
    template: "%s · Tradehere",
  },
  description:
    "Explore markets, track opportunities, analyse investments and build your financial knowledge — all from one platform. Phase 1 preview with sample market data.",
  openGraph: {
    title: "Tradehere — Understand the markets",
    description:
      "One intelligent platform for understanding financial markets and making smarter financial decisions.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${monoData.variable}`}>
      <head>
        {/* Scroll-reveal sections start hidden; unhide them without JavaScript. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen antialiased">
        <SearchProvider>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </SearchProvider>
      </body>
    </html>
  );
}
