"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Definimos la interfaz reflejando todos los atributos reales de tu Huesped.java
interface Huesped {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  posicionIva: string | null;
  activo: boolean;
}

// Tipos válidos para el ordenamiento requerido por el enunciado
type SortField = "id" | "apellido" | "dni" | "email" | "posicionIva";
type SortOrder = "asc" | "desc";

export default function BuscarHuespedesPage() {
  const router = useRouter();

  const [busquedaInput, setBusquedaInput] = useState(""); 
  const [resultados, setResultados] = useState<Huesped[]>([]);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [exitoAccion, setExitoAccion] = useState<string | null>(null);
  const [buscado, setBuscado] = useState(false);
  
  // Estado para capturar la fila seleccionada por el conserje (Requerimiento Paso 5 del CU)
  const [seleccionado, setSeleccionado] = useState<Huesped | null>(null);
  
  // Estados para el ordenamiento de columnas (Requerimiento Especial del CU)
  const [sortField, setSortField] = useState<SortField>("apellido");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const inputRef = useRef<HTMLInputElement>(null);

  // =======================================================
  // 1. BÚSQUEDA: Consulta al endpoint por término (DNI o Apellido)
  // =======================================================
  const handleBuscar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorValidacion(null);
    setExitoAccion(null);
    setResultados([]);
    setBuscado(false);
    setSeleccionado(null);

    // Limpiamos espacios y pasamos a mayúsculas rígidas según requerimiento de diseño
    let terminoLimpio = busquedaInput.trim().toUpperCase();

    if (!terminoLimpio) {
      setErrorValidacion("Por favor, ingrese un criterio de búsqueda (DNI o Apellido).");
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    try {
      console.log(`Buscando en el backend por término: ${terminoLimpio}`);
      
      // Conexión directa a tu HuespedController.java
      const res = await fetch(`http://localhost:8081/huespedes/buscar?termino=${encodeURIComponent(terminoLimpio)}`);
      
      if (res.ok) {
        const datos: Huesped[] = await res.json();
        setResultados(datos);
      } else {
        setErrorValidacion(`El servidor respondió con código de error ${res.status}.`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrorValidacion("No se pudo conectar con el backend. Comprobá que Spring Boot esté corriendo en el puerto 8081.");
    }
    
    setBuscado(true);
  };

  // =======================================================
  // 2. ELIMINACIÓN: Lógica de baja física/lógica (CU11)
  // =======================================================
  const handleEliminarHuesped = async (dni: string, nombreCompleto: string, e: React.MouseEvent) => {
    // Evitamos que al dar click en borrar se dispare la selección de la fila
    e.stopPropagation(); 
    
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
        setResultados((prev) => prev.filter((h) => h.dni !== dni));
        if (seleccionado?.dni === dni) setSeleccionado(null);
      } else {
        const txtError = await response.text();
        setErrorValidacion(txtError || `Error ${response.status}: El backend no permitió eliminar este registro.`);
      }
    } catch (error) {
      console.error("Error al conectar para DELETE:", error);
      setErrorValidacion("No se pudo conectar con el servidor backend para procesar la baja.");
    }
  };

  // =======================================================
  // 3. BOTÓN CANCELAR (Requerimiento Explícito del CU)
  // =======================================================
  const handleCancelar = () => {
    setBusquedaInput("");
    setResultados([]);
    setErrorValidacion(null);
    setExitoAccion(null);
    setBuscado(false);
    setSeleccionado(null);
    if (inputRef.current) inputRef.current.focus();
  };

  // =======================================================
  // 4. FLUJO NAVEGACIÓN "SIGUIENTE" (Paso 5 y Flujo Alternativo 5.A)
  // =======================================================
  const handleSiguiente = () => {
    if (seleccionado) {
      // Paso 6: Si seleccionó una persona de la lista, pasa a Modificar Huésped (CU10)
      router.push(`/huespedes/${seleccionado.dni}`);
    } else {
      // Flujo Alternativo 5.A.1: Si presiona SIGUIENTE sin seleccionar a nadie, pasa a Dar Alta (CU09)
      router.push("/huespedes/nuevo");
    }
  };

  // =======================================================
  // 5. ORDENAMIENTO DINÁMICO (Observaciones del CU)
  // =======================================================
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const resultadosOrdenados = [...resultados].sort((a, b) => {
    let valA = "";
    let valB = "";

    if (sortField === "apellido") {
      valA = `${a.apellido || ""} ${a.nombre || ""}`.toUpperCase();
      valB = `${b.apellido || ""} ${b.nombre || ""}`.toUpperCase();
    } else {
      valA = String(a[sortField] || "").toUpperCase();
      valB = String(b[sortField] || "").toUpperCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabecera del Módulo */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">CU02: Buscar Huésped</h1>
            <p className="text-slate-500 text-sm mt-1">Buscador, Selección, Alta, Baja y Modificación de Pasajeros</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push("/huespedes/nuevo")} 
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition shadow-sm"
            >
              + Nuevo Huésped (CU09)
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

        {/* Formulario de Búsqueda Multiparámetro (DNI o Apellido) */}
        <form onSubmit={handleBuscar} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Criterio de Búsqueda (Cualquier Apellido o Número de Documento) *
            </label>
            <div className="flex flex-wrap gap-2 max-w-2xl">
              <input
                type="text"
                required
                value={busquedaInput}
                ref={inputRef}
                onChange={(e) => setBusquedaInput(e.target.value)}
                placeholder="Ej: PEREZ o 40123456"
                className="flex-1 border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold tracking-wide"
              />
              <button type="submit" className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-950 transition shadow-md whitespace-nowrap">
                🔍 BUSCAR
              </button>
              <button 
                type="button" 
                onClick={handleCancelar}
                className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-300 transition"
              >
                CANCELAR
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">El sistema forzará de manera transparente el ingreso en MAYÚSCULAS.</p>
          </div>
        </form>

        {/* Grid / Tabla de Resultados */}
        {buscado && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 space-y-4">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700">Pasajeros Encontrados en Sistema</h3>
              <p className="text-xs text-slate-400 font-medium">Haga clic sobre una fila para seleccionarla.</p>
            </div>
            
            {resultadosOrdenados.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider select-none">
                      <th onClick={() => handleSort("id")} className="p-3 font-bold cursor-pointer hover:bg-slate-700 transition-colors">
                        ID {sortField === "id" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th onClick={() => handleSort("apellido")} className="p-3 font-bold cursor-pointer hover:bg-slate-700 transition-colors">
                        Apellido y Nombre {sortField === "apellido" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th onClick={() => handleSort("dni")} className="p-3 font-bold cursor-pointer hover:bg-slate-700 transition-colors">
                        Documento {sortField === "dni" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th onClick={() => handleSort("email")} className="p-3 font-bold cursor-pointer hover:bg-slate-700 transition-colors">
                        Email de Contacto {sortField === "email" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th className="p-3 font-bold">Teléfono / Dirección</th>
                      <th onClick={() => handleSort("posicionIva")} className="p-3 font-bold cursor-pointer hover:bg-slate-700 transition-colors">
                        Posición IVA {sortField === "posicionIva" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th className="p-3 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {resultadosOrdenados.map((h) => {
                      const nombreCompleto = `${h.apellido ? h.apellido.toUpperCase() : ""}, ${h.nombre ? h.nombre.toUpperCase() : ""}`;
                      const estaSeleccionado = seleccionado?.id === h.id;
                      
                      return (
                        <tr 
                          key={h.id} 
                          onClick={() => setSeleccionado(estaSeleccionado ? null : h)}
                          className={`transition-colors cursor-pointer ${
                            estaSeleccionado 
                              ? "bg-blue-50/80 border-l-4 border-l-blue-600 font-medium" 
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="p-3 font-mono text-slate-400">{h.id}</td>
                          <td className="p-3 font-bold text-blue-950">{nombreCompleto}</td>
                          <td className="p-3 text-slate-600 font-semibold">{h.dni}</td>
                          <td className="p-3 text-slate-500">{h.email || "[No Posee]"}</td>
                          <td className="p-3 text-slate-500 text-xs space-y-0.5">
                            <div>📞 {h.telefono || "-"}</div>
                            <div>🏠 {h.direccion || "-"}</div>
                          </td>
                          <td className="p-3 text-xs">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-sm font-mono font-bold text-[11px]">
                              {h.posicionIva || "CONSUMIDOR FINAL"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/huespedes/${h.dni}`);
                                }}
                                className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-amber-200 transition"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleEliminarHuesped(h.dni, nombreCompleto, e)}
                                className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-red-200 transition"
                              >
                                ❌
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="text-slate-400 text-sm font-medium">
                  ❌ No se encontró ningún huésped activo que coincida con el criterio ingresado.
                </div>
                {/* Flujo Alternativo 4.A.1 */}
                <div>
                  <button
                    type="button"
                    onClick={() => router.push("/huespedes/nuevo")}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                  >
                    Pasar a Alta de Huésped  ➔
                  </button>
                </div>
              </div>
            )}

            {/* Panel de Control Inferior y Botón SIGUIENTE (OBLIGATORIO del Flujo de Diseño) */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
              <div className="text-xs text-slate-500">
                {seleccionado ? (
                  <span>Huésped seleccionado: <strong className="text-blue-950">{seleccionado.apellido.toUpperCase()}, {seleccionado.nombre.toUpperCase()}</strong>. Presione Siguiente para ir a modificar sus datos.</span>
                ) : (
                  <span>Ningún huésped seleccionado. Presione Siguiente para ejecutar el alta de un nuevo pasajero.</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSiguiente}
                className="bg-blue-900 text-white px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-950 transition shadow-md flex items-center gap-2"
              >
                SIGUIENTE ➔
              </button>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}