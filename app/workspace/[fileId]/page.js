"use client"
import React, { useEffect, useState } from 'react'
import WorkspaceHeader from '../_components/workspaceHeader'
import { useParams } from 'next/navigation'
import PdfViewer from '../_components/PdfViewer'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import TextEditor from '../_components/TextEditor'
import { Loader2 } from 'lucide-react'

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

    if (!fileInfo || !fileInfo[0]) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50 flex items-center justify-center">
            <div className="backdrop-blur-lg bg-white/30 p-8 rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-gray-600 font-medium">Preparing your workspace...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
            <div className="fixed top-0 left-0 right-0 z-10 backdrop-blur-lg bg-white/70 border-b border-gray-200/50">
                <WorkspaceHeader fileName={fileInfo[0]?.fileName} fileId={fileId} />
            </div>

            <div className="pt-16 px-4 pb-4 container mx-auto max-w-[2000px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-5rem)]">
                    <div className="flex-1 overflow-auto">
                        {fileUrl ? (
                            <div className="h-full">
                                <PdfViewer fileUrl={fileUrl} />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Loading document...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="group rounded-2xl shadow-lg overflow-hidden flex flex-col bg-white/70 backdrop-blur-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
                        <div className="flex-1 overflow-auto p-6">
                            <TextEditor fileId={fileId} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Workspace