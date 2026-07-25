import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rag.mukeshdhadhariya.me"),

  title: {
    default: "RAG Platform | Mukesh Dhadhariya",
    template: "%s | RAG Platform",
  },

  description:
    "A Retrieval-Augmented Generation platform combining intelligent document retrieval with AI-powered generation for accurate, context-aware answers.",

  icons: {
    icon: [{ url: "/image.png", sizes: "512x512", type: "image/png" }],
  },

  keywords: [
    "RAG",
    "Retrieval Augmented Generation",
    "RAG Platform",
    "AI Search",
    "Semantic Search",
    "Vector Search",
    "Generative AI",
    "LLM",
    "Artificial Intelligence",
    "Document Question Answering",
    "Mukesh Dhadhariya",
  ],

  authors: [{ name: "Mukesh Dhadhariya" }],
  creator: "Mukesh Dhadhariya",
  publisher: "Mukesh Dhadhariya",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "RAG Platform",
    title: "RAG Platform | Mukesh Dhadhariya",
    description:
      "AI-powered Retrieval-Augmented Generation platform for intelligent document retrieval and context-aware answers.",
  },

  twitter: {
    card: "summary_large_image",
    title: "RAG Platform | Mukesh Dhadhariya",
    description:
      "AI-powered Retrieval-Augmented Generation platform for intelligent document retrieval and context-aware answers.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
