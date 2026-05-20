"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function FacturarReservaPage() {
  const router = useRouter();
  const { dni } = useParams(); // Usamos 'dni' porque coincide con el nombre de tu carpeta [dni]

  // Estados para simular o traer datos de la reserva
  const [cargando, setCargando] = useState(true);
  const [montoBase, setMontoBase] = useState(0);
  const [huespedNombre, setHuespedNombre] = useState("");

  // --- ADICIONALES (Patrón Decorator en el Backend) ---
  const [cochera, setCochera] = useState(false);
  const [frigobar, setFrigobar] = useState(false);
  
  // Precios fijos de adicionales para la simulación visual en la UI
  const PRECIO_COCHERA = 25000;
  const PRECIO_FRIGOBAR = 35000;

  // --- ESTRATEGIA DE PAGO (Tarjeta, Cheque, Efectivo) ---
  const [formaPago, setFormaPago] = useState("EFECTIVO");
  
  // Campos específicos según la forma de pago elegida
  const [tarjetaNumero, setTarjetaNumero] = useState("");
  const [tarjetaCuotas, setTarjetaCuotas] = useState("1");
  const [tarjetaBanco, setTarjetaBanco] = useState("");
  
  const [chequeNumero, setChequeNumero] = useState("");
  const [chequeBanco, setChequeBanco] = useState("");
  const [chequeVencimiento, setChequeVencimiento] = useState("");

  // Estados de control del formulario
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Cargar datos de la reserva al entrar a la pantalla usando el DNI
  useEffect(() => {
    const cargarReserva = async () => {
      try {
        // Buscamos la reserva asociada a este DNI del pasajero
        const res = await fetch(`http://localhost:8081/reservas/huesped/${dni}`);
        if (res.ok) {
          const data = await res.json();
          setMontoBase(data.montoBase || 120000); // Valor fallback por si viene vacío
          setHuespedNombre(`${data.huesped?.apellido || ""}, ${data.huesped?.nombre || ""}`);
        } else {
          // Valores Mock/Simulados para que pruebes la UI si el backend no encuentra el DNI
          setMontoBase(85000);
          setHuespedNombre("PEPINILLO, GUSTAVO");
        }
      } catch (err) {
        console.error("Error al conectar con reservas, usando simulación", err);
        setMontoBase(85000);
        setHuespedNombre("PEPINILLO, GUSTAVO");
      } finally {
        setCargando(false);
      }
    };

    if (dni) cargarReserva();
  }, [dni]);

  // 2. Calcular el Subtotal Dinámico en el cliente
  const calcularTotal = () => {
    let total = montoBase;
    if (cochera) total += PRECIO_COCHERA;
    if (frigobar) total += PRECIO_FRIGOBAR;
    
    // Simulación del descuento por efectivo (Strategy)
    if (formaPago === "EFECTIVO") {
      total = total * 0.9; // 10% de descuento
    }
    return total;
  };

  // 3. Procesar el Pago y Enviar al Backend
  const handleProcesarFacturacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg(null);

    // Armando el payload con los Decorators y las Estrategias de Pago correspondientes
    const payloadFactura = {
      huespedDni: dni,
      aplicarCochera: cochera,
      aplicarFrigobar: frigobar,
      formaPago: formaPago,
      // Datos dinámicos de la estrategia elegida
      detallesPago: {
        tarjetaNumero: formaPago === "TARJETA" ? tarjetaNumero : null,
        cuotas: formaPago === "TARJETA" ? parseInt(tarjetaCuotas) : null,
        tarjetaBanco: formaPago === "TARJETA" ? tarjetaBanco : null,
        chequeNumero: formaPago === "CHEQUE" ? chequeNumero : null,
        chequeBanco: formaPago === "CHEQUE" ? chequeBanco : null,
        chequeVencimiento: formaPago === "CHEQUE" ? chequeVencimiento : null,
      }
    };

    try {
      console.log("Enviando datos de facturación al backend:", payloadFactura);
      
      const response = await fetch(`http://localhost:8081/facturas/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFactura),
      });

      if (response.ok) {
        alert("¡Factura emitida y registrada con éxito en el backend!");
        router.push("/reservas"); // Volver a la grilla general de reservas
      } else {
        const txt = await response.text();
        setErrorMsg(txt || "Error al intentar registrar la factura en el servidor.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión con Spring Boot. El backend no respondió.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="p-8 text-center text-slate-600 font-semibold">Procesando checkout...</div>;
  }

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Cierre y Facturación de Estadía</h1>
          <p className="text-slate-500 text-sm mt-1">DNI Responsable: <span className="font-bold text-blue-800">{dni}</span> — Pasajero: {huespedNombre}</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-900 font-semibold text-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleProcesarFacturacion} className="space-y-6">
          
          {/* SECCIÓN 1: Decorators (Adicionales consumidos) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">1. Servicios Adicionales (Decorators)</h3>
            <p className="text-xs text-slate-400">Marque los servicios utilizados para recalcular el costo total de la habitación.</p>
            
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                <input 
                  type="checkbox" 
                  checked={cochera} 
                  onChange={(e) => setCochera(e.target.checked)}
                  className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-800">Uso de Cochera / Estacionamiento</span>
                  <span className="block text-xs text-emerald-600 font-semibold">+{PRECIO_COCHERA.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                <input 
                  type="checkbox" 
                  checked={frigobar} 
                  onChange={(e) => setFrigobar(e.target.checked)}
                  className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-800">Consumos del Frigobar</span>
                  <span className="block text-xs text-emerald-600 font-semibold">+{PRECIO_FRIGOBAR.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
                </div>
              </label>
            </div>
          </div>

          {/* SECCIÓN 2: Strategy (Formas de Pago Dinámicas) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">2. Método de Pago (Strategy Pattern)</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Seleccione la Forma de Pago</label>
              <select
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="EFECTIVO">💵 Efectivo (Aplica 10% Descuento)</option>
                <option value="TARJETA">💳 Tarjeta de Crédito / Débito</option>
                <option value="CHEQUE">🏢 Cheque Bancario</option>
              </select>
            </div>

            {/* RENDER CONDICIONAL: CAMPOS DE TARJETA */}
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

            {/* RENDER CONDICIONAL: CAMPOS DE CHEQUE */}
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
                  <label className="block text-xs font-bold text-slate-600 mb-1">Fecha de Cobro / Vencimiento *</label>
                  <input 
                    type="date" required
                    value={chequeVencimiento} onChange={(e) => setChequeVencimiento(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RESUMEN FINAL DE LA FACTURA CORREGIDO */}
          <div className="bg-blue-950 text-white p-6 rounded-2xl shadow-md space-y-3">
            <h4 className="text-xs font-bold uppercase text-blue-300 tracking-wider">Monto Final Consolidado</h4>
            <div className="flex justify-between items-center text-sm border-b border-blue-900 pb-2">
              <span className="text-slate-300">Costo Base Reserva:</span>
              <span className="font-mono">{montoBase.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
            </div>
            
            {(cochera || frigobar) && (
              <div className="text-sm border-b border-blue-900 pb-2 space-y-1">
                <span className="text-xs text-blue-300 font-bold block uppercase">Servicios Adicionales:</span>
                {cochera && (
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>• Cochera</span>
                    <span>+{PRECIO_COCHERA.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
                  </div>
                )}
                {frigobar && (
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>• Frigobar</span>
                    <span>+{PRECIO_FRIGOBAR.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
                  </div>
                )}
              </div>
            )}

            {formaPago === "EFECTIVO" && (
              <div className="flex justify-between items-center text-xs text-emerald-400 border-b border-blue-900 pb-2">
                <span>Descuento Especial Efectivo:</span>
                <span>-10%</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold">Total a Facturar:</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400">
                {calcularTotal().toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </span>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/reservas")}
              className="w-1/3 bg-slate-200 text-slate-700 p-3 rounded-xl font-bold text-sm hover:bg-slate-300 transition"
            >
              Volver a Reservas
            </button>
            <button
              type="submit"
              disabled={guardando}
              className={`w-2/3 text-white p-3 rounded-xl font-bold text-sm shadow-md transition ${
                guardando ? "bg-slate-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950"
              }`}
            >
              {guardando ? "Procesando Cobro..." : "🧾 Emitir Factura y Finalizar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}