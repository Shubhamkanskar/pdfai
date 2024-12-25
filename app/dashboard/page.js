"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();
  const fileList = useQuery(api.fileStorage.getFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h2 className="font-semibold text-3xl mb-8 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
        Workspace
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {!fileList ? (
          // Skeleton loading state
          Array(8)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-xl border border-gray-800 h-64"
              >
                <div className="flex flex-col items-center justify-between h-full">
                  <div className="flex flex-col items-center gap-4 flex-1">
                    <Skeleton className="w-16 h-16 rounded-lg bg-gray-700" />
                    <div className="w-full space-y-2">
                      <Skeleton className="h-4 w-3/4 mx-auto bg-gray-700" />
                      <Skeleton className="h-3 w-1/2 mx-auto bg-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
            ))
        ) : fileList.length === 0 ? (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-800">
            <div className="relative w-20 h-20 mb-4 opacity-50">
              <FileText className="w-20 h-20 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-500">Upload your first PDF to get started</p>
          </div>
        ) : (
          // File grid
          fileList.map((file, index) => (
            <Link
              href={`/workspace/${file.fileId}`}
              key={file.fileId || index}
              className="group block h-64"
            >
              <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 flex flex-col items-center h-full group-hover:shadow-lg group-hover:shadow-purple-500/10">
                <div className="relative w-16 h-16 mb-4 bg-gray-700/50 rounded-xl p-3 group-hover:bg-purple-500/20 transition-colors duration-300">
                  <FileText className="w-full h-full text-purple-400 group-hover:text-purple-300 transition-colors duration-300 group-hover:scale-110 transform" />
                </div>
                <div className="text-center flex-1 flex flex-col justify-center">
                  <h3 className="font-medium text-gray-300 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-purple-400 transition-colors duration-300">
                    {file.fileName}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(file._creationTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}