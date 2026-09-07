/**
 * In-Memory LRU Cache for Popular AI Assistant Inquiries.
 * Delivers sub-20ms instant responses for recurring visitor and recruiter questions
 * without consuming LLM API quotas.
 */

interface CacheEntry {
    response: string;
    timestamp: number;
    hits: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour TTL
const MAX_CACHE_ENTRIES = 150;

const queryCache = new Map<string, CacheEntry>();

/**
 * Normalizes user question text for fuzzy intent matching:
 * Lowercases, strips punctuation, collapses whitespace.
 */
export function normalizeQueryKey(query: string): string {
    return query
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Standard pre-warmed answers for recurring common inquiries.
 */
const PREWARMED_RESPONSES: Record<string, string> = {
    "siapa maulido": "Maulido adalah seorang **Senior Network Engineer & Software Engineer** yang berbasis di Jakarta, Indonesia. Berpengalaman dalam merancang arsitektur jaringan enterprise berkeandalan tinggi (Cisco, MikroTik, BGP/OSPF) serta membangun aplikasi web modern performa tinggi dengan Next.js dan TypeScript.",
    "who is maulido": "Maulido is a **Senior Network Engineer & Software Engineer** based in Jakarta, Indonesia. He specializes in designing resilient enterprise network infrastructure (Cisco, MikroTik, BGP/OSPF) and building high-performance modern web applications with Next.js and TypeScript.",
    "apa keahlian maulido": "Keahlian utama Maulido mencakup **Network Engineering** (Cisco, MikroTik, BGP, OSPF, Network Security) dan **Software Engineering** (Next.js 16, TypeScript, React, Tailwind CSS, REST APIs, MongoDB, Docker, CI/CD).",
    "what are maulidos skills": "Maulido's core competencies span **Network Engineering** (Cisco, MikroTik, BGP, OSPF, Network Security) and **Software Engineering** (Next.js 16, TypeScript, React, Tailwind CSS, REST APIs, MongoDB, Docker, CI/CD).",
    "bagaimana cara download cv": "Anda dapat mengunduh CV resmi Maulido dengan menekan tombol [📄 Download CV](#cv) di bawah atau melalui menu navigasi di situs ini.",
    "how to download cv": "You can download Maulido's official CV by clicking the [📄 Download CV](#cv) button below or via the navigation menu on this website.",
    "bagaimana cara menghubungi": "Anda dapat menghubungi Maulido langsung melalui WhatsApp di [💬 WhatsApp](https://wa.me/6281234567890) atau mengisi formulir di halaman [✉️ Kontak](/contact).",
    "how to contact": "You can contact Maulido directly via WhatsApp at [💬 WhatsApp](https://wa.me/6281234567890) or by submitting the form on the [✉️ Contact](/contact) page.",
    "sertifikasi apa saja": "Maulido memiliki sertifikasi profesional terverifikasi di bidang jaringan dan software engineering, termasuk sertifikasi Cisco dan keahlian cloud. Rincian nomor lisensi dan bukti digital dapat Anda lihat di halaman [📜 Sertifikasi](/certifications).",
};

/**
 * Retrieves cached response if present, fresh, and normalized.
 */
export function getCachedAIResponse(query: string): string | null {
    if (!query || typeof query !== "string") return null;

    const normalized = normalizeQueryKey(query);
    if (!normalized) return null;

    // 1. Check exact match in prewarmed responses
    if (PREWARMED_RESPONSES[normalized]) {
        return PREWARMED_RESPONSES[normalized];
    }

    // 2. Check dynamic in-memory cache
    const entry = queryCache.get(normalized);
    if (entry) {
        if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
            entry.hits += 1;
            return entry.response;
        } else {
            queryCache.delete(normalized);
        }
    }

    // 3. Check for partial prefix match on common questions
    for (const [key, answer] of Object.entries(PREWARMED_RESPONSES)) {
        if (normalized === key || (normalized.length > 8 && (normalized.startsWith(key) || key.startsWith(normalized)))) {
            return answer;
        }
    }

    return null;
}

/**
 * Stores response in LRU in-memory cache.
 */
export function setCachedAIResponse(query: string, response: string): void {
    if (!query || !response || response.length < 10) return;

    const normalized = normalizeQueryKey(query);
    if (!normalized || normalized.length < 4) return;

    // Enforce max cache size
    if (queryCache.size >= MAX_CACHE_ENTRIES) {
        // Evict oldest entry
        const firstKey = queryCache.keys().next().value;
        if (firstKey) queryCache.delete(firstKey);
    }

    queryCache.set(normalized, {
        response: response.trim(),
        timestamp: Date.now(),
        hits: 1
    });
}
