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

  const handleEliminarPlantacion = async (id: string) => {
    try {
      await fetch(`/api/plantaciones/${id}`, { method: 'DELETE' });
      fetchPlantaciones();
      fetchTareas();
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* Header Bar */}
      <header className="bg-slate-800 border-b border-slate-700/80 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <Sprout className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Huerto <span className="text-emerald-400">Autoconsumo</span>
              </h1>
              <p className="text-xs text-slate-400">MVP Módulo Temporal (ISO 1 - 52)</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Semana Actual:</span>
            <span className="font-bold text-emerald-400 text-sm">Semana {currentISO.week} ({currentISO.year})</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setTab('agenda')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition ${
              tab === 'agenda'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda Semanal</span>
          </button>

          <button
            onClick={() => setTab('gantt')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition ${
              tab === 'gantt'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Gantt 52 Semanas</span>
          </button>

          <button
            onClick={() => setTab('plantaciones')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition ${
              tab === 'plantaciones'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Plantaciones ({plantaciones.length})</span>
          </button>

          <button
            onClick={() => setTab('cultivos')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition ${
              tab === 'cultivos'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Catálogo ({cultivos.length})</span>
          </button>

          <button
            onClick={() => setTab('importar')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition ${
              tab === 'importar'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar YAML</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
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
            onEliminarPlantacion={handleEliminarPlantacion}
          />
        )}

        {tab === 'cultivos' && (
          <CultivosList
            cultivos={cultivos}
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
