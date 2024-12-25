import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useQuery } from "convex/react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import AnimatedLogo from "@/components/animatedLogo";

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
        class: "focus:outline-none h-screen p-5 text-gray-300",
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

    const content = editor.getText();
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
      link.download = `${fileName || "notes"}.txt`;

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
    <div className="p-4 flex justify-between items-center border-b border-gray-800">
      <div className="flex items-center gap-2">
        <div className="transition-transform duration-200 hover:scale-105">
          <AnimatedLogo />
        </div>
      </div>

      <h2 className="font-semibold text-gray-300 bg-gray-800/50 px-4 py-1.5 rounded-full">
        {fileName || "Notes"}
      </h2>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="group bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Save Notes</span>
            </>
          )}
        </Button>

        <div className="hover:scale-105 transition-transform">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>

      {/* Animated Background Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-25" />
    </div>
  );
};

export default WorkspaceHeader;
