import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Gallery & Activities | Maulido's Portfolio",
    description: "Visual journey showcasing tech events, community engagements, workshops, and development milestones.",
    openGraph: {
        title: "Gallery & Activities | Maulido's Portfolio",
        description: "Visual journey showcasing tech events, community engagements, workshops, and development milestones.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Gallery & Activities | Maulido's Portfolio",
        description: "Visual journey showcasing tech events, community engagements, workshops, and development milestones.",
    },
};

export default function GalleryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
