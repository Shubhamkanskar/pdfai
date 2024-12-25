import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EditorExtenstion from "./EditorExtenstion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Custom CSS for TipTap Editor
const customStyles = `
  .ProseMirror {
    min-height: calc(100vh - 12rem);
    color: #E5E7EB;
    font-size: 1rem;
    line-height: 1.75;
  }

  .ProseMirror p {
    margin: 1em 0;
  }

  .ProseMirror:focus {
    outline: none;
  }

  .ProseMirror > * + * {
    margin-top: 0.75em;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding: 0 1rem;
  }

  .ProseMirror h1,
  .ProseMirror h2,
  .ProseMirror h3,
  .ProseMirror h4,
  .ProseMirror h5,
  .ProseMirror h6 {
    line-height: 1.1;
    color: #F3F4F6;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .ProseMirror h1 {
    font-size: 2em;
  }

  .ProseMirror h2 {
    font-size: 1.75em;
  }

  .ProseMirror h3 {
    font-size: 1.5em;
  }

  .ProseMirror code {
    background-color: rgba(139, 92, 246, 0.1);
    color: #A78BFA;
    padding: 0.2em 0.4em;
    border-radius: 0.3em;
  }

  .ProseMirror pre {
    background: #1F2937;
    border-radius: 0.5em;
    color: #E5E7EB;
    padding: 0.75em 1em;
    margin: 1em 0;
  }

  .ProseMirror blockquote {
    border-left: 4px solid #8B5CF6;
    padding-left: 1em;
    margin-left: 0;
    font-style: italic;
    color: #9CA3AF;
  }

  .ProseMirror hr {
    border: none;
    border-top: 2px solid #374151;
    margin: 2em 0;
  }

  .ProseMirror a {
    color: #8B5CF6;
    text-decoration: underline;
    text-decoration-thickness: 0.1em;
    transition: all 0.2s ease;
  }

  .ProseMirror a:hover {
    color: #A78BFA;
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #6B7280;
    pointer-events: none;
    height: 0;
  }
`;

const TextEditor = ({ fileId }) => {
  const notes = useQuery(api.note.getNotes, {
    fileId: fileId,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start taking your notes...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none prose prose-invert max-w-none p-6",
      },
    },
  });

  useEffect(() => {
    if (editor && notes) {
      editor.commands.setContent(notes);
    }
  }, [editor, notes]);

  return (
    <div className="relative h-full">
      {/* Editor Menu Bar */}
      <div className="sticky top-0 z-10 bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <EditorExtenstion editor={editor} />
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Custom Styles */}
      <style jsx global>
        {customStyles}
      </style>
    </div>
  );
};

export default TextEditor;
