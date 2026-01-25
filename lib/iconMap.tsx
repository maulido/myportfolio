import {
    SiNextdotjs,
    SiReact,
    SiTypescript,
    SiTailwindcss,
    SiNodedotjs,
    SiMongodb,
    SiPostgresql,
    SiPython,
    SiCisco,
    SiDocker,
    SiLinux,
    SiAmazonwebservices,
    SiGit,
    SiJavascript,
    SiExpress,
    SiNestjs,
    SiGraphql,
    SiRedis,
    SiMysql,
    SiFirebase,
    SiSupabase,
    SiPrisma,
    SiKubernetes,
    SiJenkins,
    SiGithubactions,
    SiVercel,
    SiNetlify,
    SiHeroku,
    SiDigitalocean,
    SiVuedotjs,
    SiAngular,
    SiSvelte,
    SiNuxtdotjs,
    SiWebpack,
    SiVite,
    SiEslint,
    SiPrettier,
    SiJest,
    SiCypress,
    SiStorybook,
    SiFigma,
    SiAdobexd,
    SiSketch,
    SiPostman,
    SiInsomnia,
    SiSwagger,
    SiNginx,
    SiApache,
    SiElasticsearch,
    SiTerraform,
    SiAnsible,
    SiUbuntu,
    SiDebian,
    SiCentos,
    SiRedhat,
    SiAlpinelinux,
    SiMacos,
    SiAndroid,
    SiIos,
    SiFlutter,
    SiSwift,
    SiKotlin,
    SiGo,
    SiRust,
    SiPhp,
    SiRuby,
    SiDjango,
    SiFlask,
    SiFastapi,
    SiLaravel,
    SiAdobephotoshop,
    SiAdobeillustrator,
    SiMikrotik,
    SiJunipernetworks,
    SiFortinet,
    SiHuawei,
    SiPaloaltonetworks,
    SiUbiquiti,
    SiWireshark
} from "react-icons/si";
import { Code2, Database, Server, Cloud, Terminal, Smartphone, Palette, Package } from "lucide-react";
import React from "react";

// Icon mapping for Simple Icons (Brand Logos)
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Frontend
    "SiNextdotjs": SiNextdotjs,
    "SiReact": SiReact,
    "SiVuedotjs": SiVuedotjs,
    "SiAngular": SiAngular,
    "SiSvelte": SiSvelte,
    "SiNuxtdotjs": SiNuxtdotjs,
    "SiTypescript": SiTypescript,
    "SiJavascript": SiJavascript,
    "SiTailwindcss": SiTailwindcss,

    // Backend
    "SiNodedotjs": SiNodedotjs,
    "SiExpress": SiExpress,
    "SiNestjs": SiNestjs,
    "SiGraphql": SiGraphql,
    "SiPython": SiPython,
    "SiDjango": SiDjango,
    "SiFlask": SiFlask,
    "SiFastapi": SiFastapi,
    "SiPhp": SiPhp,
    "SiLaravel": SiLaravel,
    "SiRuby": SiRuby,
    "SiGo": SiGo,
    "SiRust": SiRust,

    // Database
    "SiMongodb": SiMongodb,
    "SiPostgresql": SiPostgresql,
    "SiMysql": SiMysql,
    "SiRedis": SiRedis,
    "SiFirebase": SiFirebase,
    "SiSupabase": SiSupabase,
    "SiPrisma": SiPrisma,
    "SiElasticsearch": SiElasticsearch,

    // DevOps & Cloud
    "SiDocker": SiDocker,
    "SiKubernetes": SiKubernetes,
    "SiJenkins": SiJenkins,
    "SiGithubactions": SiGithubactions,
    "SiAmazonwebservices": SiAmazonwebservices,
    "SiVercel": SiVercel,
    "SiNetlify": SiNetlify,
    "SiHeroku": SiHeroku,
    "SiDigitalocean": SiDigitalocean,
    "SiTerraform": SiTerraform,
    "SiAnsible": SiAnsible,
    "SiNginx": SiNginx,
    "SiApache": SiApache,

    // Networking & Systems
    "SiCisco": SiCisco,
    "SiLinux": SiLinux,
    "SiUbuntu": SiUbuntu,
    "SiDebian": SiDebian,
    "SiCentos": SiCentos,
    "SiRedhat": SiRedhat,
    "SiAlpinelinux": SiAlpinelinux,
    "SiMacos": SiMacos,
    "SiMikrotik": SiMikrotik,
    "SiJunipernetworks": SiJunipernetworks,
    "SiFortinet": SiFortinet,
    "SiHuawei": SiHuawei,
    "SiPaloaltonetworks": SiPaloaltonetworks,
    "SiUbiquiti": SiUbiquiti,
    "SiWireshark": SiWireshark,

    // Tools
    "SiGit": SiGit,
    "SiWebpack": SiWebpack,
    "SiVite": SiVite,
    "SiEslint": SiEslint,
    "SiPrettier": SiPrettier,
    "SiJest": SiJest,
    "SiCypress": SiCypress,
    "SiStorybook": SiStorybook,
    "SiPostman": SiPostman,
    "SiInsomnia": SiInsomnia,
    "SiSwagger": SiSwagger,

    // Mobile
    "SiAndroid": SiAndroid,
    "SiIos": SiIos,
    "SiFlutter": SiFlutter,
    "SiSwift": SiSwift,
    "SiKotlin": SiKotlin,

    // Design
    "SiFigma": SiFigma,
    "SiAdobexd": SiAdobexd,
    "SiSketch": SiSketch,
    "SiAdobephotoshop": SiAdobephotoshop,
    "SiAdobeillustrator": SiAdobeillustrator,

    // Lucide Icons (Generic)
    "Code2": Code2,
    "Database": Database,
    "Server": Server,
    "Cloud": Cloud,
    "Terminal": Terminal,
    "Smartphone": Smartphone,
    "Palette": Palette,
    "Package": Package,
};

// Get icon component by name
export const getIcon = (iconName: string, className: string = "h-4 w-4") => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) {
        // Return default icon if not found
        return <Code2 className={className} />;
    }
    return <IconComponent className={className} />;
};

// Get list of all available icons for selector
export const getAvailableIcons = () => {
    return Object.keys(iconMap).map(key => ({
        name: key,
        component: iconMap[key]
    }));
};

// Group icons by category for better UX
export const getIconsByCategory = () => {
    return {
        "Frontend": ["SiNextdotjs", "SiReact", "SiVuedotjs", "SiAngular", "SiSvelte", "SiTypescript", "SiJavascript", "SiTailwindcss"],
        "Backend": ["SiNodedotjs", "SiExpress", "SiNestjs", "SiPython", "SiDjango", "SiFlask", "SiPhp", "SiLaravel", "SiRuby", "SiGo"],
        "Database": ["SiMongodb", "SiPostgresql", "SiMysql", "SiRedis", "SiFirebase", "SiSupabase", "SiPrisma"],
        "DevOps": ["SiDocker", "SiKubernetes", "SiJenkins", "SiGithubactions", "SiTerraform", "SiAnsible"],
        "Cloud": ["SiAmazonwebservices", "SiVercel", "SiNetlify", "SiHeroku", "SiDigitalocean"],
        "Networking": ["SiCisco", "SiMikrotik", "SiJunipernetworks", "SiFortinet", "SiHuawei", "SiPaloaltonetworks", "SiUbiquiti", "SiWireshark", "SiLinux", "SiUbuntu", "SiNginx", "SiApache"],
        "Tools": ["SiGit", "SiWebpack", "SiVite", "SiPostman", "SiJest", "SiCypress"],
        "Mobile": ["SiAndroid", "SiIos", "SiFlutter", "SiSwift", "SiKotlin"],
        "Design": ["SiFigma", "SiAdobexd", "SiSketch", "SiAdobephotoshop"],
        "Generic": ["Code2", "Database", "Server", "Cloud", "Terminal", "Smartphone", "Palette", "Package"]
    };
};
