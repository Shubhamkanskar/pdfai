"use client"
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useUser();
  const fileList = useQuery(api.fileStorage.getFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  });




  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="font-semibold text-3xl mb-8 text-gray-800">Workspace</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {!fileList ? (
          // Skeleton loading state
          Array(8)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 h-64"
              >
                <div className="flex flex-col items-center justify-between h-full">
                  <div className="flex flex-col items-center gap-4 flex-1">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="w-full space-y-2">
                      <Skeleton className="h-4 w-3/4 mx-auto" />
                      <Skeleton className="h-3 w-1/2 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            ))
        ) : fileList.length === 0 ? (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-gray-200">
            <div className="relative w-20 h-20 mb-4 opacity-50">
              <Image
                src="/folder.png"
                alt="Empty state"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
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
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full">
                <div className="relative w-16 h-16 mb-4">
                  <Image
                    src="/folder.png"
                    alt="PDF icon"
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                    priority={index < 4}
                  />
                </div>
                <div className="text-center flex-1 flex flex-col justify-center">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                    {file.fileName}
                  </h3>
                  <p className="text-sm text-gray-500">
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