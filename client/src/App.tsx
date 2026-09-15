import React, { useState, useEffect } from 'react';
import { Cultivo, Plantacion, HitoTarea } from './types';
import { AgendaSemanal } from './components/AgendaSemanal';
import { Gantt52 } from './components/Gantt52';
import { PlantacionesList } from './components/PlantacionesList';
import { CultivosList } from './components/CultivosList';
import { ImportadorCultivos } from './components/ImportadorCultivos';
import { Calendar, Sprout, BarChart3, BookOpen, Upload } from 'lucide-react';

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

export function getMondayOfWeek(week: number, year: number): Date {
  const simple = new Date(year, 0, 4);
  const dayOfWeek = simple.getDay() || 7;
  const isoMondayStart = new Date(simple);
  isoMondayStart.setDate(simple.getDate() - (dayOfWeek - 1));
  isoMondayStart.setDate(isoMondayStart.getDate() + (week - 1) * 7);
  return isoMondayStart;
}

export function formatShortDate(date: Date): string {
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${date.getDate()} ${meses[date.getMonth()]}`;
}

export function App() {
  const [tab, setTab] = useState<'agenda' | 'gantt' | 'plantaciones' | 'cultivos' | 'importar'>('agenda');

  const now = new Date();
  const currentISO = getISOWeek(now);

  const [semanaActual, setSemanaActual] = useState<number>(currentISO.week);
  const [anioActual, setAnioActual] = useState<number>(currentISO.year);

  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [plantaciones, setPlantaciones] = useState<Plantacion[]>([]);
  const [tareas, setTareas] = useState<HitoTarea[]>([]);

  const fetchCultivos = async () => {
    try {
      const res = await fetch('/api/cultivos');
      const data = await res.json();
      setCultivos(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlantaciones = async () => {
    try {
      const res = await fetch('/api/plantaciones');
      const data = await res.json();
      setPlantaciones(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTareas = async () => {
    try {
      const res = await fetch('/api/tareas');
      const data = await res.json();
      setTareas(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCultivos();
    fetchPlantaciones();
    fetchTareas();
  }, []);

  const handleToggleCompletado = async (id: string, completado: boolean) => {
    try {
      await fetch(`/api/tareas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completado })
      });
      fetchTareas();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveTarea = async (id: string, nuevaSemana: number, nuevoAnio: number, cascada: boolean) => {
    try {
      await fetch(`/api/tareas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semana_objetivo: nuevaSemana,
          anio_objetivo: nuevoAnio,
          cascada
        })
      });
      fetchTareas();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCrearPlantacion = async (cultivoId: string, anio: number, semanaInicio: number) => {
    try {
      await fetch('/api/plantaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cultivo_id: cultivoId, anio, semana_inicio: semanaInicio })
      });
      fetchPlantaciones();
      fetchTareas();
      setTab('agenda');
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditarPlantacion = async (id: string, cultivoId: string, anio: number, semanaInicio: number, estado: string) => {
    try {
      await fetch(`/api/plantaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cultivo_id: cultivoId, anio, semana_inicio: semanaInicio, estado })
      });
      fetchPlantaciones();
      fetchTareas();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEliminarPlantacion = async (id: string) => {
    try {
      await fetch(`/api/plantaciones/${id}`, { method: 'DELETE' });
      fetchPlantaciones();
      fetchTareas();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditarCultivo = async (id: string, data: Partial<Cultivo>) => {
    try {
      await fetch(`/api/cultivos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchCultivos();
      fetchPlantaciones();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEliminarCultivo = async (id: string) => {
    try {
      await fetch(`/api/cultivos/${id}`, { method: 'DELETE' });
      fetchCultivos();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-emerald-500 selection:text-slate-950">
      {/* Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-2xl shadow-inner">
              <Sprout className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Huerto <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Autoconsumo</span>
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 tracking-wider">
                  v1.0 ISO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Planificación temporal y gestión de cultivos por semanas ISO (1 - 52)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/80 text-xs shadow-sm">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 font-medium">Hoy:</span>
              <span className="font-bold text-emerald-400 text-sm">
                Semana {currentISO.week} ({currentISO.year})
              </span>
              <span className="text-slate-400 text-[11px] font-medium border-l border-slate-700 pl-2">
                Lun {formatShortDate(getMondayOfWeek(currentISO.week, currentISO.year))}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Dashboard Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tareas Esta Semana</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {tareas.filter(t => t.semana_objetivo === semanaActual && t.anio_objetivo === anioActual && !t.completado).length}
                <span className="text-xs font-normal text-slate-400 ml-1.5">
                  / {tareas.filter(t => t.semana_objetivo === semanaActual && t.anio_objetivo === anioActual).length} totales
                </span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plantaciones Activas</p>
              <h3 className="text-2xl font-black text-white mt-1">{plantaciones.length}</h3>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
              <Sprout className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catálogo Variedades</p>
              <h3 className="text-2xl font-black text-white mt-1">{cultivos.length}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/90 shadow-lg">
          <button
            onClick={() => setTab('agenda')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === 'agenda'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda Semanal</span>
          </button>

          <button
            onClick={() => setTab('gantt')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === 'gantt'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Gantt 52 Semanas</span>
          </button>

          <button
            onClick={() => setTab('plantaciones')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === 'plantaciones'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Plantaciones ({plantaciones.length})</span>
          </button>

          <button
            onClick={() => setTab('cultivos')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === 'cultivos'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Catálogo ({cultivos.length})</span>
          </button>

          <button
            onClick={() => setTab('importar')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === 'importar'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar YAML</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {tab === 'agenda' && (
          <AgendaSemanal
            tareas={tareas}
            semana={semanaActual}
            anio={anioActual}
            onSemanaChange={(w, y) => {
              setSemanaActual(w);
              setAnioActual(y);
            }}
            onToggleCompletado={handleToggleCompletado}
            onMoveTarea={handleMoveTarea}
          />
        )}

        {tab === 'gantt' && (
          <Gantt52
            plantaciones={plantaciones}
            tareas={tareas}
            anioActual={currentISO.year}
            semanaActual={currentISO.week}
          />
        )}

        {tab === 'plantaciones' && (
          <PlantacionesList
            plantaciones={plantaciones}
            cultivos={cultivos}
            semanaActual={currentISO.week}
            anioActual={currentISO.year}
            onCrearPlantacion={handleCrearPlantacion}
            onEditarPlantacion={handleEditarPlantacion}
            onEliminarPlantacion={handleEliminarPlantacion}
          />
        )}

        {tab === 'cultivos' && (
          <CultivosList
            cultivos={cultivos}
            onEditarCultivo={handleEditarCultivo}
            onEliminarCultivo={handleEliminarCultivo}
          />
        )}

        {tab === 'importar' && (
          <ImportadorCultivos
            onImportSuccess={() => {
              fetchCultivos();
              setTab('cultivos');
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
