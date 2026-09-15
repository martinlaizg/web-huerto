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
    <div className="bg-slate-800/90 p-6 rounded-xl border border-slate-700 shadow-xl space-y-4">
      <div className="flex items-center space-x-2 border-b border-slate-700 pb-3">
        <FileCode className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">Importar Catálogo de Cultivo (YAML / JSON)</h2>
      </div>

      <p className="text-sm text-slate-300">
        Carga plantillas estructuradas de variedades con semanas óptimas de siembra, duración por fases y tareas de mantenimiento recurrente.
      </p>

      {error && (
        <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-lg flex items-center space-x-2 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-lg flex items-center space-x-2 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
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
            rows={10}
            value={templateText}
            onChange={e => setTemplateText(e.target.value)}
            className="w-full font-mono text-sm bg-slate-900 border border-slate-700 rounded-lg p-3 text-emerald-400 focus:outline-none focus:border-emerald-500"
            placeholder="Pega aquí el contenido YAML o JSON..."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition flex items-center space-x-2 border border-slate-600">
            <Upload className="w-4 h-4" />
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
            className="w-full sm:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Importando...' : 'Importar Cultivo'}
          </button>
        </div>
      </form>
    </div>
  );
};
