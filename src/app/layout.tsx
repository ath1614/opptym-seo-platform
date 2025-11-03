import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { Footer } from "@/components/footer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Opptym AI SEO Platform - Advanced SEO Optimization Tools",
    template: "%s | Opptym AI SEO Platform"
  },
  description: "Professional SEO optimization platform that helps businesses improve search rankings, analyze competitors, and drive organic traffic growth with advanced tools.",
  authors: [{ name: "Opptym SEO Platform" }],
  creator: "Opptym SEO Platform",
  publisher: "Opptym SEO Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://opptym.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://opptym.com",
    title: "Opptym SEO Platform - Advanced SEO Optimization Tools",
    description: "Professional SEO optimization platform that helps businesses improve their search engine rankings, analyze competitors, and drive organic traffic growth.",
    siteName: "Opptym SEO Platform",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Opptym SEO Platform - Advanced SEO Optimization Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Opptym SEO Platform - Advanced SEO Optimization Tools",
    description: "Professional SEO optimization platform that helps businesses improve their search engine rankings and drive organic traffic growth.",
    images: ["/logo.png"],
    creator: "@opptymseo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google68f6546bc9cf0b40",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="google68f6546bc9cf0b40" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PYDKFTN2WL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PYDKFTN2WL');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <ConditionalNavbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
