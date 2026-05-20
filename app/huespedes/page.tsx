"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Huesped {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string | null;
}

export default function BuscarHuespedesPage() {
  const router = useRouter();

  const [dniInput, setDniInput] = useState(""); 
  const [resultados, setResultados] = useState<Huesped[]>([]);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [exitoAccion, setExitoAccion] = useState<string | null>(null);
  const [buscado, setBuscado] = useState(false);
  const dniRef = useRef<HTMLInputElement>(null);

  // =======================================================
  // 1. BÚSQUEDA: Consulta al endpoint por número de DNI
  // =======================================================
  const handleBuscar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorValidacion(null);
    setExitoAccion(null);
    setResultados([]);
    setBuscado(false);

    // Limpiamos espacios y eliminamos puntos por si escriben "40.123.456"
    let dniLimpio = dniInput.trim().replace(/\./g, "");

    if (!dniLimpio) {
      setErrorValidacion("Por favor, ingrese un número de DNI válido para realizar la búsqueda.");
      if (dniRef.current) dniRef.current.focus();
      return;
    }

    try {
      console.log(`Buscando en el backend por DNI: ${dniLimpio}`);
      
      // Enviamos el DNI limpio como parámetro al endpoint de Spring Boot
      const res = await fetch(`http://localhost:8081/huespedes/buscar?termino=${encodeURIComponent(dniLimpio)}`);
      
      if (res.ok) {
        const datos: Huesped[] = await res.json();
        setResultados(datos);
      } else {
        setErrorValidacion(`El servidor respondió con código de error ${res.status} al solicitar la lista.`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrorValidacion("No se pudo conectar con el backend. Comprobá que Spring Boot esté corriendo en el puerto 8081.");
    }
    
    setBuscado(true);
  };

  // =======================================================
  // 2. ELIMINACIÓN: Envía el DNI (String) para dar de baja
  // =======================================================
  const handleEliminarHuesped = async (dni: string, nombreCompleto: string) => {
    const confirmar = window.confirm(`¿Está seguro de que desea eliminar al huésped "${nombreCompleto}" del sistema?`);
    if (!confirmar) return;

    setErrorValidacion(null);
    setExitoAccion(null);

    try {
      console.log(`Enviando petición DELETE al backend para el DNI: ${dni}`);
      const response = await fetch(`http://localhost:8081/huespedes/${dni}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setExitoAccion("Huésped eliminado correctamente de la base de datos.");
        // Filtramos la lista local usando el DNI para actualizar la UI en el acto
        setResultados((prev) => prev.filter((h) => h.dni !== dni));
      } else {
        const txtError = await response.text();
        setErrorValidacion(txtError || `Error ${response.status}: El backend no permitió eliminar este registro.`);
      }
    } catch (error) {
      console.error("Error al conectar para DELETE:", error);
      setErrorValidacion("No se pudo conectar con el servidor backend para procesar la baja.");
    }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera del Módulo */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Módulo de Huéspedes</h1>
            <p className="text-slate-500 text-sm mt-1">Buscador, Alta, Baja y Modificación por Documento Nacional de Identidad</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push("/huespedes/nuevo")} 
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition shadow-xs"
            >
              + Nuevo Huésped
            </button>
            <button 
              onClick={() => router.push("/")} 
              className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition"
            >
              Volver al Inicio
            </button>
          </div>
        </div>

        {/* Alertas de Estado */}
        {errorValidacion && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-900 font-semibold text-sm">
            ⚠️ {errorValidacion}
          </div>
        )}
        {exitoAccion && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-900 font-semibold text-sm">
            ✅ {exitoAccion}
          </div>
        )}

        {/* Formulario de Búsqueda Exclusivo de DNI */}
        <form onSubmit={handleBuscar} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="max-w-md">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Número de DNI del Huésped *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={dniInput}
                ref={dniRef}
                onChange={(e) => setDniInput(e.target.value)}
                placeholder="Ej: 40123456"
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-950 transition shadow-md whitespace-nowrap">
                🔍 Buscar Pasajero
              </button>
            </div>
          </div>
        </form>

        {/* Resultados de la Base de Datos */}
        {buscado && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700">Pasajeros Encontrados en Sistema</h3>
            </div>
            
            {resultados.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                    <th className="p-3 font-bold">ID</th>
                    <th className="p-3 font-bold">Apellido y Nombre</th>
                    <th className="p-3 font-bold">DNI</th>
                    <th className="p-3 font-bold">Email de Contacto</th>
                    <th className="p-3 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {resultados.map((h) => {
                    const nombreCompleto = `${h.apellido ? h.apellido.toUpperCase() : ""}, ${h.nombre}`;
                    return (
                      <tr key={h.dni} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono text-slate-400">{h.id}</td>
                        <td className="p-3 font-bold text-blue-950">{nombreCompleto}</td>
                        <td className="p-3 text-slate-600 font-semibold">{h.dni}</td>
                        <td className="p-3 text-slate-500">{h.email || "[No Posee]"}</td>
                        <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center">
                            {/* NUEVO BOTÓN DE MODIFICAR */}
                            <button
                              type="button"
                              onClick={() => router.push(`/huespedes/${h.dni}`)}
                              className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-amber-200 transition"
                            >
                              ✏️ Modificar
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleEliminarHuesped(h.dni, nombreCompleto)}
                              className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-red-200 transition"
                            >
                              ❌ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm font-medium">
                ❌ No se encontró ningún registro que coincida con el DNI ingresado.
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}