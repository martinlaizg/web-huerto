import yaml from 'js-yaml';
import { randomUUID } from 'node:crypto';

export interface MantenimientoRecurrente {
  tarea: string;
  frecuencia_semanas: number;
}

export interface CultivoParsed {
  id: string;
  nombre: string;
  familia: string;
  modo_inicio: 'semillero' | 'directa';
  semanas_optimas_siembra: number[];
  duracion_semillero: number;
  duracion_crecimiento: number;
  duracion_cosecha: number;
  mantenimiento_recurrentes?: MantenimientoRecurrente[];
  raw_template: string;
}

export function parseCultivoTemplate(rawContent: string): CultivoParsed {
  let parsed: any;
  try {
    parsed = yaml.load(rawContent);
  } catch (err: any) {
    throw new Error(`Error al interpretar la plantilla YAML/JSON: ${err.message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('La plantilla debe ser un objeto YAML/JSON válido');
  }

  const data = parsed.cultivo ? parsed.cultivo : parsed;

  if (!data.nombre || typeof data.nombre !== 'string') {
    throw new Error('El campo "nombre" es obligatorio');
  }
  if (!data.familia || typeof data.familia !== 'string') {
    throw new Error('El campo "familia" es obligatorio');
  }

  const modo_inicio = data.modo_inicio === 'directa' ? 'directa' : 'semillero';

  const semanas_optimas = Array.isArray(data.semanas_optimas_siembra)
    ? data.semanas_optimas_siembra.map(Number).filter((n: number) => !isNaN(n) && n >= 1 && n <= 52)
    : [];

  const duracion = data.duracion_semanas || {};
  const duracion_semillero = modo_inicio === 'semillero' ? Number(duracion.semillero || 0) : 0;
  const duracion_crecimiento = Number(duracion.crecimiento || 0);
  const duracion_cosecha = Number(duracion.cosecha || 0);

  const mantenimiento_recurrentes: MantenimientoRecurrente[] = [];
  if (Array.isArray(data.mantenimiento_recurrentes)) {
    for (const item of data.mantenimiento_recurrentes) {
      if (item && item.tarea && typeof item.frecuencia_semanas === 'number') {
        mantenimiento_recurrentes.push({
          tarea: String(item.tarea),
          frecuencia_semanas: Number(item.frecuencia_semanas)
        });
      }
    }
  }

  return {
    id: randomUUID(),
    nombre: data.nombre.trim(),
    familia: data.familia.trim(),
    modo_inicio,
    semanas_optimas_siembra: semanas_optimas,
    duracion_semillero,
    duracion_crecimiento,
    duracion_cosecha,
    mantenimiento_recurrentes,
    raw_template: rawContent
  };
}
