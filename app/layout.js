import "./globals.css";
import { Outfit } from "next/font/google";
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";


const outfit = Outfit({ subsets: ["latin"] });


export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={outfit.className}
        >
          <Provider>{children}</Provider>

          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
