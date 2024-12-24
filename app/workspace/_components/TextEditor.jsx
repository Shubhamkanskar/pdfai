import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EditorExtenstion from "./EditorExtenstion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const TextEditor = ({ fileId }) => {
  const notes = useQuery(api.note.getNotes, {
    fileId: fileId,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start taking your notes...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none h-screen p-5",
      },
    },
  });

  useEffect(() => {
    editor && editor.commands.setContent(notes);
  }, [editor && notes]);
  return (
    <>
      <EditorExtenstion editor={editor} />
      <div>
        <EditorContent editor={editor} />
      </div>
    </>
  );
};

export default TextEditor;
