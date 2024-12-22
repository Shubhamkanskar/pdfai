import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const TextEditor = () => {
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
  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "is-active" : ""}
          >
            Toggle bold
          </button>
        </div>
      </div>
      <div>
        <EditorContent editor={editor} />
      </div>
    </>
  );
};

export default TextEditor;
