"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    ImageIcon,
    Code2,
} from "lucide-react";
import { useCallback, useRef } from "react";
import { UploadButton } from "@/lib/uploadthing";

// Initialize lowlight instance
const lowlight = createLowlight();

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
    const uploadButtonRef = useRef<HTMLButtonElement>(null);

    const editor = useEditor({
        immediatelyRender: false, // Fix SSR hydration mismatch
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg max-w-full h-auto",
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: "bg-muted rounded-lg p-4 font-mono text-sm",
                },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[300px] p-4",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Enter URL:", previousUrl);

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }



        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        // Trigger the hidden upload button
        uploadButtonRef.current?.click();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-input/50 rounded-lg overflow-hidden bg-background">
            {/* Hidden Upload Button */}
            <div className="hidden">
                <UploadButton
                    endpoint="imageUploader"
                    ref={uploadButtonRef as any}
                    onClientUploadComplete={(res) => {
                        if (res && res[0]?.url) {
                            editor.chain().focus().setImage({ src: res[0].url }).run();
                        }
                    }}
                    onUploadError={(error: Error) => {
                        console.error("Upload error:", error);
                        const url = window.prompt("Upload failed. Enter image URL instead:");
                        if (url) {
                            editor.chain().focus().setImage({ src: url }).run();
                        }
                    }}
                />
            </div>

            {/* Toolbar */}
            <div className="border-b border-input/50 bg-muted/30 p-2 flex flex-wrap gap-1">
                {/* Text Formatting */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("bold") ? "bg-muted text-primary" : ""
                        }`}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("italic") ? "bg-muted text-primary" : ""
                        }`}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("strike") ? "bg-muted text-primary" : ""
                        }`}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("code") ? "bg-muted text-primary" : ""
                        }`}
                    title="Inline Code"
                >
                    <Code className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Headings */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-muted text-primary" : ""
                        }`}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-muted text-primary" : ""
                        }`}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("heading", { level: 3 }) ? "bg-muted text-primary" : ""
                        }`}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Lists */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("bulletList") ? "bg-muted text-primary" : ""
                        }`}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("orderedList") ? "bg-muted text-primary" : ""
                        }`}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("blockquote") ? "bg-muted text-primary" : ""
                        }`}
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("codeBlock") ? "bg-muted text-primary" : ""
                        }`}
                    title="Code Block"
                >
                    <Code2 className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Media */}
                <button
                    type="button"
                    onClick={setLink}
                    className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive("link") ? "bg-muted text-primary" : ""
                        }`}
                    title="Add Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={addImage}
                    className="p-2 rounded hover:bg-muted transition-colors"
                    title="Add Image"
                >
                    <ImageIcon className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Undo/Redo */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="h-4 w-4" />
                </button>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}
