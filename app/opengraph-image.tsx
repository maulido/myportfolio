import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Portfolio Website';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.1) 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            fontSize: 80,
                            fontWeight: 'bold',
                            color: 'white',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Antigravity Portfolio
                    </div>
                    <div
                        style={{
                            fontSize: 40,
                            background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 600,
                        }}
                    >
                        Full Stack Developer & Designer
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 60,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <div
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#22c55e',
                            boxShadow: '0 0 10px #22c55e',
                        }}
                    />
                    <div style={{ fontSize: 24, color: '#a1a1aa' }}>Available for Hire</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
