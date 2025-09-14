// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {


  if (!isAuthenticated) {
    console.log('first', "first")
    // Userව login පිටුවට යොමු කරන්න.
    // login පිටුව middleware එකෙන් ආරක්ෂා කර නැති නිසා loop එකක් ඇති වෙන්නේ නැහැ.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // User authenticated නම්, request එක ඉදිරියට යවන්න.
  return NextResponse.next();
}

// config.matcher එක භාවිතයෙන් middleware ක්‍රියාත්මක විය යුතු routes තීරණය කරන්න
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};