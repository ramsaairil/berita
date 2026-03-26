import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Berita - Portal Berita Modern",
  description: "Platform portal berita dengan desain minimalis",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let dbUser = null;
  
  if (session) {
    dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  }

  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar user={dbUser} />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
