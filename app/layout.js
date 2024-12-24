import "./globals.css";
import { Outfit } from "next/font/google";
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "PDF AI - Smart Document Analysis Tool",
  description: "Transform your PDF experience with AI-powered note-taking, smart summaries, and intelligent insights. Make studying and research effortless.",
  keywords: [
    "PDF tool",
    "AI document analysis",
    "smart notes",
    "PDF summary",
    "document management",
    "study tool",
    "research assistant",
    "PDF annotation",
    "AI powered PDF",
    "document analysis"
  ],
  authors: [{ name: "Shubham Kanaskar" }],
  creator: "Shubham Kanaskar",
  publisher: "PDF AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdf-ai.com",
    site_name: "PDF AI",
    title: "PDF AI - Smart Document Analysis Tool",
    description: "Transform your PDF experience with AI-powered note-taking and smart summaries",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDF AI - Smart Document Analysis"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@Shubham_kanaska",
    creator: "@Shubham_kanaska",
    title: "PDF AI - Smart Document Analysis Tool",
    description: "Transform your PDF experience with AI-powered note-taking and smart summaries",
    images: ["/twitter-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={outfit.className}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="canonical" href="https://pdf-ai.com" />
          {/* Add any additional meta tags or scripts here */}
        </head>
        <body>
          <Provider>{children}</Provider>
          <Toaster
            position="top-right"
            closeButton
            richColors
          />
        </body>
      </html>
    </ClerkProvider>
  );
}