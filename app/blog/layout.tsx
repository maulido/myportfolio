import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Blog & Insights | Maulido's Portfolio",
    description: "Thoughts, tutorials, and insights on network engineering, software architecture, and modern web development.",
    openGraph: {
        title: "Blog & Insights | Maulido's Portfolio",
        description: "Thoughts, tutorials, and insights on network engineering, software architecture, and modern web development.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog & Insights | Maulido's Portfolio",
        description: "Thoughts, tutorials, and insights on network engineering, software architecture, and modern web development.",
    },
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
