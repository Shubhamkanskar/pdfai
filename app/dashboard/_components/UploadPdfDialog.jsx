"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2, UploadCloud, FileText, AlertCircle } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const UploadPdfDialog = ({ children, isMaxFile }) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const getFileUrl = useMutation(api.fileStorage.getFileUrl);
  const addFileEntry = useMutation(api.fileStorage.AddFileEntryTodb);
  const embeddDocument = useAction(api.myActions.ingest);

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.emailAddresses?.[0]?.emailAddress;
      if (email) {
        setUserEmail(email);
      }
    }
  }, [isLoaded, user]);

  const onFileSelect = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      setFile(selectedFile);
      if (!fileName) {
        setFileName(selectedFile.name.replace(".pdf", ""));
      }
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf") {
        setError("Please drop a PDF file");
        return;
      }
      setFile(droppedFile);
      if (!fileName) {
        setFileName(droppedFile.name.replace(".pdf", ""));
      }
      setError("");
    }
  };

  const onUpload = async () => {
    let fileId;
    let fileUrl;

    try {
      // Initial validation checks
      if (!isLoaded || !user) {
        setError("Please sign in to upload files");
        return;
      }

      if (!userEmail) {
        setError(
          "No email address found. Please ensure you have a verified email"
        );
        return;
      }

      if (!file) {
        setError("Please select a file to upload");
        return;
      }

      if (!fileName.trim()) {
        setError("Please enter a file name");
        return;
      }

      setLoading(true);
      setError("");

      // Step 1: Generate upload URL and upload file
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      // Step 2: Get storage ID and file URL
      const { storageId } = await result.json();
      fileUrl = await getFileUrl({ storageId });
      fileId = uuid4();

      // Step 3: Add file entry to database
      await addFileEntry({
        fileId,
        storageId,
        fileName: fileName.trim(),
        createdBy: userEmail,
        fileUrl,
      });

      // Step 4: Process PDF and generate embeddings
      const Apiresp = await axios.get("/api/pdf-loader?pdfUrl=" + fileUrl);
      console.log("PDF loader response:", Apiresp.data);

      // Validate and process text chunks
      let textChunks = [];
      if (Array.isArray(Apiresp.data.message)) {
        textChunks = Apiresp.data.message
          .map((chunk) => (typeof chunk === "string" ? chunk : String(chunk)))
          .filter((chunk) => chunk && chunk.trim().length > 0);
      } else {
        throw new Error("Invalid response format from PDF loader");
      }

      if (textChunks.length === 0) {
        throw new Error("No valid text content found in PDF");
      }

      // Step 5: Generate embeddings
      const embeddingResponse = await embeddDocument({
        slitText: textChunks,
        fileId,
      });

      console.log("Embedding response:", embeddingResponse);

      if (!embeddingResponse.success) {
        throw new Error(
          embeddingResponse.message || "Failed to generate embeddings"
        );
      }

      // Step 6: Success handling
      toast.success("File uploaded successfully!", {
        description: `${fileName} has been uploaded and processed.`,
        duration: 3000,
      });

      // Step 7: Navigation
      router.push(`/workspace/${fileId}`);

      // Step 8: Reset form
      setFile(null);
      setFileName("");
      setError("");
      setOpen(false);
    } catch (err) {
      console.error("Upload/embedding error:", err);
      setError(err.message || "Failed to process document. Please try again.");
      toast.error("Upload failed", {
        description:
          "There was an error uploading your file. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isReadyToUpload = isLoaded && userEmail && !loading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger disabled={isMaxFile} asChild>
        <Button
          onClick={() => setOpen(true)}
          className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg transition-all duration-200"
        >
          Upload PDF File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-xl shadow-2xl">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
              Upload PDF File
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              {isLoaded && userEmail
                ? "Drop your PDF document here or click to browse files"
                : "Please sign in to upload files"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center h-52 px-4 transition-all duration-200 border-2 border-dashed 
              ${isDragging ? "border-gray-400 bg-gray-50" : isReadyToUpload ? "border-gray-200 hover:border-gray-400" : "border-gray-100"} 
              rounded-xl bg-gray-50/50 
              ${!isReadyToUpload && "opacity-50 cursor-not-allowed"}
              group
            `}
          >
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              id="pdf-upload"
              onChange={onFileSelect}
              disabled={!isReadyToUpload}
            />
            <label
              htmlFor="pdf-upload"
              className={`flex flex-col items-center justify-center w-full h-full 
                ${isReadyToUpload ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <div className="flex flex-col items-center gap-4 transition-transform group-hover:scale-105">
                {file ? (
                  <FileText className="w-12 h-12 text-gray-400 transition-colors group-hover:text-gray-500" />
                ) : (
                  <UploadCloud className="w-12 h-12 text-gray-400 transition-colors group-hover:text-gray-500" />
                )}
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-medium text-gray-700">
                    {file ? file.name : "Drop PDF here or click to upload"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Maximum file size: 10MB
                  </p>
                </div>
              </div>
            </label>
          </div>

          <div className="space-y-2 mt-6">
            <label
              htmlFor="fileName"
              className="text-sm font-medium text-gray-700"
            >
              File name
            </label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              id="fileName"
              placeholder="Enter file name"
              className="w-full bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-lg transition-all"
              disabled={!isReadyToUpload}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100">
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
            className="px-4 py-2 rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={onUpload}
            disabled={!isReadyToUpload || !file || !fileName.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-md disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload PDF"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPdfDialog;