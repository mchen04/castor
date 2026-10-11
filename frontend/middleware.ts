import { NextRequest, NextResponse } from 'next/server';
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const origin = request.headers.get('origin');
  if (process.env.CASTOR_LOCAL !== '1' || !/^(127\.0\.0\.1|localhost):\d+$/.test(host)) {
    return NextResponse.json({ error: 'Castor runs locally. Use npm start on loopback.' }, { status: 403 });
  }
  if ((origin && origin !== `http://${host}`) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'Cross-site access is blocked.' }, { status: 403 });
  }
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
