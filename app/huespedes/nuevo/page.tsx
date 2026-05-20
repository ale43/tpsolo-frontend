"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AltaHuespedPage() {
  const router = useRouter();

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [posicionIva, setPosicionIva] = useState("Consumidor Final");

  // Control de estados visuales
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const handleCrearHuesped = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setExitoMsg(null);
    setGuardando(true);

    // Validación básica en el cliente para evitar strings vacíos tramposos
    if (!dni.trim() || isNaN(Number(dni.trim()))) {
      setErrorMsg("Por favor, ingrese un número de DNI válido (solo números).");
      setGuardando(false);
      return;
    }

    const huespedPayload = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      direccion: direccion.trim() || null,
      posicionIva: posicionIva
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
        setExitoMsg("Huésped registrado con éxito en la base de datos.");
        
        // Limpiamos los campos del formulario
        setNombre("");
        setApellido("");
        setDni("");
        setEmail("");
        setTelefono("");
        setDireccion("");
        setPosicionIva("Consumidor Final");

        // Redirección diferida al listado general
        setTimeout(() => router.push("/huespedes"), 2000);
      } else {
        // Si el backend responde con un error 400 (DNI duplicado), el mensaje viaja por acá
        const errorTexto = await response.text();
        setErrorMsg(errorTexto || `Error ${response.status}: El backend rechazó los datos.`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrorMsg("No se pudo conectar con el servidor backend. Comprobá que Spring Boot esté levantado.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Registrar Huésped</h1>
            <p className="text-slate-500 text-sm mt-1">Alta e inserción directa en el sistema de gestión</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition"
            >
              Volver al Inicio
            </button>
            <button
              type="button"
              onClick={() => router.push("/huespedes")}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-950 transition"
            >
              Ir al Buscador
            </button>
          </div>
        </div>

        {/* Alertas dinámicas */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-900 font-semibold text-sm transition-all shadow-xs">
            ⚠️ {errorMsg}
          </div>
        )}
        {exitoMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-900 font-semibold text-sm transition-all shadow-xs">
            ✅ {exitoMsg}
          </div>
        )}

        {/* Formulario de carga */}
        <form onSubmit={handleCrearHuesped} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Gustavo"
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Apellido *</label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej: Pepinillo"
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Número de DNI *</label>
            <input
              type="text"
              required
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 40903511"
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email de Contacto</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej: gustavo@gmail.com"
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 3434556677"
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dirección / Domicilio</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Urquiza 1234, Paraná"
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

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

          <button
            type="submit"
            disabled={guardando}
            className={`w-full text-white p-3 rounded-xl font-bold text-sm mt-2 shadow-md transition-all ${
              guardando ? "bg-slate-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950 active:scale-[0.99]"
            }`}
          >
            {guardando ? "Guardando Pasajero..." : "Dar de Alta Pasajero"}
          </button>
        </form>
      </div>
    </main>
  );
}