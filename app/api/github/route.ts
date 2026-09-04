import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600; // Cache on server for 1 hour

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "maulido";

    try {
        const headers: HeadersInit = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Portfolio-Website",
        };

        const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
            {
                headers,
                next: { revalidate: 3600 }
            }
        );

        if (!res.ok) {
            console.warn(`GitHub API returned status ${res.status}`);
            return NextResponse.json({
                success: false,
                data: [],
                status: res.status
            }, {
                status: 200, // Return 200 with empty array so UI degrades gracefully
                headers: {
                    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
                }
            });
        }

        interface GitHubRepo {
            id: number;
            name: string;
            description?: string | null;
            html_url: string;
            stargazers_count?: number;
            forks_count?: number;
            language?: string | null;
            updated_at?: string;
        }

        const rawData = await res.json();
        const repos = Array.isArray(rawData) ? (rawData as GitHubRepo[]).map((repo) => ({
            id: repo.id,
            name: repo.name,
            description: repo.description || "",
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count || 0,
            forks_count: repo.forks_count || 0,
            language: repo.language || "",
            updated_at: repo.updated_at
        })) : [];

        return NextResponse.json({
            success: true,
            data: repos
        }, {
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
            }
        });
    } catch (error) {
        console.error("Error fetching GitHub repos:", error);
        return NextResponse.json({
            success: false,
            data: []
        }, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
            }
        });
    }
}
