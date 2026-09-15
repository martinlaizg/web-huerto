import React, { useState } from 'react';
import { Plantacion, Cultivo } from '../types';
import { Sprout, Plus, Trash2, Calendar } from 'lucide-react';

interface Props {
  plantaciones: Plantacion[];
  cultivos: Cultivo[];
  semanaActual: number;
  anioActual: number;
  onCrearPlantacion: (cultivoId: string, anio: number, semanaInicio: number) => void;
  onEliminarPlantacion: (id: string) => void;
}

export const PlantacionesList: React.FC<Props> = ({
  plantaciones,
  cultivos,
  semanaActual,
  anioActual,
  onCrearPlantacion,
  onEliminarPlantacion
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCultivoId, setSelectedCultivoId] = useState<string>('');
  const [anio, setAnio] = useState<number>(anioActual);
  const [semanaInicio, setSemanaInicio] = useState<number>(semanaActual);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCultivoId) {
      onCrearPlantacion(selectedCultivoId, anio, semanaInicio);
      setShowModal(false);
      setSelectedCultivoId('');
    }
  };

  const selectedCultivo = cultivos.find(c => c.id === selectedCultivoId);

  return (
    <div className="space-y-4 bg-slate-800/90 p-6 rounded-xl border border-slate-700 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sprout className="w-6 h-6 text-emerald-400" />
            <span>Gestión de Plantaciones Activas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Crea un nuevo lote de cultivo en el huerto asociando la variedad a una semana de inicio.
          </p>
        </div>

        <button
          onClick={() => {
            if (cultivos.length > 0) {
              setSelectedCultivoId(cultivos[0].id);
            }
            setShowModal(true);
          }}
          className="mt-3 sm:mt-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm flex items-center space-x-2 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Plantación</span>
        </button>
      </div>

      {plantaciones.length === 0 ? (
        <div className="text-center py-10 text-slate-500 italic">
          No hay plantaciones activas. Registra una nueva plantación para generar su agenda de hitos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantaciones.map(p => (
            <div
              key={p.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-slate-600 transition space-y-3 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-emerald-300">{p.cultivo_nombre}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                    {p.cultivo_familia}
                  </span>
                </div>
                <button
                  onClick={() => onEliminarPlantacion(p.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                  title="Eliminar plantación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Semana inicio: <strong>Semana {p.semana_inicio}</strong> ({p.anio})</span>
                </div>
                <div>Modo de inicio: <span className="capitalize font-semibold text-slate-200">{p.cultivo_modo}</span></div>
                <div>Estado: <span className="capitalize font-semibold text-emerald-400">{p.estado}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Plantación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>Registrar Nueva Plantación</span>
            </h3>

            {cultivos.length === 0 ? (
              <div className="text-amber-400 text-sm py-4">
                Primero debes importar o registrar un cultivo en el catálogo.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Seleccionar Cultivo
                  </label>
                  <select
                    value={selectedCultivoId}
                    onChange={e => setSelectedCultivoId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    required
                  >
                    {cultivos.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.familia})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCultivo && selectedCultivo.semanas_optimas_siembra.length > 0 && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                    Semanas óptimas recomendadas para siembra: <strong>{selectedCultivo.semanas_optimas_siembra.join(', ')}</strong>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Año de inicio
                  </label>
                  <input
                    type="number"
                    value={anio}
                    onChange={e => setAnio(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Semana ISO de inicio (1 - 52)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={semanaInicio}
                    onChange={e => setSemanaInicio(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition"
                  >
                    Crear Plantación
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
