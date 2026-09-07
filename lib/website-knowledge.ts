import dbConnect from "@/lib/db";
import Project, { IProject } from "@/models/Project";
import Post, { IPost } from "@/models/Post";
import Skill, { ISkill } from "@/models/Skill";
import CareerJourney, { ICareerJourney } from "@/models/CareerJourney";
import Certification, { ICertification } from "@/models/Certification";
import Faq, { IFaq } from "@/models/Faq";
import Testimonial, { ITestimonial } from "@/models/Testimonial";
import UsesItem, { IUsesItem } from "@/models/UsesItem";
import Settings from "@/models/Settings";

/**
 * STRICT SENSITIVE DATA POLICY (Zero-Leakage Security):
 * The following database models are NEVER imported, queried, or accessed by this module:
 * - Admin (admin accounts, passwords, password hashes, emails)
 * - OTP (one-time passwords, verification codes)
 * - ContactMessage (visitor private messages, emails, IPs)
 * - Newsletter (subscriber emails)
 * - Analytics, AnalyticsEvent, Session (visitor tracking, IP logs)
 *
 * Any settings keys containing secrets, tokens, API keys, or credentials
 * are strictly blocked by the SENSITIVE_KEY_PATTERN regex blacklist.
 */

const SENSITIVE_KEY_PATTERN = /(password|hash|salt|secret|token|apikey|api_key|credential|pin|otp|auth|cookie|session|mongodb|mongo_uri|database|connection)/i;

/**
 * Additional text sanitizer to scrub any accidental credential strings
 */
export function scrubSensitiveStrings(content: string): string {
    if (!content || typeof content !== "string") return "";

    return content
        // Scrub MongoDB connection strings with credentials
        .replace(/mongodb(\+srv)?:\/\/[^\s:@]+:[^\s:@]+@[^\s/]+/gi, "mongodb://[PROTECTED_CREDENTIALS]")
        // Scrub Google API keys
        .replace(/AIza[0-9A-Za-z-_]{30,45}/g, "[PROTECTED_API_KEY]")
        // Scrub OpenAI / Groq / DeepSeek / generic secret keys
        .replace(/\b(sk-[a-zA-Z0-9_-]{20,}|gsk_[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9_-]{20,})\b/g, "[PROTECTED_KEY]")
        // Scrub JWT tokens
        .replace(/eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, "[PROTECTED_JWT]")
        // Scrub Bearer auth tokens
        .replace(/Bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi, "Bearer [PROTECTED_TOKEN]");
}

/**
 * Safely extracts four-digit year from date string/Date object without NaN bugs
 */
export function safeGetYear(dateVal?: Date | string | null): string {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? "" : String(d.getFullYear());
}

export interface WebsiteSeoContext {
    siteMeta: {
        brandName: string;
        siteTitle: string;
        siteDescription: string;
        siteKeywords: string;
        authorBio: string;
    };
    projects: Array<{
        title: string;
        slug: string;
        path: string;
        category: string;
        technologies: string[];
        description: string;
    }>;
    posts: Array<{
        title: string;
        slug: string;
        path: string;
        category: string;
        tags: string[];
        excerpt: string;
    }>;
    skills: Array<{
        name: string;
        category: string;
        level: string;
    }>;
    career: Array<{
        title: string;
        organization: string;
        period: string;
    }>;
    certifications: Array<{
        title: string;
        issuer: string;
    }>;
}

interface KnowledgeCache {
    text: string;
    seoContext: WebsiteSeoContext;
    timestamp: number;
}

// In-memory cache with 5-minute TTL to ensure fast responses without DB overload
let memoryCache: KnowledgeCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches and aggregates all public website content safely, filtering out all sensitive data.
 */
export async function getWebsiteKnowledgeData(forceRefresh = false): Promise<{ text: string; seoContext: WebsiteSeoContext }> {
    const now = Date.now();
    if (!forceRefresh && memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
        return { text: memoryCache.text, seoContext: memoryCache.seoContext };
    }

    try {
        await dbConnect();

        // Fetch all public collections concurrently in a single parallel roundtrip
        const [
            rawSettings,
            projects,
            posts,
            skills,
            careerList,
            certList,
            faqs,
            testimonials,
            uses
        ] = await Promise.all([
            Settings.find({}).lean(),
            Project.find({})
                .select("title slug category description problemStatement solutionApproach technologies githubUrl liveUrl featured")
                .sort({ featured: -1, createdAt: -1 })
                .limit(20)
                .lean() as unknown as Promise<IProject[]>,
            Post.find({ published: true })
                .select("title slug category excerpt tags views likes createdAt")
                .sort({ createdAt: -1 })
                .limit(20)
                .lean() as unknown as Promise<IPost[]>,
            Skill.find({})
                .select("name level category years")
                .sort({ order: 1, years: -1 })
                .limit(30)
                .lean() as unknown as Promise<ISkill[]>,
            CareerJourney.find({})
                .select("type title organization location startDate endDate current description achievements skills")
                .sort({ startDate: -1 })
                .limit(15)
                .lean() as unknown as Promise<ICareerJourney[]>,
            Certification.find({})
                .select("title issuer category skills issueDate")
                .sort({ issueDate: -1 })
                .limit(15)
                .lean() as unknown as Promise<ICertification[]>,
            Faq.find({ published: { $ne: false } })
                .select("question answer category")
                .sort({ order: 1 })
                .limit(15)
                .lean() as unknown as Promise<IFaq[]>,
            Testimonial.find({})
                .select("name role company content")
                .limit(8)
                .lean() as unknown as Promise<ITestimonial[]>,
            UsesItem.find({})
                .select("name category description")
                .limit(15)
                .lean() as unknown as Promise<IUsesItem[]>
        ]);

        const safeSettings: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aboutMeData: any = null;

        for (const doc of rawSettings) {
            const key = (doc.key || "").trim();
            // Discard any sensitive key immediately
            if (SENSITIVE_KEY_PATTERN.test(key)) {
                continue;
            }

            if (key === "aboutMe" && doc.aboutMe) {
                aboutMeData = doc.aboutMe;
            } else if (typeof doc.value === "string" || typeof doc.value === "number") {
                safeSettings[key] = String(doc.value);
            }
        }

        const brandName = safeSettings.brandName || "Maulido";
        const siteTitle = safeSettings.siteTitle || `${brandName} | Network & Software Engineer Portfolio`;
        const siteDescription = safeSettings.siteDescription || "Professional portfolio and technical publications.";
        const siteKeywords = safeSettings.siteKeywords || "Network Engineer, Software Engineer, Next.js, Cisco, Python, Full Stack Developer";

        // Build Structured SEO Context
        const seoContext: WebsiteSeoContext = {
            siteMeta: {
                brandName,
                siteTitle,
                siteDescription,
                siteKeywords,
                authorBio: scrubSensitiveStrings(
                    aboutMeData?.paragraph1 || safeSettings.bio || "Senior Network & Software Engineer based in Jakarta, Indonesia."
                )
            },
            projects: projects.map(p => ({
                title: scrubSensitiveStrings(p.title),
                slug: p.slug,
                path: `/projects/${p.slug}`,
                category: p.category || "General",
                technologies: (p.technologies || []).map(t => scrubSensitiveStrings(t)),
                description: scrubSensitiveStrings(p.description || "")
            })),
            posts: posts.map(p => ({
                title: scrubSensitiveStrings(p.title),
                slug: p.slug,
                path: `/blog/${p.slug}`,
                category: p.category || "General",
                tags: (p.tags || []).map(t => scrubSensitiveStrings(t)),
                excerpt: scrubSensitiveStrings(p.excerpt || "")
            })),
            skills: skills.map(s => ({
                name: scrubSensitiveStrings(s.name),
                category: scrubSensitiveStrings(s.category || "General"),
                level: s.level || "Intermediate"
            })),
            career: careerList.map(c => {
                const start = safeGetYear(c.startDate);
                const end = c.current ? "Present" : safeGetYear(c.endDate);
                return {
                    title: scrubSensitiveStrings(c.title),
                    organization: scrubSensitiveStrings(c.organization),
                    period: start ? (end ? `${start} - ${end}` : start) : (end || "")
                };
            }),
            certifications: certList.map(c => ({
                title: scrubSensitiveStrings(c.title),
                issuer: scrubSensitiveStrings(c.issuer)
            }))
        };

        // Construct Token-Optimized Markdown Knowledge Base
        const lines: string[] = [];

        lines.push(`# KNOWLEDGE BASE WEBSITE PORTOFOLIO: ${brandName.toUpperCase()}`);
        lines.push(`- **Situs**: ${siteTitle}`);
        lines.push(`- **Deskripsi SEO**: ${siteDescription}`);
        lines.push(`- **Kata Kunci Utama**: ${siteKeywords}`);
        if (aboutMeData?.paragraph1) {
            lines.push(`- **Profil Singkat**: ${scrubSensitiveStrings(aboutMeData.paragraph1)}`);
        }
        if (aboutMeData?.stats) {
            lines.push(`- **Statistik**: ${aboutMeData.stats.yearsExperience || 0}+ Tahun Pengalaman, ${aboutMeData.stats.projectsCompleted || 0}+ Proyek Selesai, ${aboutMeData.stats.certificationsEarned || 0} Sertifikasi.`);
        }
        lines.push("");

        // Projects Section
        if (projects.length > 0) {
            lines.push("## DAFTAR PROYEK & KARYA REKAYASA (PORTFOLIO PROJECTS)");
            lines.push("Pengunjung dapat melihat proyek ini di rute `/projects/[slug]`:");
            projects.forEach((proj, idx) => {
                const tech = (proj.technologies || []).join(", ");
                lines.push(`${idx + 1}. **${scrubSensitiveStrings(proj.title)}** (Rute: \`/projects/${proj.slug}\`, Kategori: ${proj.category})`);
                lines.push(`   - Teknologi: ${tech || "-"}`);
                lines.push(`   - Ringkasan: ${scrubSensitiveStrings(proj.description || "-")}`);
                if (proj.solutionApproach) {
                    lines.push(`   - Solusi: ${scrubSensitiveStrings(proj.solutionApproach.slice(0, 160))}...`);
                }
            });
            lines.push("");
        }

        // Blog Posts Section
        if (posts.length > 0) {
            lines.push("## DAFTAR ARTIKEL & PUBLIKASI TEKNIS (BLOG POSTS)");
            lines.push("Pengunjung dapat membaca artikel ini di rute `/blog/[slug]`:");
            posts.forEach((post, idx) => {
                const tags = (post.tags || []).join(", ");
                lines.push(`${idx + 1}. **${scrubSensitiveStrings(post.title)}** (Rute: \`/blog/${post.slug}\`, Kategori: ${post.category})`);
                lines.push(`   - Tags: ${tags || "-"}`);
                lines.push(`   - Excerpt: ${scrubSensitiveStrings(post.excerpt || "-")}`);
            });
            lines.push("");
        }

        // Skills Matrix
        if (skills.length > 0) {
            lines.push("## KEAHLIAN TEKNOLOGI (SKILLS & TECH STACK)");
            // Group skills by category
            const grouped: Record<string, string[]> = {};
            skills.forEach(s => {
                const cat = s.category || "General";
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(`${s.name} (${s.level})`);
            });
            for (const [cat, list] of Object.entries(grouped)) {
                lines.push(`- **${cat}**: ${list.join(", ")}`);
            }
            lines.push("");
        }

        // Career Journey
        if (careerList.length > 0) {
            lines.push("## RIWAYAT KARIR & PENGALAMAN KERJA (EXPERIENCE)");
            careerList.forEach(c => {
                const start = safeGetYear(c.startDate);
                const end = c.current ? "Sekarang" : safeGetYear(c.endDate);
                const period = start ? (end ? ` (${start} - ${end})` : ` (${start})`) : (end ? ` (${end})` : "");
                lines.push(`- **${scrubSensitiveStrings(c.title)}** di **${scrubSensitiveStrings(c.organization)}**${period}`);
                if (c.description) lines.push(`  ${scrubSensitiveStrings(c.description.slice(0, 150))}...`);
            });
            lines.push("");
        }

        // Certifications
        if (certList.length > 0) {
            lines.push("## SERTIFIKASI PROFESIONAL (CERTIFICATIONS)");
            certList.forEach(cert => {
                lines.push(`- **${scrubSensitiveStrings(cert.title)}** diterbitkan oleh ${scrubSensitiveStrings(cert.issuer)}`);
            });
            lines.push("");
        }

        // FAQs
        if (faqs.length > 0) {
            lines.push("## FAQ & INFORMASI LAYANAN (FREQUENTLY ASKED QUESTIONS)");
            faqs.slice(0, 8).forEach(f => {
                lines.push(`- Q: ${scrubSensitiveStrings(f.question)}`);
                lines.push(`  A: ${scrubSensitiveStrings(f.answer.slice(0, 180))}...`);
            });
            lines.push("");
        }

        // Testimonials
        if (testimonials.length > 0) {
            lines.push("## TESTIMONI & REKOMENDASI (TESTIMONIALS)");
            testimonials.slice(0, 5).forEach(t => {
                lines.push(`- **${scrubSensitiveStrings(t.name)}** (${scrubSensitiveStrings(t.role)} di ${scrubSensitiveStrings(t.company)}): "${scrubSensitiveStrings(t.content.slice(0, 150))}..."`);
            });
            lines.push("");
        }

        // Uses
        if (uses.length > 0) {
            lines.push("## PERALATAN & SETUP (HARDWARE & SOFTWARE USES)");
            const usesList = uses.slice(0, 12).map(u => `${u.name} (${u.category})`).join(", ");
            lines.push(`- Perlengkapan utama: ${scrubSensitiveStrings(usesList)}`);
            lines.push("");
        }

        const knowledgeText = lines.join("\n");

        // Cache the safe knowledge base
        memoryCache = {
            text: knowledgeText,
            seoContext,
            timestamp: now
        };

        return { text: knowledgeText, seoContext };
    } catch (error) {
        console.error("Failed to build website knowledge base:", error);
        return {
            text: "# KNOWLEDGE BASE: Senior Network & Software Engineer Portfolio\nExpertise in Next.js, React, Node.js, Cisco, and Python.",
            seoContext: {
                siteMeta: {
                    brandName: "Maulido",
                    siteTitle: "Portfolio",
                    siteDescription: "Senior Network & Software Engineer",
                    siteKeywords: "Network, Software, Next.js, Cisco",
                    authorBio: "Senior Network & Software Engineer"
                },
                projects: [],
                posts: [],
                skills: [],
                career: [],
                certifications: []
            }
        };
    }
}

/**
 * Get formatted knowledge string ready for injection into AI system prompts.
 */
export async function getWebsiteKnowledgeString(forceRefresh = false): Promise<string> {
    const data = await getWebsiteKnowledgeData(forceRefresh);
    return data.text;
}

const STOP_WORDS = new Set([
    "dan", "yang", "di", "ke", "dari", "ini", "itu", "untuk", "pada", "adalah", "sebagai", "dengan", "saya", "kamu", "anda", "dia", "apa", "siapa", "bagaimana", "mengapa", "kapan", "dimana", "apakah", "bisa", "tolong", "bantu", "halo", "hai", "mau", "tahu", "tentang", "ada",
    "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "of", "about", "what", "who", "how", "tell", "me", "can", "you", "hello", "hi"
]);

/**
 * Dynamically prioritizes and ranks website knowledge based on query relevance (Mini-RAG).
 * Highly relevant projects, articles, and skills appear at the top with richer detail,
 * ensuring high precision and optimal context token usage.
 */
export async function getRelevantKnowledgeString(query?: string, forceRefresh = false): Promise<string> {
    const rawData = await getWebsiteKnowledgeData(forceRefresh);
    if (!query || typeof query !== "string" || query.trim().length < 3) {
        return rawData.text;
    }

    const tokens = query
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(t => t.length > 2 && !STOP_WORDS.has(t));

    if (tokens.length === 0) {
        return rawData.text;
    }

    const scoreText = (text: string): number => {
        if (!text) return 0;
        const lower = text.toLowerCase();
        let score = 0;
        for (const token of tokens) {
            if (lower.includes(token)) {
                score += 1;
            }
        }
        return score;
    };

    const { seoContext } = rawData;
    const { siteMeta } = seoContext;

    // Rank Projects
    const rankedProjects = [...seoContext.projects].map(p => {
        const titleScore = scoreText(p.title) * 3;
        const techScore = scoreText(p.technologies.join(" ")) * 3;
        const descScore = scoreText(p.description);
        const catScore = scoreText(p.category) * 2;
        return { item: p, score: titleScore + techScore + descScore + catScore };
    }).sort((a, b) => b.score - a.score);

    // Rank Posts
    const rankedPosts = [...seoContext.posts].map(p => {
        const titleScore = scoreText(p.title) * 3;
        const tagScore = scoreText(p.tags.join(" ")) * 2;
        const excerptScore = scoreText(p.excerpt);
        return { item: p, score: titleScore + tagScore + excerptScore };
    }).sort((a, b) => b.score - a.score);

    // Rank Skills
    const rankedSkills = [...seoContext.skills].map(s => {
        const nameScore = scoreText(s.name) * 3;
        const catScore = scoreText(s.category);
        return { item: s, score: nameScore + catScore };
    }).sort((a, b) => b.score - a.score);

    // If query didn't match specific entities noticeably, fall back to default
    const maxScore = Math.max(
        rankedProjects[0]?.score || 0,
        rankedPosts[0]?.score || 0,
        rankedSkills[0]?.score || 0
    );

    if (maxScore === 0) {
        return rawData.text;
    }

    const lines: string[] = [];
    lines.push(`# KNOWLEDGE BASE (RELEVANCE OPTIMIZED FOR: "${query.slice(0, 50)}")`);
    lines.push(`- **Situs**: ${siteMeta.siteTitle}`);
    lines.push(`- **Profil Singkat**: ${siteMeta.authorBio}`);
    lines.push("");

    // Top Projects
    lines.push("## DAFTAR PROYEK (DIPRIORITASKAN BERDASARKAN RELEVANSI):");
    rankedProjects.slice(0, 10).forEach((rp, idx) => {
        const p = rp.item;
        const tagBadge = rp.score > 0 ? " [Relevansi Tinggi]" : "";
        lines.push(`${idx + 1}. **${p.title}**${tagBadge} (Rute: \`${p.path}\`, Kategori: ${p.category})`);
        lines.push(`   - Teknologi: ${p.technologies.join(", ") || "-"}`);
        lines.push(`   - Ringkasan: ${p.description}`);
    });
    lines.push("");

    // Top Posts
    if (rankedPosts.length > 0) {
        lines.push("## ARTIKEL & PUBLIKASI TEKNIS:");
        rankedPosts.slice(0, 8).forEach((rp, idx) => {
            const post = rp.item;
            lines.push(`${idx + 1}. **${post.title}** (Rute: \`${post.path}\`, Kategori: ${post.category})`);
            lines.push(`   - Tags: ${post.tags.join(", ") || "-"}`);
            lines.push(`   - Ringkasan: ${post.excerpt}`);
        });
        lines.push("");
    }

    // Skills
    lines.push("## KEAHLIAN TEKNOLOGI:");
    const matchedSkills = rankedSkills.filter(s => s.score > 0).map(s => `${s.item.name} (${s.item.level})`);
    if (matchedSkills.length > 0) {
        lines.push(`- **Keahlian Terkait Pertanyaan**: ${matchedSkills.join(", ")}`);
    }
    // Group general skills
    const grouped: Record<string, string[]> = {};
    seoContext.skills.forEach(s => {
        const cat = s.category || "General";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(`${s.name} (${s.level})`);
    });
    for (const [cat, list] of Object.entries(grouped)) {
        lines.push(`- **${cat}**: ${list.join(", ")}`);
    }
    lines.push("");

    // Career & Certifications
    if (seoContext.career.length > 0) {
        lines.push("## RIWAYAT KARIR & PENGALAMAN:");
        seoContext.career.forEach(c => {
            lines.push(`- **${c.title}** di **${c.organization}** (${c.period})`);
        });
        lines.push("");
    }

    if (seoContext.certifications.length > 0) {
        lines.push("## SERTIFIKASI:");
        seoContext.certifications.forEach(cert => {
            lines.push(`- **${cert.title}** (${cert.issuer})`);
        });
        lines.push("");
    }

    return lines.join("\n");
}

/**
 * Get structured SEO context data for targeted SEO audits and cross-linking.
 */
export async function getWebsiteSeoContext(forceRefresh = false): Promise<WebsiteSeoContext> {
    const data = await getWebsiteKnowledgeData(forceRefresh);
    return data.seoContext;
}

/**
 * Clear the in-memory knowledge cache (e.g. after content updates).
 */
export function invalidateWebsiteKnowledgeCache(): void {
    memoryCache = null;
}
