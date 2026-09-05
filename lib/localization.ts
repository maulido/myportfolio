import { Language } from "@/context/LanguageContext";

/**
 * Resolves a localized text field from a MongoDB or CMS object.
 * Checks item[`${field}_${locale}`] first (e.g. description_id or description_en),
 * and falls back to item[field] (e.g. description).
 */
export function getLocalizedField(
    item: unknown,
    field: string,
    locale: Language,
    fallbackDefault: string = ""
): string {
    if (!item || typeof item !== "object") return fallbackDefault;
    const record = item as Record<string, unknown>;

    // Specific locale property (e.g., description_id or description_en)
    const localizedKey = `${field}_${locale}`;
    const localizedVal = record[localizedKey];
    if (typeof localizedVal === "string" && localizedVal.trim().length > 0) {
        return localizedVal;
    }

    // Direct field fallback (e.g., description)
    const defaultVal = record[field];
    if (typeof defaultVal === "string" && defaultVal.trim().length > 0) {
        return defaultVal;
    }

    return fallbackDefault;
}

/**
 * Resolves a localized string array from a MongoDB or CMS object.
 * Checks item[`${field}_${locale}`] first (e.g. responsibilities_id),
 * and falls back to item[field] (e.g. responsibilities).
 */
export function getLocalizedArray(
    item: unknown,
    field: string,
    locale: Language
): string[] {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;

    const localizedKey = `${field}_${locale}`;
    const localizedArr = record[localizedKey];
    if (Array.isArray(localizedArr) && localizedArr.length > 0) {
        return localizedArr as string[];
    }

    const defaultArr = record[field];
    if (Array.isArray(defaultArr)) {
        return defaultArr as string[];
    }

    return [];
}
