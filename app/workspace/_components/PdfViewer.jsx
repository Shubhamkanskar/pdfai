import React, { useState } from "react";
import { Loader2, FileText } from "lucide-react";

const PdfViewer = ({ fileUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-xl">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/90 z-20 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin relative z-10" />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-gray-300 font-medium">Loading PDF</p>
            <p className="text-gray-500 text-sm">This might take a moment...</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <div
        className={`absolute inset-0 bg-gray-900/80 z-10 pointer-events-none transition-opacity duration-300
          ${isLoading ? "opacity-100" : "opacity-0"}`}
      />

      {/* PDF Viewer */}
      <iframe
        src={`${fileUrl}#toolbar=0`}
        className="w-full h-[90vh] border-none rounded-xl shadow-lg"
        style={{
          backgroundColor: "transparent",
        }}
        title="PDF Viewer"
        onLoad={() => setIsLoading(false)}
      />

      {/* Border Overlay for Hover Effect */}
      <div className="absolute inset-0 border border-gray-700 rounded-xl pointer-events-none transition-colors duration-300 hover:border-purple-500/30" />

      {/* Corner Effects */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-tl-xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-br-xl pointer-events-none" />

      {/* Quick Access Preview (shown while loading) */}
      {isLoading && (
        <div className="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur-xl p-4 rounded-lg border border-gray-700 z-30">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Document Loading</p>
              <div className="w-64 h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-1/3 animate-[loading_1s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Animation Styles */}
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default PdfViewer;
