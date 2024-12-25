"use client";
import React, { useEffect, useState } from 'react';
import WorkspaceHeader from '../_components/workspaceHeader';
import { useParams } from 'next/navigation';
import PdfViewer from '../_components/PdfViewer';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import TextEditor from '../_components/TextEditor';
import { Loader2 } from 'lucide-react';

const Workspace = () => {
    const { fileId } = useParams();
    const [fileUrl, setFileUrl] = useState(null);

    const fileInfo = useQuery(api.fileStorage.getFileRecord, {
        fileId: fileId
    });

    useEffect(() => {
        if (fileInfo?.[0]?.fileUrl) {
            setFileUrl(fileInfo[0].fileUrl);
        }
    }, [fileInfo]);

    // Loading state
    if (!fileInfo || !fileInfo[0]) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="backdrop-blur-xl bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
                        <Loader2 className="h-8 w-8 text-purple-400 animate-spin relative z-10" />
                    </div>
                    <p className="text-gray-400 font-medium">Preparing your workspace...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-10 backdrop-blur-xl bg-gray-900/80 border-b border-gray-800">
                <WorkspaceHeader fileName={fileInfo[0]?.fileName} fileId={fileId} />
            </div>

            {/* Main Content */}
            <div className="pt-16 px-4 pb-4 container mx-auto max-w-[2000px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-5rem)]">
                    {/* PDF Viewer */}
                    <div className="flex-1 overflow-hidden rounded-2xl border border-gray-800 bg-gray-800/50 backdrop-blur-xl">
                        {fileUrl ? (
                            <div className="h-full">
                                <PdfViewer fileUrl={fileUrl} />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                                    <span>Loading document...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Text Editor */}
                    <div className="group rounded-2xl border border-gray-800 overflow-hidden flex flex-col bg-gray-800/50 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="flex-1 overflow-auto p-6">
                            <TextEditor fileId={fileId} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-900/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute top-96 -right-24 w-96 h-96 bg-blue-900/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-24 left-96 w-96 h-96 bg-pink-900/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
            </div>

            {/* Animation Styles */}
            <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
};

export default Workspace;