"use client";
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import {
  FileText,
  Heart,
  Upload,
  MessageSquare,
  Github,
  Linkedin,
  Twitter,
  ArrowRight,
  MousePointer2,
  Bot,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    user && CheckUser();
  }, [user]);

  const CheckUser = async () => {
    const result = await createUser({
      email: user?.primaryEmailAddress?.emailAddress,
      userName: user?.fullName,
      imageUrl: user?.imageUrl
    });
  };

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-900/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-96 -right-24 w-96 h-96 bg-blue-900/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-24 left-96 w-96 h-96 bg-pink-900/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-lg bg-gray-900/80 z-50 border-b border-gray-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 hover:scale-105 transition-transform">
            <FileText className="h-6 w-6 text-purple-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              PDF AI Chat
            </span>
          </div>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="group bg-purple-500 text-white hover:bg-purple-600 transition-all duration-300 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <Button
                onClick={handleGetStarted}
                className="bg-purple-500 text-white hover:bg-purple-600 transition-all duration-300 px-4 py-1.5 rounded-full text-sm font-medium"
              >
                Try For Free
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-white">Chat with your </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              PDF documents
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Transform how you interact with PDFs. Upload your document and start asking questions instantly. Get accurate answers powered by AI.
          </p>
          {!user && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleGetStarted}
                className="group bg-purple-500 text-white hover:bg-purple-600 transition-all duration-300 px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-colors max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-6 text-white flex items-center gap-2 justify-center">
            How It Works <Sparkles className="w-4 h-4 text-purple-400" />
          </h2>
          <div className="space-y-4">
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="bg-gray-700 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Upload className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">1. Upload Your PDF</p>
                <p className="text-gray-400 text-sm">Just drag & drop or click to upload</p>
              </div>
            </div>

            <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="bg-gray-700 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <MousePointer2 className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">2. Select Text or Write</p>
                <p className="text-gray-400 text-sm">Highlight text or type your question</p>
              </div>
            </div>

            <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="bg-gray-700 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Bot className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">3. Get AI Answers</p>
                <p className="text-gray-400 text-sm">Receive instant, accurate answers</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      {!user && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Why Choose PDF AI Chat?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                {
                  title: "Instant Answers",
                  description: "Get immediate responses to any question",
                  icon: <MessageSquare className="h-4 w-4 text-purple-400" />
                },
                {
                  title: "Smart Analysis",
                  description: "AI-powered document understanding",
                  icon: <Bot className="h-4 w-4 text-purple-400" />
                },
                {
                  title: "Easy to Use",
                  description: "No technical skills required",
                  icon: <MousePointer2 className="h-4 w-4 text-purple-400" />
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group bg-gray-800/50 backdrop-blur-xl p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="bg-gray-700 w-8 h-8 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800/50 backdrop-blur-xl border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                PDF AI Chat
              </span>
            </div>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-400 fill-red-400 hover:scale-125 transition-transform" /> by Shubham Kanaskar
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/Shubhamkanskar"
                target="_blank"
                className="text-gray-500 hover:text-purple-400 transition-colors hover:scale-125 transition-transform"
              >
                <Github className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/shubham-kanaskar-237280157/"
                target="_blank"
                className="text-gray-500 hover:text-purple-400 transition-colors hover:scale-125 transition-transform"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link
                href="https://x.com/Shubham_kanaska"
                target="_blank"
                className="text-gray-500 hover:text-purple-400 transition-colors hover:scale-125 transition-transform"
              >
                <Twitter className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Add CSS for animations */}
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
}