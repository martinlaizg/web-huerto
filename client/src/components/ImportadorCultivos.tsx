import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  onImportSuccess: () => void;
}

const SAMPLE_YAML = `cultivo:
  nombre: "Pimiento de Padrón"
  familia: "Solanáceas"
  modo_inicio: "semillero"
  semanas_optimas_siembra: [9, 10, 11, 12]
  duracion_semanas:
    semillero: 8
    crecimiento: 8
    cosecha: 8
  mantenimiento_recurrentes:
    - tarea: "Tutorado y poda"
      frecuencia_semanas: 2
    - tarea: "Riego de mantenimiento"
      frecuencia_semanas: 1`;

export const ImportadorCultivos: React.FC<Props> = ({ onImportSuccess }) => {
  const [templateText, setTemplateText] = useState<string>(SAMPLE_YAML);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = async (textToImport: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/cultivos/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: textToImport })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al importar la plantilla');
      }

      setSuccess(`¡Cultivo "${data.cultivo.nombre}" importado correctamente!`);
      onImportSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setTemplateText(content);
        handleImport(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <FileCode className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Importar Catálogo de Cultivo (YAML / JSON)</h2>
          <p className="text-xs text-slate-400">Carga plantillas estructuradas de variedades agrícolas con sus parámetros y frecuencias</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center space-x-3 text-rose-300 text-xs shadow-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center space-x-3 text-emerald-300 text-xs shadow-md">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form
        onSubmit={e => {
          e.preventDefault();
          handleImport(templateText);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Plantilla YAML / JSON
          </label>
          <textarea
            rows={11}
            value={templateText}
            onChange={e => setTemplateText(e.target.value)}
            className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-400 focus:outline-none focus:border-emerald-500/80 transition leading-relaxed shadow-inner"
            placeholder="Pega aquí el contenido YAML o JSON..."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <label className="w-full sm:w-auto cursor-pointer px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 border border-slate-700/80 shadow-sm">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Subir Archivo (.yaml, .yml, .json)</span>
            <input
              type="file"
              accept=".yaml,.yml,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/50 disabled:opacity-50"
          >
            {loading ? 'Importando...' : 'Importar Cultivo'}
          </button>
        </div>
      </form>
    </div>
  );
};
