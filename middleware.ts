import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Intentamos levantar la cookie que demuestra que el usuario inició sesión
  const sesionActiva = request.cookies.get('sesion_usuario');

  // 2. MODIFICADO: Si no hay sesión, pero está yendo al login O al registro, lo dejamos pasar.
  // Si va a cualquier otra pantalla protegida, lo mandamos al login.
  if (!sesionActiva && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/registro')) {
    const urlLogin = request.nextUrl.clone();
    urlLogin.pathname = '/login';
    return NextResponse.redirect(urlLogin);
  }

  // 3. Si tiene sesión o va a rutas públicas, pasa normalmente
  return NextResponse.next();
}

// 🎯 Configuración: Qué rutas van a exigir login obligatorio
export const config = {
  matcher: [
    /*
     * Protege absolutamente todo el sitio excepto:
     * - /login y /registro (las dejamos libres)
     * - _next/static y _next/image (archivos internos de Next.js)
     * - favicon.ico, imágenes públicas, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|registro).*)',
  ],
};