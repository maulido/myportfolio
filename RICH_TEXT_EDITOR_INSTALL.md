# Rich Text Editor - Installation Guide

## Dependencies Required

Due to PowerShell execution policy restrictions, please install the following dependencies manually:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-code-block-lowlight lowlight
```

### Type Definitions (Optional)
If you encounter TypeScript errors, you may also need:

```bash
npm install --save-dev @types/linkify-it @types/markdown-it @types/unist
```

## What Was Implemented

### New Component
- **`components/RichTextEditor.tsx`** - Full-featured WYSIWYG editor

### Features
- ✅ Bold, Italic, Strikethrough
- ✅ Headings (H1, H2, H3)
- ✅ Bullet & Numbered Lists
- ✅ Blockquotes
- ✅ Inline Code & Code Blocks (with syntax highlighting)
- ✅ Links (add/remove)
- ✅ Images (via URL)
- ✅ Undo/Redo
- ✅ Responsive toolbar
- ✅ Dark mode compatible

### Modified Files
- `app/admin/posts/new/page.tsx` - Replaced textarea with RichTextEditor
- `app/admin/posts/[id]/page.tsx` - Replaced textarea with RichTextEditor

## Usage

The editor automatically saves content as HTML. No markdown conversion needed!

```tsx
<RichTextEditor
    content={formData.content}
    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
    placeholder="Start writing..."
/>
```

## Next Steps

After installing dependencies:
1. Run `npm run dev` to test the editor
2. Create a new blog post to see it in action
3. The content will be saved as HTML in the database
