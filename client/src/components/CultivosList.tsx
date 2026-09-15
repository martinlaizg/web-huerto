import React from 'react';
import { Cultivo } from '../types';
import { BookOpen, Trash2, Calendar, Clock } from 'lucide-react';

interface Props {
  cultivos: Cultivo[];
  onEliminarCultivo: (id: string) => void;
}

export const CultivosList: React.FC<Props> = ({ cultivos, onEliminarCultivo }) => {
  return (
    <div className="space-y-4 bg-slate-800/90 p-6 rounded-xl border border-slate-700 shadow-xl">
      <div className="flex items-center space-x-2 border-b border-slate-700 pb-4">
        <BookOpen className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">Catálogo de Cultivos Disponibles</h2>
      </div>

      {cultivos.length === 0 ? (
        <div className="text-center py-10 text-slate-500 italic">
          No hay cultivos en el catálogo. Importa uno mediante una plantilla YAML/JSON.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cultivos.map(c => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-slate-600 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-emerald-300">{c.nombre}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                    {c.familia}
                  </span>
                </div>
                <button
                  onClick={() => onEliminarCultivo(c.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                  title="Eliminar cultivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Semanas óptimas siembra:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.semanas_optimas_siembra.length > 0 ? (
                    c.semanas_optimas_siembra.map(w => (
                      <span key={w} className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded text-[11px]">
                        Sem {w}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No especificadas</span>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-slate-400 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Duración estimada:</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                  {c.modo_inicio === 'semillero' && (
                    <li>Semillero: <strong>{c.duracion_semillero} sem</strong></li>
                  )}
                  <li>Crecimiento: <strong>{c.duracion_crecimiento} sem</strong></li>
                  <li>Cosecha: <strong>{c.duracion_cosecha} sem</strong></li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
