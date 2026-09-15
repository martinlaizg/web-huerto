import React, { useState } from 'react';
import { Cultivo } from '../types';
import { BookOpen, Trash2, Calendar, Clock, Edit2 } from 'lucide-react';

interface Props {
  cultivos: Cultivo[];
  onEditarCultivo: (id: string, data: Partial<Cultivo>) => void;
  onEliminarCultivo: (id: string) => void;
}

export const CultivosList: React.FC<Props> = ({ cultivos, onEditarCultivo, onEliminarCultivo }) => {
  const [editingCultivo, setEditingCultivo] = useState<Cultivo | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Campos formulario edición
  const [nombre, setNombre] = useState<string>('');
  const [familia, setFamilia] = useState<string>('');
  const [modoInicio, setModoInicio] = useState<'semillero' | 'directa'>('semillero');
  const [semanasOptimas, setSemanasOptimas] = useState<string>('');
  const [duracionSemillero, setDuracionSemillero] = useState<number>(0);
  const [duracionCrecimiento, setDuracionCrecimiento] = useState<number>(0);
  const [duracionCosecha, setDuracionCosecha] = useState<number>(0);

  const openEditModal = (c: Cultivo) => {
    setEditingCultivo(c);
    setNombre(c.nombre);
    setFamilia(c.familia);
    setModoInicio(c.modo_inicio);
    setSemanasOptimas(c.semanas_optimas_siembra.join(', '));
    setDuracionSemillero(c.duracion_semillero);
    setDuracionCrecimiento(c.duracion_crecimiento);
    setDuracionCosecha(c.duracion_cosecha);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCultivo) {
      const parsedSemanas = semanasOptimas
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n) && n >= 1 && n <= 52);

      onEditarCultivo(editingCultivo.id, {
        nombre,
        familia,
        modo_inicio: modoInicio,
        semanas_optimas_siembra: parsedSemanas,
        duracion_semillero: duracionSemillero,
        duracion_crecimiento: duracionCrecimiento,
        duracion_cosecha: duracionCosecha
      });
      setEditingCultivo(null);
    }
  };

  return (
    <div className="space-y-5 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <BookOpen className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Catálogo de Cultivos Disponibles</h2>
          <p className="text-xs text-slate-400">Variedades registradas y sus parámetros agronómicos</p>
        </div>
      </div>

      {cultivos.length === 0 ? (
        <div className="text-center py-16 text-slate-500 italic bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          No hay cultivos en el catálogo. Importa una plantilla YAML o JSON para añadir variedades.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cultivos.map(c => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3.5 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">{c.nombre}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold mt-1 inline-block">
                    {c.familia}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="text-slate-500 hover:text-purple-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    title="Editar variedad"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(c.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    title="Eliminar cultivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Semanas óptimas de siembra:</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {c.semanas_optimas_siembra.length > 0 ? (
                    c.semanas_optimas_siembra.map(w => (
                      <span key={w} className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold">
                        Sem {w}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No especificadas</span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 text-slate-400 font-medium pt-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Fases de duración:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300 pt-0.5">
                  {c.modo_inicio === 'semillero' && (
                    <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      Semillero: <strong className="text-emerald-400">{c.duracion_semillero} sem</strong>
                    </div>
                  )}
                  <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    Crecimiento: <strong className="text-sky-400">{c.duracion_crecimiento} sem</strong>
                  </div>
                  <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    Cosecha: <strong className="text-fuchsia-400">{c.duracion_cosecha} sem</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Editar Cultivo */}
      {editingCultivo && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <div className="p-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <span>Editar Variedad Agrícola</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Familia
                  </label>
                  <input
                    type="text"
                    value={familia}
                    onChange={e => setFamilia(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Modo Inicio
                  </label>
                  <select
                    value={modoInicio}
                    onChange={e => setModoInicio(e.target.value as 'semillero' | 'directa')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="semillero">Semillero</option>
                    <option value="directa">Directa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Semanas Óptimas (1-52)
                  </label>
                  <input
                    type="text"
                    value={semanasOptimas}
                    onChange={e => setSemanasOptimas(e.target.value)}
                    placeholder="Ej. 9, 10, 11, 12"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {modoInicio === 'semillero' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Semillero (sem)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={duracionSemillero}
                      onChange={e => setDuracionSemillero(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Crecimiento (sem)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={duracionCrecimiento}
                    onChange={e => setDuracionCrecimiento(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Cosecha (sem)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={duracionCosecha}
                    onChange={e => setDuracionCosecha(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCultivo(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Guardar Variedad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal confirmación eliminar cultivo */}
      {confirmDeleteId && (() => {
        const c = cultivos.find(x => x.id === confirmDeleteId);
        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Eliminar cultivo</h3>
              </div>
              <p className="text-sm text-slate-300 mb-1">
                ¿Seguro que quieres eliminar{' '}
                <strong className="text-white">{c?.nombre}</strong>{' '}
                del catálogo?
              </p>
              <p className="text-xs text-slate-500 mb-6">
                Esta acción no se puede deshacer. Las plantaciones que usen esta variedad pueden verse afectadas.
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
                    onEliminarCultivo(confirmDeleteId);
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
