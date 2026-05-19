import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  // 1. Intentamos levantar la cookie que demuestra que el usuario inició sesión
  const sesionActiva = request.cookies.get('sesion_usuario');

  // 2. Si no hay sesión y el usuario no está yendo al login, lo mandamos para allá
  if (!sesionActiva && !request.nextUrl.pathname.startsWith('/login')) {
    const urlLogin = request.nextUrl.clone();
    urlLogin.pathname = '/login';
    return NextResponse.redirect(urlLogin);
  }

  // 3. Si tiene sesión o ya está en el login, lo dejamos pasar normalmente
  return NextResponse.next();
}

// 🎯 Configuración: Qué rutas de Next.js van a exigir login obligatorio
export const config = {
  matcher: [
    /*
     * Protege absolutamente todo el sitio excepto:
     * - /login (la pantalla para loguearse)
     * - _next/static y _next/image (archivos internos de Next.js)
     * - favicon.ico, imágenes públicos, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};