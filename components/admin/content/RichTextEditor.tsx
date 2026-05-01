"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Heading2, ImageIcon, Italic, LinkIcon, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder = "Write content..." }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[260px] rounded-b-lg border border-t-0 border-gray-200 bg-white px-4 py-3 focus:outline-none"
      }
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  });

  if (!editor) return <textarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[260px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />;

  const addLink = () => {
    const href = window.prompt("Paste link URL");
    if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const addImage = () => {
    const src = window.prompt("Paste image URL");
    if (src) editor.chain().focus().setImage({ src }).run();
  };

  const buttonClass = "grid h-8 w-8 place-items-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40";

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-t-lg border border-gray-200 bg-gray-50 p-2">
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold"><Bold className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic"><Italic className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading"><Heading2 className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet list"><List className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Numbered list"><ListOrdered className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-label="Quote"><Quote className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} onClick={addLink} aria-label="Link"><LinkIcon className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} onClick={addImage} aria-label="Image"><ImageIcon className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().undo().run()} aria-label="Undo"><Undo2 className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} onClick={() => editor.chain().focus().redo().run()} aria-label="Redo"><Redo2 className="h-4 w-4" /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
