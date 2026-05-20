"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HuespedAuxiliar {
  dni: string;
  nombre: string;
  apellido: string;
}

interface ReservaFront {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  huesped: HuespedAuxiliar;
  habitacion: { id: number };
}

export default function GestionReservasPage() {
  const router = useRouter();

  // Estados del Formulario de Alta
  const [huespedId, setHuespedId] = useState("");
  const [habitacionNro, setHabitacionNro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);

  // Estados del Buscador Asistente
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [huespedesLista, setHuespedesLista] = useState<HuespedAuxiliar[]>([]);
  const [buscandoAux, setBuscandoAux] = useState(false);

  // --- NUEVO: Estado para la Grilla de Reservas ---
  const [reservasLista, setReservasLista] = useState<ReservaFront[]>([]);
  const [cargandoGrilla, setCargandoGrilla] = useState(true);

  // Función para cargar las reservas desde el Backend
  const cargarReservasGrilla = async () => {
    try {
      const res = await fetch("http://localhost:8081/reservas");
      if (res.ok) {
        const datos: ReservaFront[] = await res.json();
        setReservasLista(datos);
      }
    } catch (error) {
      console.error("Error al traer la grilla de reservas:", error);
    } finally {
      setCargandoGrilla(false);
    }
  };

  // Cargar las reservas al montar el componente
  useEffect(() => {
    cargarReservasGrilla();
  }, []);

  const buscarHuespedesHelper = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscandoAux(true);
    try {
      const url = terminoBusqueda.trim()
        ? `http://localhost:8081/huespedes/buscar?termino=${encodeURIComponent(terminoBusqueda.trim())}`
        : `http://localhost:8081/huespedes`;
      const res = await fetch(url);
      if (res.ok) {
        const datos: HuespedAuxiliar[] = await res.json();
        setHuespedesLista(datos);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setBuscandoAux(false);
    }
  };

  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setExitoMsg(null);

    const desdeDate = new Date(fechaDesde);
    const hastaDate = new Date(fechaHasta);

    if (desdeDate >= hastaDate) {
      setErrorMsg("La fecha 'Desde' debe ser anterior a la fecha 'Hasta'.");
      return;
    }

    const numHabitacion = Number(habitacionNro);
    if (isNaN(numHabitacion) || numHabitacion < 1 || numHabitacion > 10) {
      setErrorMsg("Por favor, ingrese un número de habitación válido entre 1 y 10.");
      return;
    }

    const reservaPayload = {
      huesped: { dni: huespedId.trim() },
      habitacion: { id: numHabitacion },
      fechaInicio: fechaDesde,
      fechaFin: fechaHasta
    };

    try {
      const response = await fetch("http://localhost:8081/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaPayload),
      });

      if (response.ok) {
        setExitoMsg("Reserva creada con éxito.");
        setHuespedId(""); setHabitacionNro(""); setFechaDesde(""); setFechaHasta("");
        // Recargar la grilla automáticamente para ver la nueva reserva
        cargarReservasGrilla();
      } else {
        const serverError = await response.text();
        setErrorMsg(serverError || "Error al crear la reserva.");
      }
    } catch (error) {
      setErrorMsg("No se pudo conectar con el servidor.");
    }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Gestión Integral de Reservas</h1>
            <p className="text-slate-500 text-sm mt-1">Hotel Premier — Panel de Administración e Historial</p>
          </div>
          <button onClick={() => router.push("/")} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition">
            Volver al Inicio
          </button>
        </div>

        {errorMsg && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-900 font-semibold text-sm">{errorMsg}</div>}
        {exitoMsg && <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-900 font-semibold text-sm">{exitoMsg}</div>}

        {/* Zona del Formulario y Asistente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <form onSubmit={handleCrearReserva} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-700 border-b pb-2 mb-2">Generar Nueva Reserva</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">DNI del Huésped *</label>
                  <input type="text" required value={huespedId} onChange={(e) => setHuespedId(e.target.value)} className="w-full border border-slate-300 p-2 rounded-lg text-sm font-mono font-bold bg-slate-50 text-blue-950" placeholder="Ej: 38123456" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Número de Habitación *</label>
                  <input type="number" required value={habitacionNro} onChange={(e) => setHabitacionNro(e.target.value)} className="w-full border border-slate-300 p-2 rounded-lg text-sm" placeholder="1 - 10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha Desde *</label>
                  <input type="date" required value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="w-full border border-slate-300 p-2 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha Hasta *</label>
                  <input type="date" required value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="w-full border border-slate-300 p-2 rounded-lg text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-900 text-white p-3 rounded-xl font-bold hover:bg-blue-950 transition text-sm mt-2">Verificar y Confirmar Reserva</button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">🔍 Asistente de Huéspedes</h3>
            <form onSubmit={buscarHuespedesHelper} className="flex gap-2">
              <input type="text" value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} placeholder="Filtrar... (presionar buscar para ver todos)" className="w-full border border-slate-300 p-2 rounded-lg text-xs" />
              <button type="submit" className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg font-bold">Buscar</button>
            </form>
            <div className="border rounded-xl max-h-40 overflow-y-auto divide-y bg-slate-50">
              {huespedesLista.map((h) => (
                <div key={h.dni} className="p-2.5 flex justify-between items-center text-xs">
                  <div className="font-bold">{h.apellido}, {h.nombre} <div className="text-slate-500 font-mono">DNI: {h.dni}</div></div>
                  <button type="button" onClick={() => setHuespedId(h.dni)} className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">Seleccionar</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- NUEVA COLUMNA: GRILLA DE CONTROL DE RESERVAS --- */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-800 mb-4 tracking-tight">📅 Grilla de Control de Reservas Ocupadas</h2>
          
          {cargandoGrilla ? (
            <div className="text-center p-6 text-slate-500 text-sm">Cargando grilla desde el servidor...</div>
          ) : reservasLista.length === 0 ? (
            <div className="text-center p-6 bg-slate-50 border border-dashed rounded-xl text-slate-400 text-sm">No existen reservas registradas en el sistema actualmente.</div>
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-3">ID</th>
                    <th className="p-3">Huésped (DNI)</th>
                    <th className="p-3 text-center">Habitación</th>
                    <th className="p-3">Check-In</th>
                    <th className="p-3">Check-Out</th>
                    <th className="p-3 text-center">Acciones del Sistema</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-700 font-medium">
                  {reservasLista.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-blue-900">#{res.id}</td>
                      <td className="p-3">
                        <span className="font-bold block text-slate-900">{res.huesped ? `${res.huesped.apellido}, ${res.huesped.nombre}` : "N/A"}</span>
                        <span className="text-slate-400 font-mono block text-[10px]">DNI: {res.huesped?.dni || "N/A"}</span>
                      </td>
                      <td className="p-3 text-center"><span className="bg-slate-100 px-2 py-1 rounded-md font-bold border border-slate-200">Hab {res.habitacion?.id}</span></td>
                      <td className="p-3 font-mono">{res.fechaInicio}</td>
                      <td className="p-3 font-mono">{res.fechaFin}</td>
                      <td className="p-3 text-center">
                        {/* BOTÓN CON REDIRECCIÓN DINÁMICA DE FACTURACIÓN */}
                        <button
                          type="button"
                          onClick={() => {
                            if (res.huesped?.dni) {
                              router.push(`/reservas/${res.huesped.dni}/facturar`);
                            } else {
                              alert("Esta reserva no tiene un DNI de huésped válido.");
                            }
                          }}
                          className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-950 hover:text-white transition whitespace-nowrap"
                        >
                          🧾 Facturar Estadía
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}