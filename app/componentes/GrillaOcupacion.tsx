"use client";

import React from "react";

interface GrillaOcupacionProps {
  habitaciones: any[];
  fechas: string[];
  reservas: any[];
}

export default function GrillaOcupacion({ habitaciones, fechas, reservas }: GrillaOcupacionProps) {

  const obtenerReservaCelda = (habitacionId: number, fechaStr: string) => {
    if (!Array.isArray(reservas)) return undefined;

    return reservas.find((r) => {
      if (!r || typeof r !== "object") return false;

      const idHab = r.habitacion?.id || r.habitacionId || r.habitacion_id;
      const fInicio = r.fechaInicio || r.fecha_inicio;
      const fFin = r.fechaFin || r.fecha_fin;

      if (!idHab || !fInicio || !fFin) return false;

      // ✅ Ya NO filtramos por r.activa.
      // Una reserva facturada sigue ocupando la habitación hasta que termina.
      // Solo verificamos que la fecha esté dentro del rango.
      return Number(idHab) === habitacionId && fechaStr >= fInicio && fechaStr <= fFin;
    });
  };

  const formatearFechaHeader = (fechaStr: string) => {
    const partes = fechaStr.split("-");
    if (partes.length < 3) return fechaStr;
    const [_, mes, dia] = partes;
    return `${dia}/${mes}`;
  };

  // Determina si una fecha es hoy para resaltarla
  const esHoy = (fechaStr: string) => {
    return fechaStr === new Date().toISOString().split("T")[0];
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
                <th
                  key={fecha}
                  className={`p-3 text-center font-bold border-r border-slate-200 min-w-[70px] text-xs ${
                    esHoy(fecha)
                      ? "bg-blue-900 text-white"
                      : "text-slate-600"
                  }`}
                >
                  {formatearFechaHeader(fecha)}
                  {esHoy(fecha) && (
                    <span className="block text-[9px] font-normal opacity-80">Hoy</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {habitaciones.map((hab) => (
              <tr key={hab.id} className="h-16">
                {/* Celda habitación fija */}
                <td className="sticky left-0 z-10 bg-slate-50 font-medium text-slate-800 p-4 border-r border-slate-300 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  <div className="font-bold text-slate-700">Nro {hab.numero || hab.id}</div>
                  <div className="text-[11px] text-slate-400 font-normal">{hab.categoria || hab.tipo || "Estándar"}</div>
                </td>

                {/* Celdas de días */}
                {fechas.map((fecha) => {
                  const reserva = obtenerReservaCelda(hab.id, fecha);
                  const apellido = reserva?.huesped?.apellido || "Ocupado";
                  const esDiaHoy = esHoy(fecha);

                  return (
                    <td
                      key={fecha}
                      className={`p-1 border-r border-b border-slate-200 text-center h-full transition-colors ${
                        esDiaHoy ? "border-l-2 border-l-blue-400" : ""
                      } ${
                        reserva
                          ? reserva.activa
                            ? "bg-amber-100 text-amber-900"           // activa: amarillo
                            : "bg-violet-100 text-violet-900"          // facturada pero en rango: violeta
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70"
                      }`}
                    >
                      {reserva ? (
                        <div
                          className={`text-[11px] font-extrabold leading-tight truncate px-1 py-2 rounded border shadow-xs uppercase tracking-wider ${
                            reserva.activa
                              ? "bg-amber-200/60 border-amber-300/80 text-amber-900"
                              : "bg-violet-200/60 border-violet-300/80 text-violet-900"
                          }`}
                          title={`Reserva #${reserva.id}\nEstado: ${reserva.activa ? "Activa" : "Facturada"}\nHuésped: ${reserva.huesped?.nombre || ""} ${apellido}\n${reserva.fechaInicio} → ${reserva.fechaFin}`}
                        >
                          {apellido}
                          {!reserva.activa && (
                            <span className="block text-[9px] font-normal opacity-70 normal-case">
                              facturada
                            </span>
                          )}
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

      {/* Leyenda */}
      <div className="p-4 bg-slate-50 border-t border-slate-300 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-emerald-50 border border-emerald-200 inline-block"></span>
          <span>Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-amber-100 border border-amber-300 inline-block"></span>
          <span>Reservado (Activa)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-violet-100 border border-violet-300 inline-block"></span>
          <span>Ocupado (Facturada)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue-900 inline-block"></span>
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
}
