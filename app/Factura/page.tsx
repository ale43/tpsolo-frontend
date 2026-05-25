"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GestionReservasPage() {
  const router = useRouter();
  const [reservasLista, setReservasLista] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      const res = await fetch("http://localhost:8081/reservas");
      if (res.ok) setReservasLista(await res.json());
    } catch (error) { console.error(error); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  // Función para facturar
  const handleFacturar = async (reservaId: number) => {
    // Aquí el usuarioId vendría de tu sistema de login (ej. hardcodeado por ahora)
    const usuarioId = 1; 
    const res = await fetch("http://localhost:8081/facturas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservaId, usuarioId })
    });
    if (res.ok) {
      alert("Factura generada con éxito");
      cargarDatos();
    } else {
      alert("Error al facturar");
    }
  };

  const handleEliminar = async (reserva: any) => {
    // Validamos en el frontend antes de tocar el servidor
    // Asumimos que si tiene factura, el objeto factura no es null
    if (!reserva.factura) {
        alert("¡No se puede eliminar! Esta reserva aún no tiene factura.");
        return;
    }

    if (!confirm("¿Seguro que quieres eliminar la reserva #" + reserva.id + "?")) return;
    
    try {
      const res = await fetch(`http://localhost:8081/reservas/${reserva.id}`, { method: "DELETE" });
      if (res.ok) cargarDatos();
      else alert("Error: El servidor impidió la eliminación.");
    } catch (e) { alert("Error de conexión"); }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-950">Gestión de Reservas</h1>
            <button onClick={() => router.push('/')} className="bg-slate-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-slate-800">Volver al Inicio</button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Estado Factura</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reservasLista.map((res) => (
                <tr key={res.id}>
                  <td className="p-3 font-bold">#{res.id}</td>
                  <td className="p-3">
                    {res.factura ? (
                        <span className="text-green-600 font-bold">✅ Facturada (ID: {res.factura.id})</span>
                    ) : (
                        <span className="text-red-600 font-bold">❌ Pendiente</span>
                    )}
                  </td>
                  <td className="p-3">
                    {!res.factura && (
                        <button onClick={() => handleFacturar(res.id)} className="bg-green-600 text-white px-3 py-1 rounded font-bold mr-2">Facturar</button>
                    )}
                    <button onClick={() => handleEliminar(res)} className="bg-red-600 text-white px-3 py-1 rounded font-bold">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}