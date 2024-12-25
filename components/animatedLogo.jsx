import React from "react";
import { FileText } from "lucide-react";
import Link from "next/link";

const AnimatedLogo = () => {
  return (
    <>
      <Link className="cursor-pointer" href="/dashboard">
        <div className="flex items-center gap-2 p-2 rounded-lg">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 opacity-20 blur rounded-full" />
            <FileText size={24} className="text-blue-600 relative z-10" />
          </div>

          <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            PDF AI
          </div>
        </div>
      </Link>
    </>
  );
};

export default AnimatedLogo;
