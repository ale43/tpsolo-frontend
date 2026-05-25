"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Huesped {
  dni: string;
  nombre: string;
  apellido: string;
}

interface Reserva {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  huesped: Huesped;
  habitacion: { id: number };
}

interface Factura {
  id: number;
  huespedDni: string;
  huespedNombre: string;
  montoBase: number;
  montoAdicionales: number;
  descuentoAplicado: number;
  montoTotal: number;
  formaPago: string;
  adicionalCochera: boolean;
  adicionalFrigobar: boolean;
  fechaEmision: string;
  reserva: { id: number } | null;
  reservaIdSnapshot: number | null;
}

export default function GestionReservasPage() {
  const router = useRouter();

  const [reservasLista, setReservasLista] = useState<Reserva[]>([]);
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);

  // Tab activo: "reservas" | "historial"
  const [tabActivo, setTabActivo] = useState<"reservas" | "historial">("reservas");

  // Estados del formulario
  const [dniSeleccionado, setDniSeleccionado] = useState("");
  const [habitacionId, setHabitacionId] = useState("1");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const estaVencida = (fechaFin: string) => new Date(fechaFin) < hoy;
  const reservasVencidas = reservasLista.filter((r) => estaVencida(r.fechaFin));

  // ─── Carga de datos ──────────────────────────────────────────────────────────
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resReservas, resHuespedes, resFacturas] = await Promise.all([
        fetch("http://localhost:8081/reservas"),
        fetch("http://localhost:8081/huespedes"),
        fetch("http://localhost:8081/facturas"),
      ]);
      if (resReservas.ok) setReservasLista(await resReservas.json());
      if (resHuespedes.ok) setHuespedes(await resHuespedes.json());
      if (resFacturas.ok) setFacturas(await resFacturas.json());
    } catch {
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const mostrarExito = (msg: string) => {
    setExitoMsg(msg);
    setTimeout(() => setExitoMsg(null), 4000);
  };
  const mostrarError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // ─── Crear reserva ───────────────────────────────────────────────────────────
  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      mostrarError("La fecha de salida debe ser posterior a la de entrada.");
      return;
    }
    const payload = {
      huesped: { dni: dniSeleccionado },
      habitacion: { id: parseInt(habitacionId) },
      fechaInicio,
      fechaFin,
    };
    try {
      const res = await fetch("http://localhost:8081/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        mostrarExito("Reserva creada con éxito.");
        setDniSeleccionado(""); setFechaInicio(""); setFechaFin(""); setHabitacionId("1");
        cargarDatos();
      } else {
        const txt = await res.text();
        mostrarError(txt || "Error al crear la reserva.");
      }
    } catch { mostrarError("Error de conexión con el servidor."); }
  };

  // ─── Eliminar una reserva ────────────────────────────────────────────────────
  const handleEliminar = async (id: number) => {
    if (!confirm(`¿Eliminar la reserva #${id}? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`http://localhost:8081/reservas/${id}`, { method: "DELETE" });
      if (res.ok) { mostrarExito(`Reserva #${id} eliminada.`); cargarDatos(); }
      else mostrarError("No se pudo eliminar. Puede tener facturas asociadas.");
    } catch { mostrarError("Error de conexión al eliminar."); }
  };

  // ─── Eliminar TODAS las reservas vencidas ───────────────────────────────────
  const handleEliminarVencidas = async () => {
    if (reservasVencidas.length === 0) {
      mostrarError("No hay reservas vencidas para eliminar.");
      return;
    }
    if (!confirm(`¿Eliminar las ${reservasVencidas.length} reservas vencidas? Esta acción no se puede deshacer.`)) return;

    let eliminadas = 0;
    let errores = 0;
    for (const r of reservasVencidas) {
      try {
        const res = await fetch(`http://localhost:8081/reservas/${r.id}`, { method: "DELETE" });
        if (res.ok) eliminadas++;
        else errores++;
      } catch { errores++; }
    }

    if (errores === 0) mostrarExito(`${eliminadas} reservas vencidas eliminadas con éxito.`);
    else mostrarExito(`${eliminadas} eliminadas. ${errores} no pudieron eliminarse (pueden tener facturas asociadas).`);
    cargarDatos();
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const formatARS = (n: number) =>
    n?.toLocaleString("es-AR", { style: "currency", currency: "ARS" }) ?? "-";

  const formatFecha = (iso: string) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const badgePago = (forma: string) => {
    const cls: Record<string, string> = {
      EFECTIVO: "bg-emerald-100 text-emerald-700",
      TARJETA: "bg-blue-100 text-blue-700",
      CHEQUE: "bg-amber-100 text-amber-700",
    };
    const emoji: Record<string, string> = { EFECTIVO: "💵", TARJETA: "💳", CHEQUE: "🏢" };
    return { cls: cls[forma] ?? "bg-slate-100 text-slate-600", emoji: emoji[forma] ?? "" };
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-blue-950">Gestión Integral de Reservas</h1>
          <button onClick={() => router.push("/")}
            className="bg-slate-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-slate-800 transition text-sm">
            Volver al Inicio
          </button>
        </div>

        {/* Mensajes */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-900 font-semibold text-sm">
            ⚠️ {errorMsg}
          </div>
        )}
        {exitoMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg text-emerald-900 font-semibold text-sm">
            ✅ {exitoMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          <button onClick={() => setTabActivo("reservas")}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition ${
              tabActivo === "reservas"
                ? "bg-white border border-b-white border-slate-200 text-blue-900"
                : "text-slate-500 hover:text-slate-700"
            }`}>
            📋 Reservas
            {reservasVencidas.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {reservasVencidas.length} vencidas
              </span>
            )}
          </button>
          <button onClick={() => setTabActivo("historial")}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition ${
              tabActivo === "historial"
                ? "bg-white border border-b-white border-slate-200 text-blue-900"
                : "text-slate-500 hover:text-slate-700"
            }`}>
            🧾 Historial de Pagos
            {facturas.length > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {facturas.length}
              </span>
            )}
          </button>
        </div>

        {/* ── TAB: RESERVAS ─────────────────────────────────────────────────── */}
        {tabActivo === "reservas" && (
          <>
            {/* Formulario nueva reserva */}
            <form onSubmit={handleCrearReserva}
              className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
              <h2 className="text-base font-extrabold text-slate-800 col-span-full">Nueva Reserva</h2>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-sm text-slate-700">Huésped</label>
                <select required value={dniSeleccionado} onChange={(e) => setDniSeleccionado(e.target.value)}
                  className="border border-slate-400 p-2 rounded-lg text-slate-900 font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccione un huésped...</option>
                  {huespedes
                    .filter((h) => h.dni && h.dni.trim() !== "" && h.nombre && h.nombre.trim() !== "")
                    .map((h) => (
                      <option key={h.dni} value={h.dni}>{h.apellido}, {h.nombre} — DNI: {h.dni}</option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-sm text-slate-700">Habitación</label>
                <select value={habitacionId} onChange={(e) => setHabitacionId(e.target.value)}
                  className="border border-slate-400 p-2 rounded-lg text-slate-900 font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Habitación {i + 1}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-sm text-slate-700">Fecha de Entrada</label>
                <input required type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                  className="border border-slate-400 p-2 rounded-lg font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-sm text-slate-700">Fecha de Salida</label>
                <input required type="date" min={fechaInicio} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                  className="border border-slate-400 p-2 rounded-lg font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <button type="submit"
                className="bg-blue-700 text-white p-3 rounded-lg font-bold hover:bg-blue-900 col-span-full transition text-sm">
                + Crear Reserva
              </button>
            </form>

            {/* Alerta de vencidas */}
            {reservasVencidas.length > 0 && (
              <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-4">
                <div>
                  <p className="text-sm font-bold text-red-800">
                    ⚠️ {reservasVencidas.length} reserva{reservasVencidas.length > 1 ? "s" : ""} vencida{reservasVencidas.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Estas reservas tienen fecha de salida anterior a hoy.
                  </p>
                </div>
                <button onClick={handleEliminarVencidas}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-800 text-sm transition">
                  Eliminar todas las vencidas
                </button>
              </div>
            )}

            {/* Grilla de reservas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Huésped</th>
                    <th className="p-3">Hab.</th>
                    <th className="p-3">Fechas</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cargando ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-500">Cargando...</td></tr>
                  ) : reservasLista.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">No hay reservas registradas.</td></tr>
                  ) : (
                    reservasLista.map((res) => {
                      const vencida = estaVencida(res.fechaFin);
                      return (
                        <tr key={res.id} className={`transition ${vencida ? "bg-red-50" : "hover:bg-slate-50"}`}>
                          <td className="p-3 font-extrabold text-blue-900">#{res.id}</td>
                          <td className="p-3 font-semibold">
                            {res.huesped?.apellido}, {res.huesped?.nombre}
                            <span className="block text-xs text-slate-400 font-normal">DNI: {res.huesped?.dni}</span>
                          </td>
                          <td className="p-3 font-semibold">Hab. {res.habitacion?.id}</td>
                          <td className="p-3 text-xs text-slate-600">
                            {res.fechaInicio} → {res.fechaFin}
                            {vencida && <span className="block text-red-500 font-bold mt-0.5">Vencida</span>}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              res.activa ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}>
                              {res.activa ? "Activa" : "Facturada"}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => router.push(`/reservas/${res.huesped?.dni}/facturar?reservaId=${res.id}`)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-800 text-xs transition">
                                Facturar
                              </button>
                              <button
                                onClick={() => handleEliminar(res.id)}
                                className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-800 text-xs transition">
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── TAB: HISTORIAL DE PAGOS ────────────────────────────────────────── */}
        {tabActivo === "historial" && (
          <div className="space-y-4">

            {/* Resumen rápido */}
            {facturas.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Recaudado</p>
                  <p className="text-2xl font-extrabold text-blue-900 mt-1">
                    {formatARS(facturas.reduce((acc, f) => acc + (f.montoTotal ?? 0), 0))}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Facturas Emitidas</p>
                  <p className="text-2xl font-extrabold text-blue-900 mt-1">{facturas.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Promedio por Factura</p>
                  <p className="text-2xl font-extrabold text-blue-900 mt-1">
                    {formatARS(facturas.reduce((acc, f) => acc + (f.montoTotal ?? 0), 0) / facturas.length)}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Reserva</th>
                    <th className="p-3">Huésped</th>
                    <th className="p-3">Forma de Pago</th>
                    <th className="p-3">Adicionales</th>
                    <th className="p-3">Descuento</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3">Fecha Emisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cargando ? (
                    <tr><td colSpan={8} className="p-6 text-center text-slate-500">Cargando...</td></tr>
                  ) : facturas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400">
                        <p className="text-3xl mb-2">🧾</p>
                        <p className="font-semibold">Aún no hay facturas emitidas.</p>
                        <p className="text-xs mt-1">Los pagos aparecerán aquí cuando se facture una reserva.</p>
                      </td>
                    </tr>
                  ) : (
                    facturas.map((f) => {
                      const { cls, emoji } = badgePago(f.formaPago);
                      return (
                        <tr key={f.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-extrabold text-blue-900">#{f.id}</td>
                          <td className="p-3 text-slate-600 font-mono">
                            #{f.reserva?.id ?? f.reservaIdSnapshot ?? "—"}
                            {!f.reserva && f.reservaIdSnapshot && (
                              <span className="block text-[10px] text-slate-400 font-normal">(eliminada)</span>
                            )}
                          </td>
                          <td className="p-3 font-semibold">
                            {f.huespedNombre}
                            <span className="block text-xs text-slate-400 font-normal">DNI: {f.huespedDni}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>
                              {emoji} {f.formaPago}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-slate-600">
                            {[f.adicionalCochera && "🚗 Cochera", f.adicionalFrigobar && "🍶 Frigobar"]
                              .filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="p-3 text-xs">
                            {f.descuentoAplicado > 0
                              ? <span className="text-emerald-600 font-bold">-{f.descuentoAplicado}%</span>
                              : <span className="text-slate-400">—</span>}
                          </td>
                          <td className="p-3 text-right font-extrabold font-mono text-blue-900">
                            {formatARS(f.montoTotal)}
                          </td>
                          <td className="p-3 text-xs text-slate-500">{formatFecha(f.fechaEmision)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
