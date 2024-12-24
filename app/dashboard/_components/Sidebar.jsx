"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Layout, Shield, Crown } from "lucide-react";
import Image from "next/image";
import React from "react";
import UploadPdfDialog from "./UploadPdfDialog";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AnimatedLogo from "@/components/animatedLogo";

const Sidebar = () => {
  const { user } = useUser();
  const pathname = usePathname();

  const getUserInfo = useQuery(api.user.getUserInfo, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });

  const fileList = useQuery(api.fileStorage.getFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });

  const isAtUploadLimit = !getUserInfo?.upgrade && fileList?.length >= 5;

  const isPathActive = (path) => {
    return pathname === path;
  };

  const navItemClass = (path) => `
    flex gap-2 items-center p-3 mt-1 rounded-lg cursor-pointer
    transition-all duration-200 ease-in-out
    ${
      isPathActive(path)
        ? "bg-gray-100 text-gray-900 font-medium shadow-sm scale-[0.98] transform"
        : "hover:bg-gray-50 hover:scale-[0.99] transform text-gray-600"
    }
  `;

  return (
    <div className="shadow-md h-screen p-7 flex flex-col">
      <div className="transition-transform duration-200 hover:scale-105">
        <AnimatedLogo />
      </div>

      <div className="mt-5">
        <UploadPdfDialog isMaxFile={isAtUploadLimit}>
          <Button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg transition-all duration-200 hover:scale-[0.98] transform">
            +Upload PDF
          </Button>
        </UploadPdfDialog>

        <div className="mt-5">
          <div className="mb-2">
            <Link href="/dashboard">
              <div className={navItemClass("/dashboard")}>
                <Layout
                  className={`${isPathActive("/dashboard") ? "text-gray-900" : "text-gray-600"}`}
                />
                <h2>Workspace</h2>
              </div>
            </Link>
          </div>

          {!getUserInfo?.upgrade && (
            <Link href="/dashboard/upgrade">
              <div className={navItemClass("/dashboard/upgrade")}>
                <Shield
                  className={`${isPathActive("/dashboard/upgrade") ? "text-gray-900" : "text-gray-600"}`}
                />
                <h2>Upgrade</h2>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Spacer to push content to bottom */}
      <div className="flex-grow" />

      {!getUserInfo?.upgrade ? (
        <div className="mt-auto w-[80%]">
          <Progress
            value={(fileList?.length / 5) * 100}
            className="h-2 bg-gray-100"
          />
          <p className="text-sm mt-2 text-gray-600">
            {fileList?.length} out of 5 pdf uploaded
          </p>
        </div>
      ) : (
        <div className="mt-auto w-full">
          <button className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-black p-3 text-white hover:bg-gray-900 transition-all duration-300 hover:shadow-xl">
            <Crown className="h-5 w-5 text-yellow-400" />
            <span className="font-medium">Premium User</span>
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
