import { ImageResponse } from 'next/og';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

export const runtime = 'edge';
export const alt = 'Blog Post';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    try {
        await dbConnect();
        const post = await Post.findOne({ slug }).lean();

        if (!post) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#000',
                            backgroundImage: 'linear-gradient(to bottom right, #1a1a1a, #000)',
                        }}
                    >
                        <div style={{ fontSize: 60, color: 'white' }}>Post Not Found</div>
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
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        backgroundColor: '#000',
                        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '80px',
                    }}
                >
                    {/* Title */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 72,
                                fontWeight: 'bold',
                                color: 'white',
                                lineHeight: 1.2,
                                maxWidth: '1000px',
                            }}
                        >
                            {post.title}
                        </div>
                        {post.excerpt && (
                            <div
                                style={{
                                    fontSize: 32,
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    maxWidth: '900px',
                                    lineHeight: 1.4,
                                }}
                            >
                                {post.excerpt.substring(0, 150)}
                                {post.excerpt.length > 150 ? '...' : ''}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 28,
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: '600',
                            }}
                        >
                            Portfolio Blog
                        </div>
                        <div
                            style={{
                                fontSize: 24,
                                color: 'rgba(255, 255, 255, 0.7)',
                            }}
                        >
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>
                    </div>
                </div>
            ),
            { ...size }
        );
    } catch (error) {
        console.error('Error generating OG image:', error);
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
                    }}
                >
                    <div style={{ fontSize: 60, color: 'white' }}>Error Loading Image</div>
                </div>
            ),
            { ...size }
        );
    }
}
