"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function FacturarReservaPage() {
  const router = useRouter();
  const { dni } = useParams();
  const searchParams = useSearchParams();
  const reservaId = searchParams.get("reservaId"); // ← leemos el ID de la URL

  const [cargando, setCargando] = useState(true);
  const [montoBase, setMontoBase] = useState(0);
  const [huespedNombre, setHuespedNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [habitacionId, setHabitacionId] = useState<number | null>(null);

  // Adicionales (Decorator)
  const [cochera, setCochera] = useState(false);
  const [frigobar, setFrigobar] = useState(false);
  const PRECIO_COCHERA = 25000;
  const PRECIO_FRIGOBAR = 35000;
  const PRECIO_NOCHE_BASE = 30000;

  // Estrategia de pago
  const [formaPago, setFormaPago] = useState("EFECTIVO");
  const [tarjetaNumero, setTarjetaNumero] = useState("");
  const [tarjetaCuotas, setTarjetaCuotas] = useState("1");
  const [tarjetaBanco, setTarjetaBanco] = useState("");
  const [chequeNumero, setChequeNumero] = useState("");
  const [chequeBanco, setChequeBanco] = useState("");
  const [chequeVencimiento, setChequeVencimiento] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ─── Cargar la reserva por su ID ────────────────────────────────────────────
  useEffect(() => {
    if (!reservaId) {
      setErrorMsg("No se encontró el ID de la reserva en la URL.");
      setCargando(false);
      return;
    }

    const cargarReserva = async () => {
      try {
        // Usamos GET /reservas/{id} — endpoint que agregamos al controller
        const res = await fetch(`http://localhost:8081/reservas/${reservaId}`);
        if (res.ok) {
          const data = await res.json();

          // Calcular noches y monto base
          const inicio = new Date(data.fechaInicio);
          const fin = new Date(data.fechaFin);
          const noches = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
          setMontoBase(noches * PRECIO_NOCHE_BASE);

          // Datos del huésped que vienen dentro del objeto reserva
          setHuespedNombre(`${data.huesped?.apellido || ""}, ${data.huesped?.nombre || ""}`);
          setFechaInicio(data.fechaInicio);
          setFechaFin(data.fechaFin);
          setHabitacionId(data.habitacion?.id ?? null);
        } else {
          setErrorMsg(`No se pudo cargar la reserva #${reservaId}. Código: ${res.status}`);
        }
      } catch (err) {
        console.error("Error de red al cargar reserva:", err);
        setErrorMsg("Error de conexión con el servidor. ¿Está corriendo Spring Boot?");
      } finally {
        setCargando(false);
      }
    };

    cargarReserva();
  }, [reservaId]);

  // ─── Cálculo de total dinámico ───────────────────────────────────────────────
  const calcularTotal = () => {
    let total = montoBase;
    if (cochera) total += PRECIO_COCHERA;
    if (frigobar) total += PRECIO_FRIGOBAR;
    if (formaPago === "EFECTIVO") total = total * 0.9;
    return total;
  };

  const formatARS = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  // ─── Enviar factura al backend ───────────────────────────────────────────────
  const handleProcesarFacturacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg(null);

    const payloadFactura = {
      reservaId: Number(reservaId),   // ← clave para que el backend encuentre la reserva
      huespedDni: dni,
      aplicarCochera: cochera,
      aplicarFrigobar: frigobar,
      formaPago: formaPago,
      detallesPago: {
        tarjetaNumero: formaPago === "TARJETA" ? tarjetaNumero : null,
        cuotas: formaPago === "TARJETA" ? parseInt(tarjetaCuotas) : null,
        tarjetaBanco: formaPago === "TARJETA" ? tarjetaBanco : null,
        chequeNumero: formaPago === "CHEQUE" ? chequeNumero : null,
        chequeBanco: formaPago === "CHEQUE" ? chequeBanco : null,
        chequeVencimiento: formaPago === "CHEQUE" ? chequeVencimiento : null,
      },
    };

    try {
      const response = await fetch("http://localhost:8081/facturas/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFactura),
      });

      if (response.ok) {
        alert("¡Factura emitida y registrada con éxito!");
        router.push("/reservas");
      } else {
        const txt = await response.text();
        setErrorMsg(txt || "Error al registrar la factura en el servidor.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con Spring Boot.");
    } finally {
      setGuardando(false);
    }
  };

  // ─── Pantalla de carga ───────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="p-8 text-center text-slate-600 font-semibold min-h-screen flex items-center justify-center bg-slate-50">
        <span>Cargando datos de la reserva #{reservaId}...</span>
      </div>
    );
  }

  // ─── Render principal ────────────────────────────────────────────────────────
  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Cabecera */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">
            Cierre y Facturación de Estadía
          </h1>
          <div className="text-slate-500 text-sm mt-2 space-y-0.5">
            <p>
              Reserva: <span className="font-bold text-blue-800">#{reservaId}</span>
              {" · "}
              Habitación: <span className="font-bold text-blue-800">
                {habitacionId ? `#${habitacionId}` : "—"}
              </span>
            </p>
            <p>
              DNI: <span className="font-bold text-blue-800">{dni}</span>
              {" · "}
              Pasajero: <span className="font-bold">{huespedNombre}</span>
            </p>
            {fechaInicio && fechaFin && (
              <p className="text-xs text-slate-400">
                Estadía: {fechaInicio} → {fechaFin}
              </p>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-900 font-semibold text-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleProcesarFacturacion} className="space-y-6">

          {/* SECCIÓN 1: Adicionales (Decorator) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              1. Servicios Adicionales (Decorators)
            </h3>
            <p className="text-xs text-slate-400">
              Marque los servicios utilizados durante la estadía.
            </p>
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={cochera}
                  onChange={(e) => setCochera(e.target.checked)}
                  className="w-4 h-4 accent-blue-900"
                />
                <div>
                  <span className="text-sm font-bold text-slate-800">Uso de Cochera / Estacionamiento</span>
                  <span className="block text-xs text-emerald-600 font-semibold">
                    +{formatARS(PRECIO_COCHERA)}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={frigobar}
                  onChange={(e) => setFrigobar(e.target.checked)}
                  className="w-4 h-4 accent-blue-900"
                />
                <div>
                  <span className="text-sm font-bold text-slate-800">Consumos del Frigobar</span>
                  <span className="block text-xs text-emerald-600 font-semibold">
                    +{formatARS(PRECIO_FRIGOBAR)}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* SECCIÓN 2: Forma de Pago (Strategy) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              2. Método de Pago (Strategy Pattern)
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Forma de Pago
              </label>
              <select
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="EFECTIVO">💵 Efectivo (10% de descuento)</option>
                <option value="TARJETA">💳 Tarjeta de Crédito / Débito</option>
                <option value="CHEQUE">🏢 Cheque Bancario</option>
              </select>
            </div>

            {/* Campos Tarjeta */}
            {formaPago === "TARJETA" && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Número de Tarjeta *</label>
                  <input
                    type="text" required placeholder="xxxx-xxxx-xxxx-xxxx"
                    value={tarjetaNumero} onChange={(e) => setTarjetaNumero(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Banco Emisor *</label>
                  <input
                    type="text" required placeholder="Ej: Galicia"
                    value={tarjetaBanco} onChange={(e) => setTarjetaBanco(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Plan de Cuotas</label>
                  <select
                    value={tarjetaCuotas} onChange={(e) => setTarjetaCuotas(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white outline-none"
                  >
                    <option value="1">1 Cuota (Sin Interés)</option>
                    <option value="3">3 Cuotas</option>
                    <option value="6">6 Cuotas</option>
                  </select>
                </div>
              </div>
            )}

            {/* Campos Cheque */}
            {formaPago === "CHEQUE" && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Número de Cheque *</label>
                  <input
                    type="text" required placeholder="Ej: 9940122"
                    value={chequeNumero} onChange={(e) => setChequeNumero(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Banco de Origen *</label>
                  <input
                    type="text" required placeholder="Ej: Banco Nación"
                    value={chequeBanco} onChange={(e) => setChequeBanco(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Fecha de Vencimiento *</label>
                  <input
                    type="date" required
                    value={chequeVencimiento} onChange={(e) => setChequeVencimiento(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RESUMEN TOTAL */}
          <div className="bg-blue-950 text-white p-6 rounded-2xl shadow-md space-y-3">
            <h4 className="text-xs font-bold uppercase text-blue-300 tracking-wider">
              Monto Final Consolidado
            </h4>

            <div className="flex justify-between items-center text-sm border-b border-blue-900 pb-2">
              <span className="text-slate-300">Costo Base ({fechaInicio && fechaFin
                ? `${Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 86400000)} noches`
                : "reserva"}):
              </span>
              <span className="font-mono">{formatARS(montoBase)}</span>
            </div>

            {(cochera || frigobar) && (
              <div className="text-sm border-b border-blue-900 pb-2 space-y-1">
                <span className="text-xs text-blue-300 font-bold block uppercase">Adicionales:</span>
                {cochera && (
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>• Cochera</span>
                    <span>+{formatARS(PRECIO_COCHERA)}</span>
                  </div>
                )}
                {frigobar && (
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>• Frigobar</span>
                    <span>+{formatARS(PRECIO_FRIGOBAR)}</span>
                  </div>
                )}
              </div>
            )}

            {formaPago === "EFECTIVO" && (
              <div className="flex justify-between items-center text-xs text-emerald-400 border-b border-blue-900 pb-2">
                <span>Descuento Efectivo:</span>
                <span>-10%</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold">Total a Facturar:</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400">
                {formatARS(calcularTotal())}
              </span>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/reservas")}
              className="w-1/3 bg-slate-200 text-slate-700 p-3 rounded-xl font-bold text-sm hover:bg-slate-300 transition"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={guardando}
              className={`w-2/3 text-white p-3 rounded-xl font-bold text-sm shadow-md transition ${
                guardando ? "bg-slate-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950"
              }`}
            >
              {guardando ? "Procesando..." : "🧾 Emitir Factura y Finalizar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
