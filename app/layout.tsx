import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingActionButton from "@/components/FAB";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Professional Portfolio | Network & Software Engineer",
  description: "Explore the portfolio of a dedicated Network and Software Engineer specializing in modern web apps and robust network solutions.",
  keywords: ["Software Engineer", "Network Engineer", "Portfolio", "Next.js", "React", "Cisco"],
  authors: [{ name: "John Doe" }],
  openGraph: {
    title: "Professional Portfolio | John Doe",
    description: "Digital Creator: Building robust network infrastructures and scalable web applications.",
    url: "https://your-domain.com",
    siteName: "John Doe Portfolio",
    images: [
      {
        url: "/og-image.png", // Make sure this exists in public/
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "John Doe | Network & Software Engineer",
    description: "Building robust network infrastructures and scalable web applications.",
    images: ["/og-image.png"],
  },
};

import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { ScrollProgress, BackToTop } from "@/components/Widgets";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID || ""} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
          <AnalyticsTracker />
          <ScrollProgress />
          <ClientLayout>
            {children}
          </ClientLayout>
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
