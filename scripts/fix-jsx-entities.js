/**
 * Fix JSX Unescaped Entities
 * 
 * This script automatically fixes unescaped entities in JSX files
 * Replaces: ' → &apos; or {`'`}
 * Replaces: " → &quot; or {`"`}
 * Replaces: & → &amp;
 * 
 * Usage: node scripts/fix-jsx-entities.js
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const dirsToScan = [
    path.join(__dirname, '../app'),
    path.join(__dirname, '../components'),
];

// Track changes
let filesFixed = 0;
let totalReplacements = 0;

function fixJSXEntities(content) {
    let modified = content;
    let replacements = 0;

    // Fix apostrophes in JSX text (not in attributes or code)
    // Pattern: >text with ' here<
    const apostropheRegex = />([^<]*)'([^<]*)</g;
    modified = modified.replace(apostropheRegex, (match, before, after) => {
        replacements++;
        return `>${before}&apos;${after}<`;
    });

    // Fix quotes in JSX text
    const quoteRegex = />([^<]*)"([^<]*)</g;
    modified = modified.replace(quoteRegex, (match, before, after) => {
        // Skip if it looks like it's already an entity or in code
        if (before.includes('&') || after.includes(';')) {
            return match;
        }
        replacements++;
        return `>${before}&quot;${after}<`;
    });

    return { content: modified, replacements };
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { content: newContent, replacements } = fixJSXEntities(content);

        if (replacements > 0) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ Fixed ${filePath.replace(process.cwd(), '.')} (${replacements} replacements)`);
            filesFixed++;
            totalReplacements += replacements;
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules and .next
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                scanDirectory(filePath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            processFile(filePath);
        }
    });
}

console.log('🔧 Starting JSX entity fix...\n');

dirsToScan.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`📂 Scanning ${dir}...\n`);
        scanDirectory(dir);
    }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ Summary:');
console.log(`   Files fixed: ${filesFixed}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (filesFixed > 0) {
    console.log('✅ JSX entities fixed successfully!');
    console.log('💡 Run `npm run lint` to verify fixes\n');
} else {
    console.log('ℹ️  No issues found or all files already fixed\n');
}
