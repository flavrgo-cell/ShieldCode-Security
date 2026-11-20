import { updateSession } from '@/lib/supabase/proxy'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (request.method === 'POST' && request.nextUrl.pathname === '/register') {
    const url = request.nextUrl.clone()
    url.pathname = '/api/v1/auth/register'
    return NextResponse.rewrite(url)
  }

  if (request.method === 'POST' && request.nextUrl.pathname === '/verify-otp') {
    const url = request.nextUrl.clone()
    url.pathname = '/api/v1/auth/verify-otp'
    return NextResponse.rewrite(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2|woff|ttf|css|js|map)$).*)',
  ],
}
