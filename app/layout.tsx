import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getGlobalSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

import ClientLayout from "@/components/ClientLayout";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LanguageProvider } from "@/context/LanguageContext";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalSettings();
  const title = settings.siteTitle || "Professional Portfolio | Network & Software Engineer";
  const description = settings.siteDescription || "Explore the portfolio of a dedicated Network and Software Engineer specializing in modern web apps and robust network solutions.";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${title.split('|')[0].trim()}`
    },
    description: description,
    keywords: ["Software Engineer", "Network Engineer", "Portfolio", "Next.js", "React", "Cisco"],
    authors: [{ name: "Maulido" }],
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': baseUrl,
        'id': `${baseUrl}?lang=id`,
        'x-default': baseUrl,
      },
    },
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": settings.siteTitle || "Professional Portfolio | Network & Software Engineer",
        "description": settings.siteDescription,
        "inLanguage": "en-US",
      },
      {
        "@type": "Person",
        "@id": `${baseUrl}/#person`,
        "name": "Maulido",
        "url": baseUrl,
        "jobTitle": "Network Specialist & Full Stack Software Engineer",
        "description": settings.siteDescription,
        "knowsAbout": [
          "Network Engineering",
          "Routing & Switching",
          "Cisco",
          "MikroTik",
          "BGP & OSPF",
          "Software Engineering",
          "Full-Stack Web Development",
          "Next.js",
          "React",
          "TypeScript",
          "Cloud Architecture",
          "DevOps & CI/CD",
          "Docker",
          "Network Security"
        ],
        "sameAs": [
          settings.socialGithub || "https://github.com",
          settings.socialLinkedin || "https://linkedin.com",
          settings.socialTwitter || "https://twitter.com",
        ].filter(Boolean),
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://utfs.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://utfs.io" />
        <link rel="alternate" hrefLang="x-default" href={baseUrl} />
        <link rel="alternate" hrefLang="en" href={baseUrl} />
        <link rel="alternate" hrefLang="id" href={`${baseUrl}?lang=id`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID || ""} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider>
            <div className="fixed inset-0 -z-10 hidden dark:block bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
            <AnalyticsTracker />
            <ClientLayout settings={settings}>
              {children}
            </ClientLayout>
            <ScrollToTop />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
