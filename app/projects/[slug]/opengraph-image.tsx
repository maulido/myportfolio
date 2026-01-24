import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Project Detail';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/projects?slug=${slug}`, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) throw new Error('Failed to fetch project');

        const data = await response.json();
        const project = data.data?.[0]; // API returns array when searching by slug

        if (!project) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#000',
                            color: 'white',
                            fontSize: 60,
                        }}
                    >
                        Project Not Found
                    </div>
                ),
                { ...size }
            );
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#000',
                    }}
                >
                    {/* Background Image/Gradient */}
                    {project.imageUrl ? (
                        <img
                            src={project.imageUrl}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.3,
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
                            }}
                        />
                    )}

                    {/* Content Overlay */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            padding: '80px',
                            zIndex: 10,
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div
                                style={{
                                    fontSize: 80,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    lineHeight: 1.1,
                                }}
                            >
                                {project.title}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {project.technologies?.slice(0, 5).map((tech: string, i: number) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '8px 20px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '24px',
                                            color: '#e2e8f0',
                                            fontSize: 24,
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                        }}
                                    >
                                        {tech}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 32,
                                    color: '#94a3b8',
                                    maxWidth: '800px',
                                }}
                            >
                                {project.description?.substring(0, 120)}
                                {project.description?.length > 120 ? '...' : ''}
                            </div>
                            <div
                                style={{
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                }}
                            >
                                View Project
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            { ...size }
        );
    } catch (error) {
        console.error('Project OG Error:', error);
        return new ImageResponse(
            (
                <div style={{ width: '100%', height: '100%', background: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 40 }}>
                    Error Generating Image
                </div>
            ),
            { ...size }
        );
    }
}
