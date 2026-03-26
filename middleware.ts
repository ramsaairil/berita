import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  
  if (!sessionCookie && request.nextUrl.pathname.startsWith("/write")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && request.nextUrl.pathname.startsWith("/write")) {
     try {
       const session = await decrypt(sessionCookie);
       if (session.user.role !== "ADMIN") {
         return NextResponse.redirect(new URL("/", request.url));
       }
     } catch (err) {
       return NextResponse.redirect(new URL("/login", request.url));
     }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/write/:path*"],
};
