import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Uses & Setup | Maulido's Portfolio",
    description: "A detailed list of hardware, software, networking equipment, development tools, and desk setup I use daily.",
    openGraph: {
        title: "Uses & Setup | Maulido's Portfolio",
        description: "A detailed list of hardware, software, networking equipment, development tools, and desk setup I use daily.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Uses & Setup | Maulido's Portfolio",
        description: "A detailed list of hardware, software, networking equipment, development tools, and desk setup I use daily.",
    },
};

export default function UsesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
