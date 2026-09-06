import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post, { IPost } from "@/models/Post";
import { getGlobalSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await dbConnect();
        const settings = await getGlobalSettings();

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maulido.dev";
        const brandName = settings.brandName || "Maulido";
        const siteTitle = settings.siteTitle || `${brandName} - Portfolio & Technical Publications`;
        const siteDescription = settings.siteDescription || "Architectural post-mortems, hands-on tutorials, and engineering principles across networking and modern web development.";

        const posts = await Post.find({ published: true })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean() as unknown as IPost[];

        const safeCdata = (str: string = "") => str.replace(/]]>/g, "]]]]><![CDATA[>");

        const itemsXml = posts.map(post => {
            const postUrl = `${baseUrl}/blog/${post.slug}`;
            const pubDate = post.createdAt ? new Date(post.createdAt).toUTCString() : new Date().toUTCString();
            const category = post.category || "Engineering";
            const tagsXml = (post.tags || []).map(t => `<category><![CDATA[${safeCdata(t)}]]></category>`).join("\n        ");

            return `    <item>
      <title><![CDATA[${safeCdata(post.title)}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${safeCdata(post.excerpt || "")}]]></description>
      <category><![CDATA[${safeCdata(category)}]]></category>
      ${tagsXml}
    </item>`;
        }).join("\n");

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${safeCdata(siteTitle)}]]></title>
    <link>${baseUrl}/blog</link>
    <description><![CDATA[${safeCdata(siteDescription)}]]></description>
    <language>id, en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

        return new NextResponse(rssXml, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("Failed to generate RSS feed:", error);
        return new NextResponse("Failed to generate RSS feed", { status: 500 });
    }
}
