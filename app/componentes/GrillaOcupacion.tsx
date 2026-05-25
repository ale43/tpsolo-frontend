"use client";

import React from "react";

interface GrillaOcupacionProps {
  habitaciones: any[];
  fechas: string[];
  reservas: any[];
}

export default function GrillaOcupacion({ habitaciones, fechas, reservas }: GrillaOcupacionProps) {
  
  const obtenerReservaCelda = (habitacionId: number, fechaStr: string) => {
    // CORRECCIÓN: Guardia de seguridad para evitar "reservas.find is not a function"
    if (!Array.isArray(reservas)) return undefined;

    return reservas.find((r) => {
      // Validar que la reserva tenga estructura
      if (!r || typeof r !== 'object') return false;
      
      if (r.activa === false) return false;
      
      const idHab = r.habitacion?.id || r.habitacionId || r.habitacion_id;
      const fInicio = r.fechaInicio || r.fecha_inicio;
      const fFin = r.fechaFin || r.fecha_fin;

      if (!idHab || !fInicio || !fFin) return false;
      
      // Comparamos usando Number() para evitar problemas de string vs number
      return Number(idHab) === habitacionId && fechaStr >= fInicio && fechaStr <= fFin;
    });
  };

  const formatearFechaHeader = (fechaStr: string) => {
    // Si la fecha viene como YYYY-MM-DD
    const partes = fechaStr.split("-");
    if (partes.length < 3) return fechaStr; // Fallback simple
    const [_, mes, dia] = partes;
    return `${dia}/${mes}`;
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-sm text-slate-600">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="sticky left-0 z-10 bg-slate-100 p-4 font-bold text-slate-700 border-r border-slate-300 w-40 min-w-[160px]">
                Habitación
              </th>
              {fechas.map((fecha) => (
                <th key={fecha} className="p-3 text-center font-bold text-slate-600 border-r border-slate-200 min-w-[70px] text-xs">
                  {formatearFechaHeader(fecha)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {habitaciones.map((hab) => (
              <tr key={hab.id} className="h-16">
                {/* Celda de la habitación fija */}
                <td className="sticky left-0 z-10 bg-slate-50 font-medium text-slate-800 p-4 border-r border-slate-300 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  <div className="font-bold text-slate-700">Nro {hab.numero || hab.id}</div>
                  <div className="text-[11px] text-slate-400 font-normal">{hab.tipo || "Estándar"}</div>
                </td>

                {/* Celdas de días */}
                {fechas.map((fecha) => {
                  const reserva = obtenerReservaCelda(hab.id, fecha);
                  const apellidoHuesped = reserva?.huesped?.apellido || "Ocupado";

                  return (
                    <td
                      key={fecha}
                      className={`p-1 border-r border-b border-slate-200 text-center h-full transition-colors ${
                        reserva 
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70"
                      }`}
                    >
                      {reserva ? (
                        <div 
                          className="text-[11px] font-extrabold leading-tight truncate px-1 py-2 bg-amber-200/60 rounded border border-amber-300/80 shadow-xs uppercase tracking-wider"
                          title={`Reserva #${reserva.id}\nHuésped: ${reserva.huesped?.nombre || ''} ${apellidoHuesped}`}
                        >
                          {apellidoHuesped}
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold tracking-wide text-emerald-600/70 uppercase select-none">
                          Libre
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Barra de referencias */}
      <div className="p-4 bg-slate-50 border-t border-slate-300 flex items-center space-x-6 text-xs font-semibold text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded bg-emerald-50 border border-emerald-200 inline-block"></span>
          <span>Disponible (Libre)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded bg-amber-100 border border-amber-300 inline-block"></span>
          <span>Reservado / Ocupado</span>
        </div>
      </div>
    </div>
  );
}