import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getGlobalSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import ClientLayout from "@/components/ClientLayout";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { ScrollProgress } from "@/components/Widgets";
import { ScrollToTop } from "@/components/ScrollToTop";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalSettings();
  const title = settings.siteTitle || "Professional Portfolio | Network & Software Engineer";
  const description = settings.siteDescription || "Explore the portfolio of a dedicated Network and Software Engineer specializing in modern web apps and robust network solutions.";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    title: {
      default: title,
      template: `%s | ${title.split('|')[0].trim()}`
    },
    description: description,
    keywords: ["Software Engineer", "Network Engineer", "Portfolio", "Next.js", "React", "Cisco"],
    authors: [{ name: "John Doe" }], // Ideally also dynamic
    openGraph: {
      title: title,
      description: description,
      url: process.env.NEXT_PUBLIC_BASE_URL,
      siteName: title,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: ["/og-image.png"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getGlobalSettings();

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
          <ClientLayout settings={settings}>
            {children}
          </ClientLayout>
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
