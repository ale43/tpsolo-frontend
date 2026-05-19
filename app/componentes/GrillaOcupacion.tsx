export default function GrillaOcupacion({ habitaciones, fechas, reservas }) {
  
  // La lógica vive dentro del componente ahora
  const obtenerEstadoCelda = (habId, fechaStr) => {
    // Buscamos si hay una reserva para esta habitación en esta fecha
    const reserva = reservas.find((r) => {
      const coincideHab = r.habitacion?.id === habId;
      return coincideHab && fechaStr >= r.fechaInicio && fechaStr <= r.fechaFin;
    });

    if (!reserva) return { texto: "Libre", clases: "bg-green-500 text-white" };
    if (reserva.checkInEfectuado) return { texto: "Ocupada", clases: "bg-red-500 text-white" };
    return { texto: "Reservada", clases: "bg-yellow-500 text-black" };
  };

  if (!habitaciones.length) return <p className="p-8">Cargando...</p>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-max text-left border-collapse">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="p-4">Habitación</th>
            <th className="p-4">Categoría</th>
            {fechas.map(f => <th key={f} className="p-2 text-xs">{f.split("-")[2]}</th>)}
          </tr>
        </thead>
        <tbody>
          {habitaciones.map((hab) => (
            <tr key={hab.id} className="border-b">
              <td className="p-4 font-bold">N° {hab.numero}</td>
              <td className="p-4">{hab.categoria}</td>
              {fechas.map((fecha) => {
                const estado = obtenerEstadoCelda(hab.id, fecha);
                return (
                  <td key={fecha} className="p-1 text-center">
                    <div className={`p-2 rounded text-[10px] font-bold ${estado.clases}`}>
                      {estado.texto}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}