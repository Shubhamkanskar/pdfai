"use client"
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { FileText, Zap, Heart, BookOpen, Brain, Github, Linkedin, Twitter } from "lucide-react";
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

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-purple-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-md z-50 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 opacity-20 blur-sm rounded-full" />
              <FileText className="h-8 w-8 text-blue-600 relative z-10" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              PDF AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Button
                  onClick={navigateToDashboard}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </Button>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 pt-32 pb-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-3xl blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-gray-900">Simplify </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                PDF Note-Taking
              </span>
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
              with AI-Powered Tools
            </h2>
            <p className="text-gray-600 text-lg">
              Transform your PDF experience with intelligent note-taking, smart summaries,
              and AI-powered insights. Make studying and research effortless.
            </p>
            <div className="flex gap-4 items-center">
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity px-8 py-6 text-lg"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
              </Button>
              {/*  <Button
                variant="outline"
                className="border-2 border-gray-300 hover:border-gray-400 transition-colors px-8 py-6 text-lg"
              >
                Watch Demo
              </Button> */}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-3xl blur-2xl" />
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg space-y-6">
              {[
                {
                  icon: <Brain className="text-blue-600 w-6 h-6" />,
                  title: "AI-Powered Analysis",
                  description: "Smart extraction of key information"
                },
                {
                  icon: <BookOpen className="text-purple-600 w-6 h-6" />,
                  title: "Instant Summaries",
                  description: "Quick overview of any document"
                },
                {
                  icon: <Zap className="text-pink-600 w-6 h-6" />,
                  title: "Smart Annotations",
                  description: "Intelligent note organization"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors"
                >
                  <div className="bg-gray-100 p-2 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-gray-600 flex items-center gap-2">
              Made with <Heart className="w-5 h-5 text-red-500 fill-red-500" /> by Shubham Kanaskar
            </p>
            <div className="flex gap-6">
              <Link
                href="https://github.com/Shubhamkanskar"
                target="_blank"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Github className="w-6 h-6" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/shubham-kanaskar-237280157/"
                target="_blank"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </Link>
              <Link
                href="https://x.com/Shubham_kanaska"
                target="_blank"
                className="text-gray-600 hover:text-blue-600 transition-colors"
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