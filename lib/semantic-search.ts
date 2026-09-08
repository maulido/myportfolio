/**
 * Semantic Vector Search Engine (Advanced RAG)
 * 
 * Provides vector-based semantic retrieval with cosine similarity,
 * subword n-gram analysis, and domain concept expansion for Network & Software Engineering.
 */

// Domain-Specific Concept Expansion Dictionary (ID <-> EN & Synonyms)
const CONCEPT_EXPANSIONS: Record<string, string[]> = {
    // Network Reliability & Redundancy
    "failover": ["dual-isp", "redundansi", "tahan banting", "high-availability", "uptime", "vrrp", "hsrp", "bgp", "down", "putus"],
    "redundansi": ["failover", "dual-isp", "high-availability", "vrrp", "backup"],
    "tahan banting": ["failover", "high-availability", "redundansi", "uptime", "dual-isp"],
    "down": ["failover", "monitoring", "troubleshooting", "redundansi", "dual-isp"],
    
    // Routing & Network Protocols
    "routing": ["cisco", "mikrotik", "ospf", "bgp", "vlan", "router", "gateway", "ip"],
    "cisco": ["routing", "switching", "ccna", "ospf", "ios", "vlan"],
    "mikrotik": ["routeros", "mtcna", "bandwidth", "queue", "qos", "firewall", "hotspot"],
    "ospf": ["routing", "dynamic routing", "interior gateway", "cisco", "mikrotik"],
    "bgp": ["dual-isp", "autonomous system", "peering", "routing", "failover"],
    "vlan": ["segmentasi", "802.1q", "trunk", "switching", "subnet", "isolasi"],

    // Security & Branch Interconnection
    "keamanan": ["security", "firewall", "vpn", "ipsec", "isolasi", "acl", "enkripsi"],
    "security": ["keamanan", "firewall", "vpn", "ipsec", "acl", "audit"],
    "kantor cabang": ["site-to-site", "branch", "interkoneksi", "ipsec", "vpn", "tunnel"],
    "vpn": ["ipsec", "site-to-site", "wireguard", "openvpn", "tunnel", "kantor cabang", "enkripsi"],
    "ipsec": ["vpn", "site-to-site", "tunnel", "ikev2", "enkripsi", "kantor cabang"],
    "firewall": ["filter", "acl", "security", "keamanan", "mikrotik", "cisco"],

    // Traffic Engineering & Performance
    "qos": ["bandwidth", "antrian", "prioritas", "traffic shaping", "latency", "queue"],
    "bandwidth": ["qos", "queue", "traffic shaping", "mikrotik", "kecepatan"],
    "lemot": ["latency", "bandwidth", "qos", "troubleshooting", "optimasi"],
    "lambat": ["latency", "bandwidth", "qos", "troubleshooting", "optimasi"],

    // Software Engineering & Full-Stack
    "web": ["next.js", "react", "typescript", "frontend", "full stack", "tailwind"],
    "aplikasi": ["software", "full stack", "next.js", "react", "node.js", "python"],
    "frontend": ["react", "next.js", "tailwind", "typescript", "ui", "ux"],
    "backend": ["node.js", "python", "api", "rest", "mongodb", "postgresql"],
    "fullstack": ["next.js", "react", "node.js", "typescript", "mongodb", "postgresql"],
    "database": ["mongodb", "postgresql", "redis", "basis data", "sql", "cache"],
    "basis data": ["database", "mongodb", "postgresql", "redis"],

    // DevOps & Infrastructure
    "devops": ["docker", "linux", "ubuntu", "nginx", "ci/cd", "git", "automation"],
    "docker": ["container", "devops", "microservices", "deployment"],
    "linux": ["ubuntu", "debian", "server", "sysadmin", "bash", "terminal"],
    "monitoring": ["dashboard", "grafana", "prometheus", "snmp", "alert", "uptime"],

    // Career & Recruitment
    "rekrut": ["hire", "lowongan", "interview", "kerja", "karir", "experience", "senior"],
    "hire": ["rekrut", "kontak", "whatsapp", "rate", "freelance", "fulltime"],
    "cv": ["resume", "riwayat hidup", "kualifikasi", "sertifikasi", "download"],
    "sertifikasi": ["ccna", "mtcna", "certifications", "lisensi", "kredensial"]
};

// Common Stopwords (ID & EN)
const STOP_WORDS = new Set([
    "dan", "yang", "di", "ke", "dari", "ini", "itu", "untuk", "pada", "adalah", "sebagai", "dengan", "saya", "kamu", "anda", "dia", "apa", "siapa", "bagaimana", "mengapa", "kapan", "dimana", "apakah", "bisa", "tolong", "bantu", "halo", "hai", "mau", "tahu", "tentang", "ada",
    "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "of", "about", "what", "who", "how", "tell", "me", "can", "you", "hello", "hi"
]);

export interface TermVector {
    [term: string]: number;
}

/**
 * Tokenizes text into normalized words and semantic expansion tokens.
 */
export function tokenizeAndExpand(text: string): string[] {
    if (!text) return [];

    const rawTokens = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, " ")
        .split(/\s+/)
        .filter(t => t.length > 2 && !STOP_WORDS.has(t));

    const expanded: string[] = [];
    for (const t of rawTokens) {
        expanded.push(t);
        // Add subwords if hyphenated (e.g. "site-to-site" -> "site")
        if (t.includes("-")) {
            t.split("-").forEach(sub => {
                if (sub.length > 2 && !STOP_WORDS.has(sub)) expanded.push(sub);
            });
        }
        // Expand domain synonyms
        if (CONCEPT_EXPANSIONS[t]) {
            expanded.push(...CONCEPT_EXPANSIONS[t]);
        }
    }

    return expanded;
}

/**
 * Converts token list into a normalized TF-IDF vector.
 */
export function createTermVector(tokens: string[]): TermVector {
    const vector: TermVector = {};
    if (tokens.length === 0) return vector;

    // Count term frequencies
    for (const t of tokens) {
        vector[t] = (vector[t] || 0) + 1;
    }

    // Apply log normalization & sublinear scaling
    for (const t in vector) {
        vector[t] = 1 + Math.log(vector[t]);
    }

    return vector;
}

/**
 * Calculates Cosine Similarity between two term vectors:
 * cos(v1, v2) = dot(v1, v2) / (||v1|| * ||v2||)
 */
export function cosineSimilarity(v1: TermVector, v2: TermVector): number {
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (const term in v1) {
        mag1 += v1[term] * v1[term];
        if (v2[term]) {
            dotProduct += v1[term] * v2[term];
        }
    }

    for (const term in v2) {
        mag2 += v2[term] * v2[term];
    }

    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

export interface ScoredEntity<T> {
    item: T;
    score: number;
    semanticScore: number;
    directScore: number;
}

/**
 * Ranks an array of items against a search query using hybrid semantic vector similarity.
 */
export function rankEntitiesSemantically<T>(
    items: T[],
    query: string,
    getText: (item: T) => { title: string; body: string; keywords?: string[] }
): ScoredEntity<T>[] {
    const queryTokens = tokenizeAndExpand(query);
    if (queryTokens.length === 0 || items.length === 0) {
        return items.map(item => ({ item, score: 0, semanticScore: 0, directScore: 0 }));
    }

    const queryVector = createTermVector(queryTokens);
    const lowerQuery = query.toLowerCase();

    return items
        .map(item => {
            const { title, body, keywords } = getText(item);
            const docTokens = tokenizeAndExpand(`${title} ${body} ${(keywords || []).join(" ")}`);
            const docVector = createTermVector(docTokens);

            // 1. Vector Cosine Similarity
            const semanticScore = cosineSimilarity(queryVector, docVector);

            // 2. Exact Title / Keyword Match Boost
            let directScore = 0;
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes(lowerQuery) || lowerQuery.includes(lowerTitle)) {
                directScore += 0.5;
            }
            for (const t of queryTokens) {
                if (lowerTitle.includes(t)) directScore += 0.2;
                if ((keywords || []).some(k => k.toLowerCase().includes(t))) directScore += 0.15;
            }

            // Blended Final Score
            const finalScore = (semanticScore * 0.7) + (Math.min(1, directScore) * 0.3);

            return {
                item,
                score: finalScore,
                semanticScore,
                directScore
            };
        })
        .sort((a, b) => b.score - a.score);
}
