"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HuespedAuxiliar {
  dni: string;
  nombre: string;
  apellido: string;
}

export default function GestionReservasPage() {
  const router = useRouter();

  const [huespedId, setHuespedId] = useState("");
  const [habitacionNro, setHabitacionNro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [huespedesLista, setHuespedesLista] = useState<HuespedAuxiliar[]>([]);
  const [buscandoAux, setBuscandoAux] = useState(false);

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
    // AQUÍ ESTÁ LA VALIDACIÓN DEL RANGO 1-10 QUE QUERÍAS
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
        setTimeout(() => router.push("/ocupacion"), 2000);
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Generar Nueva Reserva</h1>
            <p className="text-slate-500 text-sm mt-1">Hotel Paraná - Habitaciones disponibles: 1 al 10</p>
          </div>
          <button onClick={() => router.push("/")} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition">
            Volver al Inicio
          </button>
        </div>

        {errorMsg && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-900 font-semibold text-sm">{errorMsg}</div>}
        {exitoMsg && <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-900 font-semibold text-sm">{exitoMsg}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <form onSubmit={handleCrearReserva} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-700 border-b pb-2 mb-2">Datos de la Estadía</h2>
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
              <button type="submit" className="w-full bg-blue-900 text-white p-3 rounded-xl font-bold hover:bg-blue-950 transition text-sm mt-2">Verificar y Confirmar</button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800">🔍 Asistente de Huéspedes</h3>
            <form onSubmit={buscarHuespedesHelper} className="flex gap-2">
              <input type="text" value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} placeholder="Filtrar... (presionar buscar para ver todos)" className="w-full border border-slate-300 p-2 rounded-lg text-xs" />
              <button type="submit" className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg font-bold">Buscar</button>
            </form>
            <div className="border rounded-xl max-h-60 overflow-y-auto divide-y bg-slate-50">
              {huespedesLista.map((h) => (
                <div key={h.dni} className="p-2.5 flex justify-between items-center text-xs">
                  <div className="font-bold">{h.apellido}, {h.nombre} <div className="text-slate-500 font-mono">DNI: {h.dni}</div></div>
                  <button type="button" onClick={() => setHuespedId(h.dni)} className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">Seleccionar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}