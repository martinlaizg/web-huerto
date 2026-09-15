import React, { useState } from 'react';
import { Plantacion, HitoTarea } from '../types';
import { getMondayOfWeek, formatShortDate } from '../App';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  plantaciones: Plantacion[];
  tareas: HitoTarea[];
  anioActual: number;
  semanaActual: number;
}

export const Gantt52: React.FC<Props> = ({ plantaciones, tareas, anioActual, semanaActual }) => {
  // Filtrar plantaciones activas (o todas si no tienen estado marcado explícitamente como cancelada)
  const plantacionesActivas = plantaciones.filter(p => p.estado !== 'cancelada');

  // Encontrar la plantación activa con la fecha de inicio más antigua (menor año, o menor semana en el mismo año)
  let baseAnio = anioActual;
  let baseSemana = semanaActual;

  if (plantacionesActivas.length > 0) {
    const masAntigua = plantacionesActivas.reduce((min, p) => {
      if (p.anio < min.anio) return p;
      if (p.anio === min.anio && p.semana_inicio < min.semana_inicio) return p;
      return min;
    }, plantacionesActivas[0]);

    baseAnio = masAntigua.anio;
    baseSemana = masAntigua.semana_inicio;
  }

  // Generar las 52 semanas consecutivas a partir de {baseSemana, baseAnio}
  const semanas52 = Array.from({ length: 52 }, (_, i) => {
    let week = baseSemana + i;
    let year = baseAnio;

    while (week > 52) {
      week -= 52;
      year += 1;
    }
    return { week, year, index: i };
  });

  const primeraSemana = semanas52[0];
  const ultimaSemana = semanas52[52 - 1];

  const fechaInicio = getMondayOfWeek(primeraSemana.week, primeraSemana.year);
  const fechaFin = getMondayOfWeek(ultimaSemana.week, ultimaSemana.year);
  fechaFin.setDate(fechaFin.getDate() + 6);

  // Agrupar las 52 semanas consecutivas por mes según la fecha del Lunes de cada semana
  const MESES_NOMBRES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const mesesAgrupados: { nombre: string; year: number; count: number }[] = [];

  semanas52.forEach(item => {
    const monDate = getMondayOfWeek(item.week, item.year);
    const monthName = MESES_NOMBRES[monDate.getMonth()];
    const yearNum = item.year;

    const last = mesesAgrupados[mesesAgrupados.length - 1];
    if (last && last.nombre === monthName && last.year === yearNum) {
      last.count += 1;
    } else {
      mesesAgrupados.push({ nombre: monthName, year: yearNum, count: 1 });
    }
  });

  return (
    <div className="space-y-5 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl">
              <Calendar className="w-5 h-5 text-sky-400" />
            </div>
            <span>Cronograma de 52 Semanas Continuas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Ventana de 52 semanas calculadas desde la plantación activa más antigua ({baseAnio} - Sem {baseSemana}).
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <div className="text-right">
            <div className="font-bold text-slate-200">
              Semana {primeraSemana.week} ({primeraSemana.year}) → Semana {ultimaSemana.week} ({ultimaSemana.year})
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold">
              Lun {formatShortDate(fechaInicio)} al Dom {formatShortDate(fechaFin)}
            </div>
          </div>
        </div>
      </div>

      {plantacionesActivas.length === 0 ? (
        <div className="text-center py-16 text-slate-500 italic bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          No hay plantaciones activas registradas para visualizar el cronograma.
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[1240px]">
            {/* Header Meses */}
            <div className="grid grid-cols-[220px_repeat(52,_minmax(0,1fr))] text-center border-b border-slate-800/80 pb-1 mb-1">
              <div className="text-left font-bold text-xs text-slate-500 uppercase tracking-wider pl-3">
                Mes / Año
              </div>
              {mesesAgrupados.map((m, idx) => (
                <div
                  key={idx}
                  style={{ gridColumn: `span ${m.count}` }}
                  className="text-[11px] font-bold text-slate-300 border-l border-slate-800 px-1 truncate py-0.5 bg-slate-950/60 rounded-sm"
                >
                  {m.nombre} <span className="text-[10px] text-slate-500 font-medium">'{m.year.toString().slice(-2)}</span>
                </div>
              ))}
            </div>

            {/* Header de Semanas */}
            <div className="grid grid-cols-[220px_repeat(52,_minmax(0,1fr))] text-center border-b border-slate-800 pb-2">
              <div className="text-left font-bold text-xs text-slate-400 uppercase tracking-wider pl-3">
                Plantación
              </div>
              {semanas52.map(item => {
                const monDate = getMondayOfWeek(item.week, item.year);
                const isCurrent = item.week === semanaActual && item.year === anioActual;

                return (
                  <div
                    key={`${item.year}-${item.week}`}
                    className={`text-[10px] font-bold py-0.5 rounded transition ${isCurrent
                        ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                      }`}
                    title={`Semana ${item.week} (${item.year}) - Inicia Lunes ${formatShortDate(monDate)}`}
                  >
                    {item.week}
                  </div>
                );
              })}
            </div>

            {/* Filas de Plantaciones */}
            <div className="divide-y divide-slate-800/60 mt-1">
              {plantacionesActivas.map(p => {
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[220px_repeat(52,_minmax(0,1fr))] items-center py-2.5 hover:bg-slate-800/40 transition rounded-xl"
                  >
                    {/* Info de la Plantación */}
                    <div className="pl-3 pr-4 truncate">
                      <div className="text-sm font-bold text-slate-200 truncate flex items-center space-x-1.5" title={p.cultivo_nombre}>
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="truncate">{p.cultivo_nombre}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        Inicio: Sem {p.semana_inicio} ({p.anio})
                      </div>
                    </div>

                    {/* 52 celdas de semanas continuas */}
                    {semanas52.map(item => {
                      const hitosEnSemana = tareas.filter(
                        t => t.plantacion_id === p.id && t.semana_objetivo === item.week && t.anio_objetivo === item.year
                      );
                      const monDate = getMondayOfWeek(item.week, item.year);

                      const hasSiembra = hitosEnSemana.some(h => h.tipo_accion === 'siembra');
                      const hasTrasplante = hitosEnSemana.some(h => h.tipo_accion === 'trasplante');
                      const hasMantenimiento = hitosEnSemana.some(h => h.tipo_accion === 'mantenimiento');
                      const hasCosecha = hitosEnSemana.some(h => h.tipo_accion === 'cosecha');

                      let bgClass = 'bg-slate-950/40 hover:bg-slate-800/60';
                      let dotColor = '';

                      if (hasSiembra) {
                        bgClass = 'bg-emerald-950/80 border border-emerald-500/60 shadow-sm';
                        dotColor = 'bg-emerald-400';
                      } else if (hasTrasplante) {
                        bgClass = 'bg-sky-950/80 border border-sky-500/60 shadow-sm';
                        dotColor = 'bg-sky-400';
                      } else if (hasCosecha) {
                        bgClass = 'bg-fuchsia-950/80 border border-fuchsia-500/60 shadow-sm';
                        dotColor = 'bg-fuchsia-400';
                      } else if (hasMantenimiento) {
                        bgClass = 'bg-amber-950/60 border border-amber-500/40 shadow-sm';
                        dotColor = 'bg-amber-400';
                      }

                      return (
                        <div
                          key={`${item.year}-${item.week}`}
                          className={`h-7 mx-[1px] rounded-lg flex items-center justify-center transition relative group ${bgClass}`}
                        >
                          {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>}

                          {hitosEnSemana.length > 0 && (
                            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-700 shadow-2xl whitespace-nowrap z-50 pointer-events-none">
                              <div className="font-bold text-sky-400 pb-1 border-b border-slate-800 mb-1 flex items-center justify-between gap-3">
                                <span>Semana {item.week} ({item.year})</span>
                                <span className="text-[10px] font-semibold text-emerald-400">Lun {formatShortDate(monDate)}</span>
                              </div>
                              {hitosEnSemana.map(h => (
                                <div key={h.id} className="text-[11px] flex items-center space-x-1.5 py-0.5">
                                  <span className="text-slate-400">•</span>
                                  <span className="font-medium text-slate-200">{h.descripcion}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Leyenda de colores */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-800 text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
          <span className="text-slate-300">Siembra / Semillero</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-sky-400"></span>
          <span className="text-slate-300">Trasplante / Aclareo</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-amber-400"></span>
          <span className="text-slate-300">Mantenimiento</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-fuchsia-400"></span>
          <span className="text-slate-300">Cosecha</span>
        </div>
      </div>
    </div>
  );
};
