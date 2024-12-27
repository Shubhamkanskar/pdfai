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
  Bot,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

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
      p-2 rounded-lg transition-all duration-200
      ${isActive ? "bg-purple-500/20 text-purple-400" : "text-gray-400 hover:bg-gray-800/50 hover:text-purple-400"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
      backdrop-blur-sm
    `}
    title={title}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const ToolbarDivider = () => <div className="h-6 w-px bg-gray-700/50 mx-2" />;

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
      group
      text-gray-300 hover:text-purple-400
      bg-gradient-to-r from-gray-800/50 via-purple-500/10 to-gray-800/50
      rounded-lg border border-gray-700 hover:border-purple-500/50
      shadow-lg hover:shadow-purple-500/20
      backdrop-blur-xl
      flex items-center gap-2
      transition-all duration-300
      ${isLoading ? "cursor-not-allowed" : "hover:scale-105"}
      py-1.5 px-3 text-sm
      ${floating ? "transform -translate-x-1/2" : ""}
    `}
  >
    {isLoading ? (
      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
    ) : (
      <Bot className="w-4 h-4 group-hover:text-purple-400 transition-colors duration-300" />
    )}
    {!isCompact && (
      <span className={`font-medium ${isLoading ? "text-gray-500" : ""}`}>
        {isLoading ? "Generating..." : "Ask AI"}
      </span>
    )}
  </button>
);

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
  { type: "divider" },
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
  { type: "divider" },
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
  { type: "divider" },
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
  { type: "divider" },
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
  { type: "divider" },
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
        top: rect.top - 40,
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
    let cleanResponse = response
      .replace(/```[html]?\n?/g, "")
      .replace(/```/g, "");

    if (cleanResponse.includes('<div class="response">')) {
      cleanResponse = cleanResponse
        .replace(/<div class="response">/g, "")
        .replace(/<\/div>$/g, "");
    }

    return `
      <div class="ai-answer">
        <div class="answer-header">
          <div class="ai-icon">
            <Bot class="w-4 h-4 text-purple-400" />
          </div>
          <span class="ai-label">AI Response</span>
        </div>
        <div class="answer-content">
          ${cleanResponse}
        </div>
        <div class="answer-border"></div>
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
      const selectedText = editor.state.doc
        .textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          " "
        )
        .trim();

      if (!selectedText) {
        toast.error("No text selected", {
          description: "Please select some text to analyze.",
          duration: 3000,
          icon: <AlertCircle className="w-4 h-4" />,
        });
        return;
      }

      if (selectedText.length < 10) return;

      setLoading(true);

      const result = await SearchAI({
        query: selectedText,
        fileId: fileId,
      });

      const searchResponse = JSON.parse(result);
      if (!searchResponse.success || !searchResponse.results?.length) return;

      const documentContent = searchResponse.results
        .map((item) => item.pageContent)
        .join(" ");

      const prompt = createAnalysisPrompt(selectedText, documentContent);
      const AIModelResult = await chatSession.sendMessage(prompt);
      let finalAnswer = await AIModelResult.response.text();

      const formattedAnswer = cleanAndFormatAIResponse(finalAnswer);

      const questionCount = previousQuestions.current.get(selectedText) || 0;
      previousQuestions.current.set(selectedText, questionCount + 1);

      const allText = editor.getHTML();
      editor.commands.setContent(allText + formattedAnswer);

      await saveNotes({
        fileId: fileId,
        notes: editor.getHTML(),
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      scrollToAnswer();
    } catch (error) {
      console.error("Error in AI processing:", error);
      toast.error("Error processing request", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    } finally {
      setLoading(false);
      if (isFloating) setShowFloatingButton(false);
    }
  };

  if (!editor) {
    return (
      <div className="p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-800 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-800 rounded-lg"></div>
          <div className="w-32 h-8 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showFloatingButton && (
        <div
          className="fixed z-50 animate-fade-in"
          style={{
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

      <div className="sticky top-0 z-40 bg-gray-900/80 border-b border-gray-800 backdrop-blur-xl">
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

      <style jsx global>{`
        .ProseMirror {
          min-height: calc(100vh - 12rem);
          color: #e5e7eb;
          font-size: 1rem;
          line-height: 1.75;
          padding: 1rem;
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
          color: #d1d5db;
        }

        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3,
        .ProseMirror h4,
        .ProseMirror h5,
        .ProseMirror h6 {
          line-height: 1.1;
          color: #f3f4f6;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .ProseMirror h1 {
          font-size: 2em;
          color: #f3f4f6;
        }

        .ProseMirror h2 {
          font-size: 1.75em;
          color: #f3f4f6;
        }

        .ProseMirror h3 {
          font-size: 1.5em;
          color: #f3f4f6;
        }

        .ProseMirror code {
          background-color: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          padding: 0.2em 0.4em;
          border-radius: 0.3em;
        }

        .ProseMirror pre {
          background: #1f2937;
          border-radius: 0.5em;
          color: #e5e7eb;
          padding: 0.75em 1em;
          margin: 1em 0;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #8b5cf6;
          padding-left: 1em;
          margin-left: 0;
          font-style: italic;
          color: #9ca3af;
        }

        .ProseMirror hr {
          border: none;
          border-top: 2px solid #374151;
          margin: 2em 0;
        }

        .ProseMirror a {
          color: #8b5cf6;
          text-decoration: underline;
          text-decoration-thickness: 0.1em;
          transition: all 0.2s ease;
        }

        .ProseMirror a:hover {
          color: #a78bfa;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #6b7280;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror .ai-answer {
          position: relative;
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 0.75rem;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .ProseMirror .ai-answer .answer-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .ProseMirror .ai-answer .ai-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 50%;
        }

        .ProseMirror .ai-answer .ai-label {
          font-weight: 500;
          color: #e5e7eb;
        }

        .ProseMirror .ai-answer .answer-content {
          color: #d1d5db;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .ProseMirror .ai-answer .answer-content strong {
          color: #a78bfa;
          font-weight: 600;
        }

        .ProseMirror .ai-answer .answer-border {
          position: absolute;
          bottom: -2rem;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(139, 92, 246, 0.3),
            transparent
          );
        }

        .ProseMirror .ai-answer + .ai-answer {
          margin-top: 3rem;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
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
        "prose prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
    },
  },
};

export default EditorExtension;
