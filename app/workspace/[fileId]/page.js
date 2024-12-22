"use client"
import React, { useEffect, useState } from 'react'
import WorkspaceHeader from '../_components/workspaceHeader';
import { useParams } from 'next/navigation';
import PdfViewer from '../_components/PdfViewer';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import TextEditor from '../_components/TextEditor';

const Workspace = () => {
    const { fileId } = useParams();
    const [fileUrl, setFileUrl] = useState(null);

    // Get file info from Convex
    const fileInfo = useQuery(api.fileStorage.getFileRecord, {
        fileId: fileId
    });

    useEffect(() => {
        const getFileUrl = async () => {
            if (fileInfo?.[0]?.fileUrl) {
                try {
                    // If you need to do any processing with the URL, do it here
                    setFileUrl(fileInfo[0].fileUrl);
                } catch (error) {
                    console.error("Error getting file URL:", error);
                }
            }
        };

        getFileUrl();
    }, [fileInfo]);

    if (!fileInfo) return <div>Loading...</div>;

    return (
        <div>
            <WorkspaceHeader />

            <div className='grid grid-cols-2 gap-5'>
                <div>
                    {/*   text/editor */}
                    <TextEditor />
                </div>
                <div>
                    {fileUrl ? (
                        <PdfViewer fileUrl={fileUrl} />
                    ) : (
                        <div>Loading PDF...</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Workspace