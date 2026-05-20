"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ModificarHuespedPage() {
  const router = useRouter();
  const { dni } = useParams(); // Recuperamos el DNI desde la URL del navegador

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [posicionIva, setPosicionIva] = useState("Consumidor Final");

  // Estados de control
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);

  // 1. Cargar los datos actuales del huésped al abrir la pantalla
  useEffect(() => {
    const cargarDatosHuesped = async () => {
      try {
        const res = await fetch(`http://localhost:8081/huespedes/buscar?termino=${dni}`);
        if (res.ok) {
          const lista = await res.json();
          // Como devuelve una lista el buscador, agarramos el primer elemento coincidente
          if (lista && lista.length > 0) {
            const h = lista[0];
            setNombre(h.nombre || "");
            setApellido(h.apellido || "");
            setEmail(h.email || "");
            setTelefono(h.telefono || "");
            setDireccion(h.direccion || "");
            setPosicionIva(h.posicionIva || "Consumidor Final");
          } else {
            setErrorMsg("No se encontraron datos para el DNI indicado.");
          }
        } else {
          setErrorMsg("Error al conectar con la API para traer los datos originales.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Error crítico al intentar cargar la información del huésped.");
      } finally {
        setCargando(false);
      }
    };

    if (dni) cargarDatosHuesped();
  }, [dni]);

  // 2. Enviar los cambios modificados al backend (MÉTODO PUT)
  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setExitoMsg(null);
    setGuardando(true);

    const payloadModificado = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni, // Se mantiene intacto
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      direccion: direccion.trim() || null,
      posicionIva: posicionIva
    };

    try {
      const response = await fetch(`http://localhost:8081/huespedes/${dni}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadModificado),
      });

      if (response.ok) {
        setExitoMsg("Los datos del pasajero se actualizaron correctamente.");
        setTimeout(() => router.push("/huespedes"), 2000);
      } else {
        const texto = await response.text();
        setErrorMsg(texto || "Ocurrió un problema en el backend al intentar actualizar.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("No hay conexión con el servidor de Spring Boot.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen text-center font-semibold text-slate-600">
        Cargando datos del huésped...
      </div>
    );
  }

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Modificar Datos</h1>
            <p className="text-slate-500 text-sm mt-1">Actualizando perfil del DNI: <span className="font-bold text-blue-800">{dni}</span></p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/huespedes")}
            className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition"
          >
            Cancelar y Volver
          </button>
        </div>

        {/* Alertas */}
        {errorMsg && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-900 font-semibold text-sm">Error: {errorMsg}</div>}
        {exitoMsg && <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-900 font-semibold text-sm">Éxito: {exitoMsg}</div>}

        {/* Formulario */}
        <form onSubmit={handleGuardarCambios} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
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
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* DNI Grisado (Bloqueado) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Número de DNI (No modificable)</label>
            <input
              type="text"
              disabled
              value={dni}
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-100 text-slate-400 cursor-not-allowed outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email de Contacto</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dirección / Domicilio</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Posición Frente al IVA</label>
            <select
              value={posicionIva}
              onChange={(e) => setPosicionIva(e.target.value)}
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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
            className={`w-full text-white p-3 rounded-xl font-bold text-sm mt-2 shadow-md transition ${
              guardando ? "bg-slate-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950"
            }`}
          >
            {guardando ? "Modificando Pasajero..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </main>
  );
}