"use client"
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
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
  Bot
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
    console.log(result);
  };

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 opacity-20 blur rounded-xl" />
              <FileText className="h-8 w-8 text-blue-600 relative z-10" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              PDF AI Chat
            </span>
          </div>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-xl px-6 py-2 rounded-full font-medium flex items-center gap-2"
                >
                  Open Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-xl px-6 py-2 rounded-full font-medium"
              >
                Try For Free
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold">
              <span className="text-gray-900">Chat with your </span>
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                PDF documents
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Transform how you interact with PDFs. Upload your document and start asking questions instantly. Get accurate answers powered by AI.
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl text-lg px-8 py-6 rounded-full font-medium flex items-center gap-2 justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>

              </div>
            )}
          </div>

          {/* Right Column - How it Works */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-semibold mb-8 text-gray-900">How It Works</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-white border border-blue-100 hover:shadow-md transition-all duration-200">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">1. Upload Your PDF</p>
                  <p className="text-gray-600">Just drag & drop or click to upload your document</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-white border border-blue-100 hover:shadow-md transition-all duration-200">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <MousePointer2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">2. Select Text or Write</p>
                  <p className="text-gray-600">Highlight text or type your question about the PDF</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-white border border-blue-100 hover:shadow-md transition-all duration-200">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">3. Click AI Button</p>
                  <p className="text-gray-600">Get instant, accurate answers from your document</p>
                </div>
              </div>
            </div>

            {/* Demo Preview */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Example Queries:</p>
              <ul className="mt-2 space-y-2 text-sm text-gray-500">
                <li>"Summarize the main points of page 5"</li>
                <li>"What are the key findings in this research?"</li>
                <li>"Explain this paragraph in simpler terms"</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      {!user && (
        <section className="bg-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Why Choose PDF AI Chat?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Instant Answers",
                  description: "Get immediate responses to any question about your PDF content",
                  icon: <MessageSquare className="h-6 w-6 text-blue-600" />
                },
                {
                  title: "Smart Analysis",
                  description: "AI-powered understanding of complex documents",
                  icon: <Bot className="h-6 w-6 text-blue-600" />
                },
                {
                  title: "Easy to Use",
                  description: "No technical skills required - just upload and start asking",
                  icon: <MousePointer2 className="h-6 w-6 text-blue-600" />
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all duration-200"
                >
                  <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">PDF AI Chat</span>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              Made with <Heart className="w-5 h-5 text-red-500 fill-red-500" /> by Shubham Kanaskar
            </p>
            <div className="flex gap-6">
              <Link
                href="https://github.com/Shubhamkanskar"
                target="_blank"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Github className="w-6 h-6" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/shubham-kanaskar-237280157/"
                target="_blank"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </Link>
              <Link
                href="https://x.com/Shubham_kanaska"
                target="_blank"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}