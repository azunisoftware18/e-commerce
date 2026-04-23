"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useState } from "react";
import CodeBlock from "@tiptap/extension-code-block";

export default function RichTextEditor({ value, onChange, label }) {
  const editor = useEditor({
  extensions: [
    StarterKit, // ✅ normal
    CodeBlock,  // optional
    Underline,
    TextStyle,
    Color,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ],
  content: value || "",
   immediatelyRender: false,
  onUpdate: ({ editor }) => {
    onChange(editor.getHTML()); // ✅ IMPORTANT
  },
});

  const [height, setHeight] = useState(150);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-sm font-semibold text-slate-700">{label}</label>
      )}

      <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 shadow-sm w-full flex-wrap border border-slate-200">
        {/* Important: type="button" prevents form submission */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1 hover:bg-white rounded"
        >
          ↺
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1 hover:bg-white rounded"
        >
          ↻
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
  type="button"
  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
  className={editor.isActive("codeBlock") ? "bg-white" : ""}
>
  {"</>"}
</button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive("bold") ? "bg-white shadow-sm font-bold" : ""}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded italic ${editor.isActive("italic") ? "bg-white shadow-sm" : ""}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded underline ${editor.isActive("underline") ? "bg-white shadow-sm" : ""}`}
        >
          U
        </button>

        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-6 h-6 cursor-pointer"
        />

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-1 hover:bg-white rounded"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="p-1"
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="p-1"
        >
          ≣
        </button>
      </div>

     <div className="border border-slate-200 rounded-xl bg-white w-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20">

  {/* ✍️ Editor */}
  <div
    style={{ height }}
    className="p-4 overflow-auto h-100"
  >
    <EditorContent editor={editor} />
  </div>

  {/* 🔥 Resize Handle */}
  <div
    className="w-full h-2 cursor-ns-resize bg-slate-100 hover:bg-slate-300 transition"
    onMouseDown={(e) => {
      const startY = e.clientY;
      const startHeight = height;

      const onMouseMove = (e) => {
        const newHeight = startHeight + (e.clientY - startY);
        if (newHeight > 120) setHeight(newHeight);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }}
  />
</div>
    </div>
  );
}
