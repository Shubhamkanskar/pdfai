"use client";
import React, { useState } from 'react';
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Layout,
    Shield,
    Crown,
    FileText,
    Menu,
    X,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AnimatedLogo from "@/components/animatedLogo";
import UploadPdfDialog from "./_components/UploadPdfDialog";

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useUser();
    const pathname = usePathname();

    const getUserInfo = useQuery(api.user.getUserInfo, {
        userEmail: user?.primaryEmailAddress?.emailAddress,
    });

    const fileList = useQuery(api.fileStorage.getFiles, {
        userEmail: user?.primaryEmailAddress?.emailAddress,
    });

    const isAtUploadLimit = !getUserInfo?.upgrade && fileList?.length >= 5;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const isPathActive = (path) => pathname === path;

    const navItemClass = (path) => `
    flex gap-2 items-center p-3 rounded-lg cursor-pointer
    transition-all duration-200 ease-in-out
    ${isPathActive(path)
            ? "bg-gray-800 text-purple-400 font-medium shadow-md"
            : "hover:bg-gray-800/50 text-gray-400 hover:text-purple-400"
        }
  `;

    const Sidebar = () => (
        <div className="h-full bg-gray-900 p-4 flex flex-col border-r border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-purple-400" />
                    <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                        PDF AI Chat
                    </span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden text-gray-400 hover:text-purple-400 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="mb-6">
                <UploadPdfDialog isMaxFile={isAtUploadLimit}>
                    <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-[0.98] transform">
                        + Upload PDF
                    </Button>
                </UploadPdfDialog>
            </div>

            <nav className="space-y-2">
                <Link href="/dashboard">
                    <div className={navItemClass("/dashboard")}>
                        <Layout className="h-5 w-5" />
                        <span>Workspace</span>
                    </div>
                </Link>

                {!getUserInfo?.upgrade && (
                    <Link href="/dashboard/upgrade">
                        <div className={navItemClass("/dashboard/upgrade")}>
                            <Shield className="h-5 w-5" />
                            <span>Upgrade</span>
                        </div>
                    </Link>
                )}
            </nav>

            <div className="flex-grow" />

            {!getUserInfo?.upgrade ? (
                <div className="mt-auto">
                    <Progress
                        value={(fileList?.length / 5) * 100}
                        className="h-2 bg-gray-800"
                    />
                    <p className="text-sm mt-2 text-gray-400">
                        {fileList?.length} out of 5 PDFs uploaded
                    </p>
                </div>
            ) : (
                <div className="mt-auto">
                    <button className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-gray-800 p-3 text-white hover:bg-gray-700 transition-all duration-300">
                        <Crown className="h-5 w-5 text-yellow-400" />
                        <span className="font-medium">Premium User</span>
                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 bottom-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Header */}
                <header className="sticky top-0 z-30 backdrop-blur-xl bg-gray-900/80 border-b border-gray-800">
                    <div className="flex items-center justify-between p-4">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden text-gray-400 hover:text-purple-400 transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-4 ml-auto">
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        rootBox: 'hover:scale-105 transition-transform'
                                    }
                                }}
                            />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;