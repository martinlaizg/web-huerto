import React, { useState } from 'react';
import { HitoTarea } from '../types';
import { CheckSquare, Square, Calendar, ArrowRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  tareas: HitoTarea[];
  semana: number;
  anio: number;
  onSemanaChange: (semana: number, anio: number) => void;
  onToggleCompletado: (id: string, completado: boolean) => void;
  onMoveTarea: (id: string, nuevaSemana: number, nuevoAnio: number, cascada: boolean) => void;
}

export const AgendaSemanal: React.FC<Props> = ({
  tareas,
  semana,
  anio,
  onSemanaChange,
  onToggleCompletado,
  onMoveTarea
}) => {
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const [targetWeek, setTargetWeek] = useState<number>(semana);
  const [targetYear, setTargetYear] = useState<number>(anio);
  const [useCascada, setUseCascada] = useState<boolean>(true);

  const prevWeek = () => {
    if (semana === 1) onSemanaChange(52, anio - 1);
    else onSemanaChange(semana - 1, anio);
  };

  const nextWeek = () => {
    if (semana === 52) onSemanaChange(1, anio + 1);
    else onSemanaChange(semana + 1, anio);
  };

  const tareasFiltradas = tareas.filter(
    t => t.semana_objetivo === semana && t.anio_objetivo === anio
  );

  const siembras = tareasFiltradas.filter(t => t.tipo_accion === 'siembra');
  const trasplantes = tareasFiltradas.filter(t => t.tipo_accion === 'trasplante');
  const mantenimientos = tareasFiltradas.filter(t => t.tipo_accion === 'mantenimiento');
  const cosechas = tareasFiltradas.filter(t => t.tipo_accion === 'cosecha');

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (movingTaskId) {
      onMoveTarea(movingTaskId, targetWeek, targetYear, useCascada);
      setMovingTaskId(null);
    }
  };

  const renderCategoryBlock = (
    title: string,
    items: HitoTarea[],
    badgeColor: string,
    borderColor: string,
    bgColor: string
  ) => {
    return (
      <div className={`p-4 rounded-xl border ${borderColor} ${bgColor} backdrop-blur-sm shadow-md`}>
        <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-2">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${badgeColor}`}></span>
            <h3 className="font-bold text-slate-100 text-lg">{title}</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {items.length}
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-slate-500 text-sm italic py-2">No hay tareas programadas esta semana.</p>
        ) : (
          <div className="space-y-2">
            {items.map(tarea => (
              <div
                key={tarea.id}
                className={`p-3 rounded-lg flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 transition ${
                  tarea.completado ? 'opacity-60 line-through' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onToggleCompletado(tarea.id, !tarea.completado)}
                    className="text-emerald-400 hover:text-emerald-300 transition focus:outline-none"
                  >
                    {tarea.completado ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                  </button>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{tarea.descripcion}</div>
                    {tarea.cultivo_nombre && (
                      <div className="text-xs text-slate-400">{tarea.cultivo_nombre} ({tarea.cultivo_familia})</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMovingTaskId(tarea.id);
                    setTargetWeek(tarea.semana_objetivo);
                    setTargetYear(tarea.anio_objetivo);
                  }}
                  className="text-xs text-slate-400 hover:text-sky-400 flex items-center space-x-1 px-2 py-1 bg-slate-900/50 rounded border border-slate-700 hover:border-sky-500 transition"
                  title="Reajustar semana"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Mover</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header semana selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-800/90 p-4 rounded-xl border border-slate-700 shadow">
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <Calendar className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">
            Agenda Semanal <span className="text-emerald-400">Semana {semana}</span> ({anio})
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-3 py-1.5 bg-slate-900 rounded-lg text-sm font-medium border border-slate-700">
            Semana {semana} / 52
          </div>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid de 4 Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Verde: Siembra / Semillero */}
        {renderCategoryBlock(
          'Siembra / Semillero',
          siembras,
          'bg-emerald-500',
          'border-emerald-500/30',
          'bg-emerald-950/20'
        )}

        {/* Azul: Trasplante / Aclareo */}
        {renderCategoryBlock(
          'Trasplante / Aclareo',
          trasplantes,
          'bg-sky-500',
          'border-sky-500/30',
          'bg-sky-950/20'
        )}

        {/* Naranja: Mantenimiento */}
        {renderCategoryBlock(
          'Mantenimiento',
          mantenimientos,
          'bg-amber-500',
          'border-amber-500/30',
          'bg-amber-950/20'
        )}

        {/* Magenta: Cosecha */}
        {renderCategoryBlock(
          'Cosecha',
          cosechas,
          'bg-fuchsia-500',
          'border-fuchsia-500/30',
          'bg-fuchsia-950/20'
        )}
      </div>

      {/* Modal para mover tarea con recálculo dinámico en cascada */}
      {movingTaskId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-sky-400" />
              <span>Reajuste Dinámico de Semana</span>
            </h3>

            <form onSubmit={handleMoveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Nueva Semana (1-52)
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={targetWeek}
                  onChange={e => setTargetWeek(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Año
                </label>
                <input
                  type="number"
                  value={targetYear}
                  onChange={e => setTargetYear(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  id="cascada"
                  checked={useCascada}
                  onChange={e => setUseCascada(e.target.checked)}
                  className="w-4 h-4 text-sky-500 rounded focus:ring-sky-400 bg-slate-800 border-slate-600"
                />
                <label htmlFor="cascada" className="text-sm text-slate-200 cursor-pointer">
                  <strong>Recálculo en cascada:</strong> desplazar tareas futuras de esta plantación manteniendo el desfase.
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMovingTaskId(null)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition flex items-center space-x-1"
                >
                  <span>Confirmar Cambios</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
