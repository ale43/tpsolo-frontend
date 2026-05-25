"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AltaHuespedPage() {
  const router = useRouter();

  // Estados del formulario ajustados al TP
  const [apellido, setApellido] = useState("");
  const [nombres, setNombres] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [cuit, setCuit] = useState("");
  const [posicionIva, setPosicionIva] = useState("Consumidor Final");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [direccion, setDireccion] = useState("");
  
  // Campos complementarios del formulario original
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  // Control de estados visuales y flujos alternativos
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  
  // Flujo 2.B: Alerta de documento duplicado
  const [mostrarAlertaDuplicado, setMostrarAlertaDuplicado] = useState(false);

  // Referencia para devolver el foco en caso de corrección
  const tipoDocRef = useRef<HTMLSelectElement>(null);

  const handleCrearHuesped = async (e?: React.FormEvent, forzarAlta = false) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setExitoMsg(null);
    setGuardando(true);

    // Validación de negocio del TP: Responsable Inscripto requiere CUIT obligatoriamente
    if (posicionIva === "Responsable Inscripto" && !cuit.trim()) {
      setErrorMsg("La condición de IVA 'Responsable Inscripto' exige la carga obligatoria del CUIT.");
      setGuardando(false);
      return;
    }

    // Validación básica de documento numérico
    if (!numeroDocumento.trim() || isNaN(Number(numeroDocumento.trim()))) {
      setErrorMsg("Por favor, ingrese un número de documento válido (solo números).");
      setGuardando(false);
      return;
    }

    // Traducimos los campos visuales del TP al formato que tu Java (Huesped.java) entiende.
    // OMITIMOS tipoDocumento, cuit y fechaNacimiento porque el backend actual no los procesa.
    const huespedPayload = {
      nombre: nombres.trim().toUpperCase(),    // Java espera "nombre", no "nombres"
      apellido: apellido.trim().toUpperCase(), // Java espera "apellido"
      dni: numeroDocumento.trim(),              // Java espera "dni", no "numeroDocumento"
      direccion: direccion.trim().toUpperCase(),
      posicionIva: posicionIva,
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      forzarDuplicado: forzarAlta               // Indicador para el flujo 2.B del backend
    };

    try {
      console.log("Enviando datos de alta al backend:", huespedPayload);
      
      const response = await fetch("http://localhost:8081/huespedes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(huespedPayload),
      });

      if (response.ok) {
        setExitoMsg(`El huésped ${nombres.trim().toUpperCase()} ${apellido.trim().toUpperCase()} ha sido satisfactoriamente cargado al sistema.`);
        setMostrarAlertaDuplicado(false);
        
        // Limpiamos los campos del formulario
        setApellido("");
        setNombres("");
        setTipoDocumento("DNI");
        setNumeroDocumento("");
        setCuit("");
        setPosicionIva("Consumidor Final");
        setFechaNacimiento("");
        setDireccion("");
        setEmail("");
        setTelefono("");

        // Redirección al listado buscador
        setTimeout(() => router.push("/huespedes"), 2500);
      } else if (response.status === 409 || response.status === 400) {
        const errorTexto = await response.text();
        
        // Si el backend advierte duplicado y el cliente no lo forzó aún (Flujo 2.B)
        if ((errorTexto.toLowerCase().includes("duplicado") || response.status === 409) && !forzarAlta) {
          setMostrarAlertaDuplicado(true);
        } else {
          setErrorMsg(errorTexto || `Error ${response.status}: El backend rechazó los datos.`);
        }
      } else {
        setErrorMsg(`Error ${response.status}: Problema interno del servidor.`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrorMsg("No se pudo conectar con el servidor backend. Comprobá que Spring Boot esté levantado.");
    } finally {
      setGuardando(false);
    }
  };

  // Manejador para la opción "CORREGIR" del flujo alternativo
  const handleCorregirDuplicado = () => {
    setMostrarAlertaDuplicado(false);
    if (tipoDocRef.current) {
      tipoDocRef.current.focus(); // Devuelve el foco al campo inicial del documento
    }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Cabecera de navegación */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Registrar Huésped</h1>
            <p className="text-slate-500 text-sm mt-1">CU09 - Cargar datos personales de huéspedes nuevos</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition"
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => router.push("/huespedes")}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-950 transition"
            >
              Buscador
            </button>
          </div>
        </div>

        {/* Alertas dinámicas */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-900 font-semibold text-sm shadow-xs">
            ⚠️ {errorMsg}
          </div>
        )}
        {exitoMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-900 font-semibold text-sm shadow-xs">
            ✅ {exitoMsg}
          </div>
        )}

        {/* Interfaz Interactiva del Flujo Alternativo 2.B (Documento Duplicado) */}
        {mostrarAlertaDuplicado && (
          <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl shadow-md space-y-4">
            <div className="text-amber-950 font-bold text-sm flex items-center gap-2">
              <span>⚠️</span> ¡CUIDADO! El tipo y número de documento ya existen en el sistema.
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleCrearHuesped(undefined, true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
              >
                ACEPTAR IGUALMENTE
              </button>
              <button
                type="button"
                onClick={handleCorregirDuplicado}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-lg transition"
              >
                CORREGIR
              </button>
            </div>
          </div>
        )}

        {/* Formulario de carga completo */}
        <form onSubmit={(e) => handleCrearHuesped(e, false)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          
          {/* Apellido y Nombres */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Apellido *</label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value.toUpperCase())}
                placeholder="EJ: PEREZ"
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombres *</label>
              <input
                type="text"
                required
                value={nombres}
                onChange={(e) => setNombres(e.target.value.toUpperCase())}
                placeholder="EJ: GUSTAVO RAUL"
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition uppercase"
              />
            </div>
          </div>

          {/* Tipo y Número de Documento */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo Doc *</label>
              <select
                ref={tipoDocRef}
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="DNI">DNI</option>
                <option value="LE">LE</option>
                <option value="LC">LC</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Número Documento *</label>
              <input
                type="text"
                required
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Ej: 40903511"
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha de Nacimiento *</label>
            <input
              type="date"
              required
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Posición IVA y CUIT Condicional */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Posición Frente al IVA</label>
              <select
                value={posicionIva}
                onChange={(e) => setPosicionIva(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="Consumidor Final">Consumidor Final</option>
                <option value="Responsable Inscripto">Responsable Inscripto</option>
                <option value="Monotributista">Monotributista</option>
                <option value="Exento">Exento</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                CUIT {posicionIva === "Responsable Inscripto" ? "*" : "(Opcional)"}
              </label>
              <input
                type="text"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                placeholder="Ej: 20409035112"
                className={`w-full border p-2.5 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  posicionIva === "Responsable Inscripto" ? "border-orange-400 bg-orange-50/20" : "border-slate-300"
                }`}
              />
            </div>
          </div>

          {/* Dirección / Domicilio */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dirección / Domicilio *</label>
            <input
              type="text"
              required
              value={direccion}
              onChange={(e) => setDireccion(e.target.value.toUpperCase())}
              placeholder="EJ: URQUIZA 1234, SANTA FE"
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition uppercase"
            />
          </div>

          {/* Datos de contacto adicionales */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email (Contacto)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 3424556677"
                className="w-full border border-slate-200 p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={guardando || mostrarAlertaDuplicado}
            className={`w-full text-white p-3 rounded-xl font-bold text-sm mt-2 shadow-md transition-all ${
              guardando || mostrarAlertaDuplicado ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-blue-900 hover:bg-blue-950 active:scale-[0.99]"
            }`}
          >
            {guardando ? "Registrando en Sistema..." : "Registrar Pasajero"}
          </button>
        </form>
      </div>
    </main>
  );
}