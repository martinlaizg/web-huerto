import React, { useState } from 'react';
import { Plantacion, HitoTarea } from '../types';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  plantaciones: Plantacion[];
  tareas: HitoTarea[];
  anioActual: number;
  semanaActual: number;
}

export const Gantt52: React.FC<Props> = ({ plantaciones, tareas, anioActual, semanaActual }) => {
  const [selectedAnio, setSelectedAnio] = useState<number>(anioActual);

  const semanas = Array.from({ length: 52 }, (_, i) => i + 1);

  const plantacionesAnio = plantaciones.filter(p => p.anio === selectedAnio);

  return (
    <div className="space-y-4 bg-slate-800/90 p-6 rounded-xl border border-slate-700 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <span>Cronograma Anual de Cultivos (Gantt 52 Semanas)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualización temporal de ocupación e hitos por semana ISO (1 - 52).
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-3 sm:mt-0">
          <button
            onClick={() => setSelectedAnio(selectedAnio - 1)}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-sky-400 px-3 py-1 bg-slate-900 rounded-lg border border-slate-700">
            {selectedAnio}
          </span>
          <button
            onClick={() => setSelectedAnio(selectedAnio + 1)}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {plantacionesAnio.length === 0 ? (
        <div className="text-center py-12 text-slate-500 italic">
          No hay plantaciones registradas para el año {selectedAnio}.
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1200px]">
            {/* Header de Semanas */}
            <div className="grid grid-cols-[200px_repeat(52,_minmax(0,1fr))] text-center border-b border-slate-700 pb-2">
              <div className="text-left font-bold text-xs text-slate-400 uppercase tracking-wider pl-2">
                Plantación
              </div>
              {semanas.map(w => (
                <div
                  key={w}
                  className={`text-[10px] font-semibold py-0.5 rounded ${
                    w === semanaActual && selectedAnio === anioActual
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400'
                  }`}
                  title={`Semana ${w}`}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Filas de Plantaciones */}
            <div className="divide-y divide-slate-800">
              {plantacionesAnio.map(p => {
                const tareasPlantacion = tareas.filter(
                  t => t.plantacion_id === p.id && t.anio_objetivo === selectedAnio
                );

                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[200px_repeat(52,_minmax(0,1fr))] items-center py-2.5 hover:bg-slate-700/30 transition"
                  >
                    {/* Info de la Plantación */}
                    <div className="pl-2 pr-4 truncate">
                      <div className="text-sm font-bold text-slate-200 truncate" title={p.cultivo_nombre}>
                        {p.cultivo_nombre}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Semana inicio: {p.semana_inicio} ({p.cultivo_modo})
                      </div>
                    </div>

                    {/* 52 celdas de semanas */}
                    {semanas.map(w => {
                      const hitosEnSemana = tareasPlantacion.filter(t => t.semana_objetivo === w);
                      
                      const hasSiembra = hitosEnSemana.some(h => h.tipo_accion === 'siembra');
                      const hasTrasplante = hitosEnSemana.some(h => h.tipo_accion === 'trasplante');
                      const hasMantenimiento = hitosEnSemana.some(h => h.tipo_accion === 'mantenimiento');
                      const hasCosecha = hitosEnSemana.some(h => h.tipo_accion === 'cosecha');

                      let bgClass = 'bg-slate-900/40';
                      let dotColor = '';

                      if (hasSiembra) {
                        bgClass = 'bg-emerald-900/60 border border-emerald-500/50';
                        dotColor = 'bg-emerald-400';
                      } else if (hasTrasplante) {
                        bgClass = 'bg-sky-900/60 border border-sky-500/50';
                        dotColor = 'bg-sky-400';
                      } else if (hasCosecha) {
                        bgClass = 'bg-fuchsia-900/60 border border-fuchsia-500/50';
                        dotColor = 'bg-fuchsia-400';
                      } else if (hasMantenimiento) {
                        bgClass = 'bg-amber-900/40 border border-amber-500/30';
                        dotColor = 'bg-amber-400';
                      }

                      return (
                        <div
                          key={w}
                          className={`h-7 mx-[1px] rounded flex items-center justify-center transition relative group ${bgClass}`}
                        >
                          {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>}

                          {hitosEnSemana.length > 0 && (
                            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-2 bg-slate-900 text-slate-100 text-xs rounded border border-slate-700 shadow-xl whitespace-nowrap z-30">
                              <div className="font-bold text-sky-400">Semana {w}:</div>
                              {hitosEnSemana.map(h => (
                                <div key={h.id} className="text-[11px]">
                                  • {h.descripcion}
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
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-700/60 text-xs">
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
