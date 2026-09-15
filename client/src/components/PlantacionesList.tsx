import React, { useState } from 'react';
import { Plantacion, Cultivo } from '../types';
import { Sprout, Plus, Trash2, Calendar, Edit2 } from 'lucide-react';

interface Props {
  plantaciones: Plantacion[];
  cultivos: Cultivo[];
  semanaActual: number;
  anioActual: number;
  onCrearPlantacion: (cultivoId: string, anio: number, semanaInicio: number) => void;
  onEditarPlantacion: (id: string, cultivoId: string, anio: number, semanaInicio: number, estado: string) => void;
  onEliminarPlantacion: (id: string) => void;
}

export const PlantacionesList: React.FC<Props> = ({
  plantaciones,
  cultivos,
  semanaActual,
  anioActual,
  onCrearPlantacion,
  onEditarPlantacion,
  onEliminarPlantacion
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPlantacion, setEditingPlantacion] = useState<Plantacion | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Campos de formulario
  const [selectedCultivoId, setSelectedCultivoId] = useState<string>('');
  const [anio, setAnio] = useState<number>(anioActual);
  const [semanaInicio, setSemanaInicio] = useState<number>(semanaActual);
  const [estado, setEstado] = useState<string>('activa');

  const openNewModal = () => {
    setEditingPlantacion(null);
    if (cultivos.length > 0) {
      setSelectedCultivoId(cultivos[0].id);
    }
    setAnio(anioActual);
    setSemanaInicio(semanaActual);
    setEstado('activa');
    setShowModal(true);
  };

  const openEditModal = (p: Plantacion) => {
    setEditingPlantacion(p);
    setSelectedCultivoId(p.cultivo_id);
    setAnio(p.anio);
    setSemanaInicio(p.semana_inicio);
    setEstado(p.estado);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCultivoId) {
      if (editingPlantacion) {
        onEditarPlantacion(editingPlantacion.id, selectedCultivoId, anio, semanaInicio, estado);
      } else {
        onCrearPlantacion(selectedCultivoId, anio, semanaInicio);
      }
      setShowModal(false);
      setEditingPlantacion(null);
    }
  };

  const selectedCultivo = cultivos.find(c => c.id === selectedCultivoId);

  return (
    <div className="space-y-5 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <span>Gestión de Plantaciones Activas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Planifica un lote de cultivo asociando la variedad a una semana de inicio determinada.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Plantación</span>
        </button>
      </div>

      {plantaciones.length === 0 ? (
        <div className="text-center py-16 text-slate-500 italic bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          No hay plantaciones activas. Registra una nueva plantación para generar automáticamente su agenda de hitos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantaciones.map(p => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-4 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">{p.cultivo_nombre}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold mt-1 inline-block">
                    {p.cultivo_familia}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-slate-500 hover:text-sky-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    title="Editar plantación"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    title="Eliminar plantación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Inicio: <strong className="text-emerald-400">Semana {p.semana_inicio}</strong> ({p.anio})</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span>Modo inicio:</span>
                  <span className="capitalize font-semibold text-slate-200 px-2 py-0.5 bg-slate-800 rounded">{p.cultivo_modo}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Estado:</span>
                  <span className={`capitalize font-bold flex items-center space-x-1 ${p.estado === 'activa' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.estado === 'activa' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    <span>{p.estado}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva / Editar Plantación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
              <span>{editingPlantacion ? 'Editar Plantación' : 'Registrar Nueva Plantación'}</span>
            </h3>

            {cultivos.length === 0 ? (
              <div className="text-amber-400 text-sm py-4 bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
                Primero debes importar o registrar un cultivo en el catálogo para crear una plantación.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Variedad / Cultivo
                  </label>
                  <select
                    value={selectedCultivoId}
                    onChange={e => setSelectedCultivoId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
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
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                    💡 Semanas óptimas recomendadas: <strong>{selectedCultivo.semanas_optimas_siembra.join(', ')}</strong>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Año
                    </label>
                    <input
                      type="number"
                      value={anio}
                      onChange={e => setAnio(parseInt(e.target.value) || anio)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Semana Inicio (1-52)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={semanaInicio}
                      onChange={e => setSemanaInicio(parseInt(e.target.value) || semanaInicio)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {editingPlantacion && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Estado de la Plantación
                    </label>
                    <select
                      value={estado}
                      onChange={e => setEstado(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="activa">Activa</option>
                      <option value="finalizada">Finalizada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md"
                  >
                    {editingPlantacion ? 'Guardar Cambios' : 'Crear Plantación'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Modal confirmación eliminar plantación */}
      {confirmDeleteId && (() => {
        const p = plantaciones.find(x => x.id === confirmDeleteId);
        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Eliminar plantación</h3>
              </div>
              <p className="text-sm text-slate-300 mb-1">
                ¿Seguro que quieres eliminar la plantación de{' '}
                <strong className="text-white">{p?.cultivo_nombre}</strong>?
              </p>
              <p className="text-xs text-slate-500 mb-6">
                Se eliminarán también todas sus tareas asociadas. Esta acción no se puede deshacer.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onEliminarPlantacion(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
