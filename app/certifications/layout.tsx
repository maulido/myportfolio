import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Certifications & Credentials | Maulido's Portfolio",
    description: "Professional certifications and verified credentials across networking, cloud infrastructure, and software development.",
    openGraph: {
        title: "Certifications & Credentials | Maulido's Portfolio",
        description: "Professional certifications and verified credentials across networking, cloud infrastructure, and software development.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Certifications & Credentials | Maulido's Portfolio",
        description: "Professional certifications and verified credentials across networking, cloud infrastructure, and software development.",
    },
};

export default function CertificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
