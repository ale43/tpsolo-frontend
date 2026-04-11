"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]); // Estado para las reservas
  const [nuevoH, setNuevoH] = useState({ dni: "", nombre: "", apellido: "" });
  
  // Para la nueva reserva
  const [selDni, setSelDni] = useState("");
  const [selHab, setSelHab] = useState({ id: "", numero: "" });

  const refresh = async () => {
    const resHue = await fetch("http://localhost:8081/huespedes");
    setHuespedes(await resHue.json());
    const resHab = await fetch("http://localhost:8081/habitaciones");
    setHabitaciones(await resHab.json());
    const resRes = await fetch("http://localhost:8081/reservas");
    setReservas(await resRes.json());
  };

  useEffect(() => { refresh(); }, []);

  const handleAlta = async (e: any) => {
    e.preventDefault();
    if(!nuevoH.dni || !nuevoH.nombre || !nuevoH.apellido) return alert("Completá todo");
    const response = await fetch("http://localhost:8081/huespedes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoH),
    });
    if (response.ok) {
      alert("Huésped cargado");
      setNuevoH({ dni: "", nombre: "", apellido: "" });
      refresh();
    }
  };

  const handleReservar = async () => {
    if(!selDni || !selHab.id) return alert("Seleccioná huésped y habitación");
    
    const bodyReserva = {
      dni: selDni,
      habitacionId: selHab.id.toString(),
      numeroHab: selHab.numero,
      desde: new Date().toISOString().split('T')[0], // Hoy
      hasta: "2026-04-20" // Fecha de ejemplo
    };

    const res = await fetch("http://localhost:8081/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyReserva),
    });

    if(res.ok) {
      alert("¡Reserva creada con éxito!");
      setSelDni("");
      setSelHab({ id: "", numero: "" });
      refresh();
    } else {
      alert("Error: La habitación podría no estar disponible.");
    }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-blue-900">Hotel Paraná</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ALTA */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4">1. Registrar Huésped</h2>
            <form onSubmit={handleAlta} className="space-y-4">
              <input className="w-full border p-3 rounded" placeholder="DNI" value={nuevoH.dni} onChange={e => setNuevoH({...nuevoH, dni: e.target.value})} />
              <input className="w-full border p-3 rounded" placeholder="Nombre" value={nuevoH.nombre} onChange={e => setNuevoH({...nuevoH, nombre: e.target.value})} />
              <input className="w-full border p-3 rounded" placeholder="Apellido" value={nuevoH.apellido} onChange={e => setNuevoH({...nuevoH, apellido: e.target.value})} />
              <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">DAR DE ALTA</button>
            </form>
          </section>

          {/* SELECCIÓN Y LOGICA */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4">2. Crear Reserva</h2>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Huésped: <span className="font-bold text-blue-600">{selDni || "Ninguno"}</span></p>
              <p className="text-sm text-slate-500">Habitación: <span className="font-bold text-green-600">{selHab.numero || "Ninguna"}</span></p>
              <button onClick={handleReservar} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">CONFIRMAR RESERVA</button>
            </div>
          </section>
        </div>

        {/* LISTADOS INTERACTIVOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-bold mb-4">Huéspedes (Click para seleccionar)</h2>
            <div className="divide-y">
              {huespedes.map((h: any) => (
                <div key={h.dni} onClick={() => setSelDni(h.dni)} className={`py-2 cursor-pointer hover:bg-slate-50 ${selDni === h.dni ? 'bg-blue-50' : ''}`}>
                  {h.apellido}, {h.nombre} ({h.dni})
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-bold mb-4">Habitaciones (Click para seleccionar)</h2>
            <div className="grid grid-cols-2 gap-2">
              {habitaciones.map((hab: any) => (
                <div key={hab.id} onClick={() => setSelHab({id: hab.id, numero: hab.numero})} 
                     className={`p-3 border rounded text-center cursor-pointer ${selHab.id === hab.id ? 'border-green-500 bg-green-50' : 'bg-slate-50'}`}>
                  N° {hab.numero}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLA DE RESERVAS FINAL */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-blue-900">3. Cuadro de Reservas Actuales</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Huésped</th>
                <th className="py-2">Habitación</th>
                <th className="py-2">Desde</th>
                <th className="py-2">Hasta</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r: any) => (
                <tr key={r.id} className="border-b text-sm">
                  <td className="py-2">{r.huesped.nombre} {r.huesped.apellido}</td>
                  <td className="py-2">N° {r.habitacion.numero}</td>
                  <td className="py-2">{r.fechaInicio}</td>
                  <td className="py-2">{r.fechaFin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}