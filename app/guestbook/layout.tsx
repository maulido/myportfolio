import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Guestbook | Maulido's Portfolio",
    description: "Leave a message, note, feedback, or say hello on my public guestbook wall.",
    openGraph: {
        title: "Guestbook | Maulido's Portfolio",
        description: "Leave a message, note, feedback, or say hello on my public guestbook wall.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Guestbook | Maulido's Portfolio",
        description: "Leave a message, note, feedback, or say hello on my public guestbook wall.",
    },
};

export default function GuestbookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
