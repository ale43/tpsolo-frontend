"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GrillaOcupacion from "../componentes/GrillaOcupacion"; // Importamos el componente

export default function GrillaOcupacionPage() {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [fechasColumnas, setFechasColumnas] = useState<string[]>([]);
  const router = useRouter();

  // ... (aquí mantienes tu useEffect y cargarDatosHotel exactamente igual que antes) ...

  const obtenerEstadoCelda = (habId: number, habNumero: string, fechaStr: string) => {
    // ... (tu lógica de estado) ...
  };
// 1. Efecto solo para generar las 30 fechas (se ejecuta una sola vez al montar)
useEffect(() => {
  const listaFechas = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    listaFechas.push(d.toISOString().split('T')[0]); // Formato YYYY-MM-DD
  }
  setFechasColumnas(listaFechas);
}, []); // <--- El array vacío es clave para que no haga loop

// 2. Efecto solo para cargar los datos del backend
useEffect(() => {
  const cargarDatos = async () => {
    try {
      const resHab = await fetch("http://localhost:8081/habitaciones");
      const dataHab = await resHab.json();
      console.log("Datos recibidos:", dataHab);
      setHabitaciones(dataHab);
      
      const resRes = await fetch("http://localhost:8081/reservas");
      const dataRes = await resRes.json();
      setReservas(dataRes);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  cargarDatos();
}, []); // <--- También vacío, se ejecuta solo al montar
console.log("Habitaciones:", habitaciones);
  console.log("Fechas:", fechasColumnas);
  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabecera y Referencias */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-blue-900">Cuadro de Ocupación</h1>
          <button onClick={() => router.push("/")} className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold">
            Volver al Panel Principal
          </button>
        </div>

        {/* AQUÍ LLAMAS AL COMPONENTE */}
        <GrillaOcupacion 
  habitaciones={habitaciones} 
  fechas={fechasColumnas} 
  reservas={reservas} 
/>
      </div>
    </main>
  );
}