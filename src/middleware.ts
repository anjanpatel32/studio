
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { languages, fallbackLng } from './app/i18n/settings'

import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore locales are readonly
  const locales: string[] = languages
  const languagesFromHeader = new Negotiator({ headers: negotiatorHeaders }).languages()

  const locale = matchLocale(languagesFromHeader, locales, fallbackLng)
  return locale
}

export function middleware(request: NextRequest) {
  let pathname = request.nextUrl.pathname

  // If the root path is requested, treat it as a special case for the welcome page
  if (pathname === '/') {
    const locale = getLocale(request)
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }
  
  const pathnameIsMissingLocale = languages.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    )
  }

  // Add the x-next-intl-locale header
  const locale = languages.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) || fallbackLng;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-intl-locale', locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)']
}
