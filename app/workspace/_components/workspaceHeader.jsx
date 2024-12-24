import AnimatedLogo from "@/components/animatedLogo";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useQuery } from "convex/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const WorkspaceHeader = ({ fileName, fileId }) => {
  const [isSaving, setIsSaving] = useState(false);
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
    if (editor && notes) {
      editor.commands.setContent(notes);
    }
  }, [editor, notes]);

  const handleSave = async () => {
    if (!editor) return;

    const content = editor.getText(); // Get plain text instead of HTML
    console.log("Content being saved:", content);

    if (!content || content.trim() === "") {
      toast.error("Cannot save empty notes");
      return;
    }

    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const blob = new Blob([content], {
        type: "text/plain;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName || "notes"}.txt`; // Save as .txt instead of .docx

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Notes saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 flex justify-between items-center shadow-md">
      <AnimatedLogo />
      <h2 className="font-bold">{fileName || "Notes"}</h2>
      <div className="flex gap-2 items-center">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1 text-sm bg-black hover:bg-gray-800 text-white rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            "Save"
          )}
        </Button>
        <UserButton />
      </div>
    </div>
  );
};

export default WorkspaceHeader;
