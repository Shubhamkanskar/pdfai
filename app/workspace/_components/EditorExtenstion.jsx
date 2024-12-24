"use client";

import { chatSession } from "@/config/AIModel";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Editor } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import CodeBlock from "@tiptap/extension-code-block";

import StarterKit from "@tiptap/starter-kit";

import {
  Bold,
  Italic,
  Sparkle,
  Loader2,
  AlertCircle,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Text,
  Heading1,
  Heading3,
  Link,
  Image,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

// Button Components
const ToolbarButton = ({
  onClick,
  isActive,
  icon: Icon,
  title,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      p-2 rounded-md transition-colors
      ${isActive ? "text-blue-500 bg-blue-50" : "text-zinc-600"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-100"}
    `}
    title={title}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const ToolbarDivider = () => <div className="h-6 w-px bg-zinc-200 mx-2" />;

const AIButton = ({
  onClick,
  isLoading,
  floating = false,
  isCompact = false,
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`
      text-zinc-700 hover:text-zinc-200 backdrop-blur-lg
      bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent
      rounded-md shadow hover:shadow-zinc-400 duration-700
      flex items-center gap-2 transition-all
      ${isLoading ? "cursor-not-allowed" : ""}
      py-1 px-3 text-sm
      ${floating ? "transform -translate-x-1/2" : ""}
    `}
  >
    {isLoading ? (
      <Loader2 className="w-2.5 h-2.5 animate-spin" />
    ) : (
      <Sparkle className="w-2.5 h-2.5" />
    )}
    {!isCompact && (
      <span className={`font-medium ${isLoading ? "text-zinc-400" : ""}`}>
        {isLoading ? "Generating..." : "AI"}
      </span>
    )}
  </button>
);

// Editor Tools Configuration
const EditorTools = [
  {
    icon: Heading1,
    title: "Heading 1",
    action: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor?.isActive("heading", { level: 1 }),
  },
  {
    icon: Heading2,
    title: "Heading 2",
    action: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor?.isActive("heading", { level: 2 }),
  },
  {
    icon: Heading3,
    title: "Heading 3",
    action: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor?.isActive("heading", { level: 3 }),
  },
  {
    type: "divider",
  },
  {
    icon: Bold,
    title: "Bold",
    action: (editor) => editor?.chain().focus().toggleBold().run(),
    isActive: (editor) => editor?.isActive("bold"),
  },
  {
    icon: Italic,
    title: "Italic",
    action: (editor) => editor?.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor?.isActive("italic"),
  },
  {
    icon: UnderlineIcon,
    title: "Underline",
    action: (editor) => editor?.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor?.isActive("underline"),
  },
  {
    icon: Strikethrough,
    title: "Strikethrough",
    action: (editor) => editor?.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor?.isActive("strike"),
  },
  {
    type: "divider",
  },
  {
    icon: List,
    title: "Bullet List",
    action: (editor) => editor?.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor?.isActive("bulletList"),
  },
  {
    icon: ListOrdered,
    title: "Numbered List",
    action: (editor) => editor?.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor?.isActive("orderedList"),
  },
  {
    type: "divider",
  },
  {
    icon: AlignLeft,
    title: "Align Left",
    action: (editor) => editor?.chain().focus().setTextAlign("left").run(),
    isActive: (editor) => editor?.isActive({ textAlign: "left" }),
  },
  {
    icon: AlignCenter,
    title: "Align Center",
    action: (editor) => editor?.chain().focus().setTextAlign("center").run(),
    isActive: (editor) => editor?.isActive({ textAlign: "center" }),
  },
  {
    icon: AlignRight,
    title: "Align Right",
    action: (editor) => editor?.chain().focus().setTextAlign("right").run(),
    isActive: (editor) => editor?.isActive({ textAlign: "right" }),
  },
  {
    type: "divider",
  },
  {
    icon: Quote,
    title: "Blockquote",
    action: (editor) => editor?.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor?.isActive("blockquote"),
  },
  {
    icon: Code,
    title: "Code Block",
    action: (editor) => editor?.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor?.isActive("codeBlock"),
  },
  {
    type: "divider",
  },
  {
    icon: RotateCcw,
    title: "Undo",
    action: (editor) => editor?.chain().focus().undo().run(),
    isActive: () => false,
    disabled: (editor) => !editor?.can().undo(),
  },
  {
    icon: RotateCw,
    title: "Redo",
    action: (editor) => editor?.chain().focus().redo().run(),
    isActive: () => false,
    disabled: (editor) => !editor?.can().redo(),
  },
];

const EditorExtension = ({ editor }) => {
  const { fileId } = useParams();
  const { user } = useUser();
  const SearchAI = useAction(api.myActions.search);

  const saveNotes = useMutation(api.note.AddNotes);

  const [isToolbarLoading, setIsToolbarLoading] = useState(false);
  const [isFloatingLoading, setIsFloatingLoading] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const previousQuestions = useRef(new Map());
  const lastAnswerRef = useRef(null);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setShowFloatingButton(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setButtonPosition({
        top: rect.top - 30,
        left: rect.left + rect.width / 2,
      });
      setShowFloatingButton(true);
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    document.addEventListener("selectionchange", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      document.removeEventListener("selectionchange", handleSelectionUpdate);
    };
  }, [editor]);

  const scrollToAnswer = () => {
    setTimeout(() => {
      const answerElements = document.getElementsByClassName("ai-answer");
      if (answerElements.length > 0) {
        const lastAnswer = answerElements[answerElements.length - 1];
        lastAnswer.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const cleanAndFormatAIResponse = (response) => {
    // Remove backticks if present
    let cleanResponse = response
      .replace(/```[html]?\n?/g, "")
      .replace(/```/g, "");

    // If the response starts with <div class="response">, extract the inner content
    if (cleanResponse.includes('<div class="response">')) {
      cleanResponse = cleanResponse
        .replace(/<div class="response">/g, "")
        .replace(/<\/div>$/g, "");
    }

    // Format the response with proper styling
    return `
      <div class="ai-answer mt-6 p-6 border border-gray-200 rounded-lg bg-zinc-50/50 backdrop-blur-sm prose max-w-none space-y-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2 text-zinc-600">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              <Sparkle class="w-4 h-4 text-blue-500" />
            </span>
            <span class="font-medium">Answer</span>
          </div>
        </div>
        ${cleanResponse}
      </div>
    `;
  };

  const createAnalysisPrompt = (text, content) => {
    return `
  Analyze the following content and provide a clear response. 
  
  Your response should:
  1. Begin with a clear explanatory paragraph analyzing the content
  2. Include "Key Points:" section with relevant bullet points
  3. Use <strong> tags to emphasize important terms
  4. Be direct without any backticks or code blocks
  5. Not include any response div wrappers
  
  Question: "${text}"
  Content: "${content}"`;
  };

  const processAIResponse = async (isFloating = false) => {
    if (!editor) return;

    const setLoading = isFloating ? setIsFloatingLoading : setIsToolbarLoading;

    try {
      // Get selected text
      const selectedText = editor.state.doc
        .textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          " "
        )
        .trim();

      // Validate selection
      if (!selectedText) {
        toast.error("No text selected", {
          description: "Please select some text to analyze.",
          duration: 3000,
          icon: <AlertCircle className="w-4 h-4" />,
        });
        return;
      }

      if (selectedText.length < 10) {
        return;
      }

      setLoading(true);

      // Get document content
      const result = await SearchAI({
        query: selectedText,
        fileId: fileId,
      });

      const searchResponse = JSON.parse(result);
      if (!searchResponse.success || !searchResponse.results?.length) {
        return;
      }

      const documentContent = searchResponse.results
        .map((item) => item.pageContent)
        .join(" ");

      // Create analysis prompt
      const prompt = createAnalysisPrompt(selectedText, documentContent);

      // Get AI response
      const AIModelResult = await chatSession.sendMessage(prompt);
      let finalAnswer = await AIModelResult.response.text();

      // Clean and format the response
      const formattedAnswer = cleanAndFormatAIResponse(finalAnswer);

      // Check if it's a repeat question
      const questionCount = previousQuestions.current.get(selectedText) || 0;
      previousQuestions.current.set(selectedText, questionCount + 1);
      const isRepeatQuestion = questionCount > 0;

      if (isRepeatQuestion) {
      }

      // Add to editor
      const allText = editor.getHTML();
      editor.commands.setContent(allText + formattedAnswer);

      // Save notes
      await saveNotes({
        fileId: fileId,
        notes: editor.getHTML(),
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      scrollToAnswer();
    } catch (error) {
      console.error("Error in AI processing:", error);
    } finally {
      setLoading(false);
      if (isFloating) setShowFloatingButton(false);
    }
  };

  if (!editor) {
    return (
      <div className="p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-32 h-8 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Button */}
      {showFloatingButton && (
        <div
          className="fixed z-50 animate-fade-in"
          style={{
            top: `${buttonPosition.top}px`,
            left: `${buttonPosition.left}px`,
            top: `${buttonPosition.top}px`,
            left: `${buttonPosition.left}px`,
          }}
        >
          <AIButton
            onClick={() => processAIResponse(true)}
            isLoading={isFloatingLoading}
            floating={true}
            isCompact={true}
          />
        </div>
      )}

      {/* Top Toolbar */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="p-2">
          <div className="flex items-center gap-1 flex-wrap">
            {EditorTools.map((tool, index) =>
              tool.type === "divider" ? (
                <ToolbarDivider key={`divider-${index}`} />
              ) : (
                <ToolbarButton
                  key={tool.title}
                  onClick={() => tool.action(editor)}
                  isActive={tool.isActive(editor)}
                  disabled={tool.disabled ? tool.disabled(editor) : false}
                  icon={tool.icon}
                  title={tool.title}
                />
              )
            )}
            <ToolbarDivider />
            <AIButton
              onClick={() => processAIResponse(false)}
              isLoading={isToolbarLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// Export configurations for the editor setup
export const editorConfig = {
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Underline,
    CodeBlock,
  ],
  content: "",
  editorProps: {
    attributes: {
      class:
        "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
    },
  },
};

export default EditorExtension;
