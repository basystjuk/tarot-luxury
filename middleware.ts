// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['uk', 'ru', 'en'] as const;
type Locale = typeof LOCALES[number];
const DEFAULT_LOCALE: Locale = 'uk';
const COOKIE_NAME = 'NEXT_LOCALE';

function detectLocale(req: NextRequest): Locale {
  // 1. Check cookie
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (cookie && LOCALES.includes(cookie as Locale)) return cookie as Locale;
  // 2. Accept-Language header
  const acceptLang = req.headers.get('accept-language') ?? '';
  if (acceptLang.toLowerCase().includes('uk')) return 'uk';
  if (acceptLang.toLowerCase().includes('ru')) return 'ru';
  if (acceptLang.toLowerCase().startsWith('en')) return 'en';
  // 3. Default to English for unknown languages
  return 'en';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Pass through: already has lang prefix, admin, api, _next, static files
  const hasLangPrefix = LOCALES.some(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
  if (hasLangPrefix) return NextResponse.next();
  if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) return NextResponse.next();

  const locale = detectLocale(req);
  const redirectUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, req.url);
  // Preserve trailing slash and search params
  redirectUrl.search = req.nextUrl.search;
  const response = NextResponse.redirect(redirectUrl, 307);
  response.cookies.set(COOKIE_NAME, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|og-image).*)'],
};
