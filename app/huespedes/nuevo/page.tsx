"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AltaHuespedPage() {
  const router = useRouter();

  // Estados del formulario alineados con tus columnas de pgAdmin
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");

  // Control de estados visuales
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const handleCrearHuesped = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setExitoMsg(null);
    setGuardando(true);

    const emailLimpio = email.trim();

    // Payload adaptado a tus columnas reales de Postgres y entidad Huesped.java
    const huespedPayload = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      documento: dni.trim(), 
      email: emailLimpio || null
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

        // Redirecciona al buscador general de huéspedes
        setTimeout(() => router.push("/huespedes"), 2000);
      } else {
        const errorTexto = await response.text();
        setErrorMsg(errorTexto || `Error ${response.status}: El backend rechazó los datos del formulario.`);
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
        
        {/* Cabecera con navegación doble */}
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

        {/* Alertas */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-900 font-semibold text-sm">
            Error: {errorMsg}
          </div>
        )}
        {exitoMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-900 font-semibold text-sm">
            Éxito: {exitoMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleCrearHuesped} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Gustavo"
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Número de DNI *</label>
            <input
              type="text"
              required
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 40903511"
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email de Contacto*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: gustavo@gmail.com"
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className={`w-full text-white p-3 rounded-xl font-bold text-sm mt-2 shadow-md transition ${
              guardando ? "bg-slate-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950"
            }`}
          >
            {guardando ? "Guardando Cambios..." : "Dar de Alta Pasajero"}
          </button>
        </form>

      </div>
    </main>
  );
}