import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import Footer from "@/components/layout/Footer";
import CategoryBar from "@/components/layout/CategoryBar";
import { getPopularCategories } from "@/lib/categories";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal Berita - Berita Terkini & Terpercaya",
  description: "Portal berita Indonesia terkini, terpercaya, dan independen. Nasional, Ekonomi, Olahraga, dan Teknologi.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let dbUser = null;

  if (session?.user?.id) {
    dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  }

  const categories = await getPopularCategories();

  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col relative">
        <Navbar user={dbUser} categories={categories as any} />
        <CategoryBar categories={categories as any} />
        <main id="main-content" className="flex flex-col flex-1 basis-auto w-full transition-all duration-300">
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
