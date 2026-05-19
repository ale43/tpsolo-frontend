"use client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleCerrarSesion = () => {
    // Limpiamos la cookie de sesión y el localStorage de autenticación
    document.cookie = "sesion_usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("auth");
    router.push("/login");
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabecera del Panel Principal */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Hotel Paraná</h1>
            <p className="text-slate-500 text-sm mt-1">Panel de Control Interno y Gestión de Plazas</p>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Grilla de Accesos Directos a los Casos de Uso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta 1: Buscar Huéspedes */}
          <button
            onClick={() => router.push("/huespedes")}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2 hover:border-blue-400 group"
          >
            <h2 className="text-xl font-bold text-blue-950 group-hover:text-blue-600 transition">
              Buscar Huéspedes
            </h2>
            <p className="text-slate-500 text-sm">
              Módulo de consulta rápida de pasajeros por DNI. Permite verificar los registros guardados en Postgres antes de proceder con una reserva.
            </p>
          </button>

          {/* Tarjeta 2: Registrar Nuevo Huésped */}
          <button
            onClick={() => router.push("/huespedes/nuevo")}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2 hover:border-blue-400 group"
          >
            <h2 className="text-xl font-bold text-blue-950 group-hover:text-blue-600 transition">
              Registrar Huésped (Alta)
            </h2>
            <p className="text-slate-500 text-sm">
              Formulario de inserción directa para nuevos pasajeros en el sistema. Vincula nombres, apellidos y documentos con el backend.
            </p>
          </button>

          {/* Tarjeta 3: Gestionar Reservas */}
          <button
            onClick={() => router.push("/reservas")}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2 hover:border-blue-400 group"
          >
            <h2 className="text-xl font-bold text-blue-950 group-hover:text-blue-600 transition">
              Generar Nueva Reserva
            </h2>
            <p className="text-slate-500 text-sm">
              Carga de estadías asociando el ID del Huésped con el número de habitación correspondiente, validando las fechas de check-in y check-out.
            </p>
          </button>

          {/* Tarjeta 4: Cuadro de Ocupación */}
          <button
            onClick={() => router.push("/ocupacion")}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2 hover:border-blue-400 group"
          >
            <h2 className="text-xl font-bold text-blue-950 group-hover:text-blue-600 transition">
              Cuadro de Ocupación (Grilla)
            </h2>
            <p className="text-slate-500 text-sm">
              Matriz completa del estado de las plazas hoteleras para los próximos 7 días. Muestra en tiempo real las habitaciones libres, reservadas u ocupadas.
            </p>
          </button>

        </div>
      </div>
    </main>
  );
}