import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getGlobalSettings } from "@/lib/settings";
import { getResolvedAIConfig, getConfiguredProviders, generateAICompletion } from "@/lib/ai";
import { getWebsiteKnowledgeString, getWebsiteSeoContext } from "@/lib/website-knowledge";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const settings = await getGlobalSettings();
    const config = getResolvedAIConfig(settings);

    if (!config.enabled) {
        return NextResponse.json(
            {
                success: false,
                error: "Layanan AI saat ini dinonaktifkan di Admin Settings > Integrations."
            },
            { status: 400 }
        );
    }

    if (!config.apiKey && config.provider !== "ollama") {
        return NextResponse.json(
            {
                success: false,
                error: `API Key untuk provider '${config.provider}' belum dikonfigurasi. Silakan atur di Admin Settings > Database & AI Services.`
            },
            { status: 400 }
        );
    }

    try {
        const body = await req.json();
        const { action, text, title, targetLang = "id" } = body;

        if (!action) {
            return NextResponse.json(
                { success: false, error: "Action is required" },
                { status: 400 }
            );
        }

        let prompt = "";
        if (action === "generate_excerpt") {
            prompt = `Anda adalah editor konten teknis untuk seorang Senior Network & Software Engineer.
Buat ringkasan / excerpt singkat (maksimal 2 kalimat, sekitar 140-160 karakter) yang menarik dan informatif untuk artikel atau projek berikut.
Bahasa output: ${targetLang === "id" ? "Bahasa Indonesia" : "English"}.
Judul: "${title || ""}"
Konten:
${(text || "").slice(0, 3000)}

Hanya berikan teks excerpt langsung tanpa pengantar atau tanda kutip.`;
        } else if (action === "translate") {
            const targetLanguageName = targetLang === "id" ? "Bahasa Indonesia" : "English";
            prompt = `Anda adalah penerjemah profesional khusus bidang Software Engineering dan Network Engineering.
Terjemahkan teks berikut ke dalam ${targetLanguageName}.
PENTING:
1. Pertahankan istilah teknis dalam bahasa aslinya (misal: BGP, OSPF, VLAN, Router, Next.js, API, Docker, CI/CD, Frontend, Backend, Database, Cloud, Cache, Latency, Throughput, dll).
2. Buat terjemahan yang natural, profesional, dan akurat untuk portofolio insinyur profesional.
3. Jangan tambahkan penjelasan pembuka atau penutup.

Teks untuk diterjemahkan:
${text}`;
        } else if (action === "generate_tags") {
            prompt = `Berdasarkan teks berikut, buat 5-7 tag / kategori teknologi yang paling relevan (misal: "Next.js", "Cisco", "BGP", "TypeScript", "Docker").
Teks:
${(text || "").slice(0, 2500)}

Keluarkan HANYA daftar tag dipisahkan dengan koma (contoh: Next.js, TypeScript, Network Automation).`;
        } else if (action === "improve_writing") {
            prompt = `Perbaiki dan sempurnakan gaya penulisan teks portofolio berikut agar terdengar lebih profesional, berbobot, dan percaya diri seperti seorang Senior Network & Software Engineer.
Bahasa: ${targetLang === "id" ? "Bahasa Indonesia" : "English"}.
Teks:
${text}

Hanya berikan teks hasil perbaikan tanpa catatan atau pembuka.`;
        } else if (action === "seo_audit") {
            const knowledge = await getWebsiteKnowledgeString();
            const langName = targetLang === "id" ? "Bahasa Indonesia" : "English";
            prompt = `Anda adalah Ahli Strategi SEO & Technical Content Director untuk website portofolio profesional.
Analisis data website berikut dan berikan Audit SEO & Rekomendasi Konten yang mendalam.

KNOWLEDGE BASE WEBSITE (Semua data publik portofolio):
${knowledge}

${title || text ? `KONTEN / HALAMAN YANG SEDANG DITINJAU:
Judul: "${title || ""}"
Isi / Cuplikan:
${(text || "").slice(0, 2000)}
` : `FOKUS: Audit Arsitektur SEO & Strategi Konten Keseluruhan Website.`}

Instruksi Output (${langName}):
Berikan laporan terstruktur dalam format Markdown yang rapi dan profesional dengan poin-poin berikut:
1. 📊 **Evaluasi Kesehatan SEO & Konten**: Skor perkiraan (1-100) dan ringkasan kondisi SEO saat ini.
2. 🔗 **Peluang Internal Linking (Cross-Linking)**: Rekomendasikan secara spesifik artikel mana yang harus menautkan ke proyek mana (sebutkan rute persis seperti \`/projects/slug\` atau \`/blog/slug\` yang ada di data).
3. 🎯 **Kata Kunci & Search Intent Potensial**: Kata kunci rekayasa perangkat lunak dan jaringan yang berpeluang menduduki peringkat tinggi di Google Search.
4. 💡 **Celah Konten (Content Gaps)**: Topik apa yang penting dari keahlian pemilik yang belum dibuatkan artikel atau studi kasus proyek.
5. 🚀 **Rencana Aksi Prioritas**: 3-5 langkah konkret yang dapat langsung dieksekusi oleh pemilik portofolio hari ini.`;
        } else if (action === "seo_optimize") {
            const seoContext = await getWebsiteSeoContext();
            const existingProjects = seoContext.projects.map(p => `• [${p.title}](${p.path}) - Tech: ${p.technologies.slice(0, 3).join(", ")}`).slice(0, 10).join("\n");
            const existingPosts = seoContext.posts.map(p => `• [${p.title}](${p.path}) - Tags: ${p.tags.slice(0, 3).join(", ")}`).slice(0, 10).join("\n");
            const langName = targetLang === "id" ? "Bahasa Indonesia" : "English";

            prompt = `Anda adalah Konsultan SEO On-Page spesialis situs rekayasa teknologi dan portofolio.
Tugas Anda adalah mengoptimalkan judul, meta tag, struktur heading, dan strategi tautan internal untuk konten berikut agar memiliki CTR tinggi di SERP Google.

DATA EXISTING WEBSITE UNTUK INTERNAL LINKING:
Proyek:
${existingProjects || "(Belum ada data proyek)"}

Artikel Blog:
${existingPosts || "(Belum ada data artikel)"}

KONTEN YANG DIOPTIMALKAN:
Judul: "${title || "Tanpa Judul"}"
Draft / Teks Konten:
${(text || "").slice(0, 3000)}

Berikan rekomendasi dalam format Markdown (${langName}):
### 1. 🏷️ Rekomendasi Title Tag (50-60 Karakter)
Berikan 3 opsi variasi judul yang kaya kata kunci dan menarik klik (sertakan jumlah karakter di sampingnya).

### 2. 📝 Meta Description Optimal (150-160 Karakter)
Berikan 2 opsi deskripsi ringkas dengan call-to-action yang kuat (sertakan jumlah karakter).

### 3. 📑 Struktur Heading (H1, H2, H3)
Susunan outline heading yang ideal untuk keterbacaan (readability) dan SEO Google.

### 4. 🎯 Target Keywords
- **Primary Keyword**: (1 kata kunci utama)
- **Secondary / LSI Keywords**: (4-6 kata kunci turunan)

### 5. 🔗 Rekomendasi Internal Links (Tautan Antar Konten)
Sebutkan bagian mana dalam teks ini yang sebaiknya menautkan ke proyek atau artikel yang sudah ada di atas beserta teks jangkar (anchor text) yang disarankan.`;
        } else if (action === "content_ideas") {
            const knowledge = await getWebsiteKnowledgeString();
            const langName = targetLang === "id" ? "Bahasa Indonesia" : "English";

            prompt = `Anda adalah Technical Content Strategist.
Berdasarkan seluruh keahlian, riwayat karir, sertifikasi, serta daftar proyek & artikel yang saat ini sudah ada di website portofolio berikut:

${knowledge}

Buatlah rekomendasi ide konten baru yang berkualitas tinggi dan memiliki nilai SEO tinggi dalam ${langName}:
1. ✍️ **5 Ide Artikel Blog Teknis Baru**: Lengkap dengan Judul Usulan, Target Kata Kunci, Masalah Teknis yang Dibahas, dan Alasan Mengapa ini Menguntungkan SEO Portofolio.
2. 💻 **3 Ide Showcase Proyek Baru**: Fitur atau arsitektur sistem yang sebaiknya ditambahkan ke portofolio untuk melengkapi keahlian yang belum terwakili secara visual.
3. 🎯 **Target Audiens & Intent**: Bagaimana konten ini dapat menarik perhatian Tech Recruiter, Engineering Managers, dan Klien.`;
        } else {
            return NextResponse.json(
                { success: false, error: `Action '${action}' not supported` },
                { status: 400 }
            );
        }

        const completion = await generateAICompletion({
            provider: config.provider,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            model: config.model,
            prompt,
            maxTokens: 1500,
            enableFailover: settings.aiAutoFailover !== "false",
            failoverProviders: getConfiguredProviders(settings)
        });

        if (!completion.success) {
            return NextResponse.json(
                { success: false, error: completion.error || "Gagal memproses permintaan AI" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            action,
            result: completion.text,
            provider: completion.provider,
            model: completion.model,
            latencyMs: completion.latencyMs
        });
    } catch (error) {
        console.error("Gemini AI API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Gagal memproses permintaan AI"
            },
            { status: 500 }
        );
    }
}
