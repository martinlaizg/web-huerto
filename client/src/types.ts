export interface Cultivo {
  id: string;
  nombre: string;
  familia: string;
  modo_inicio: 'semillero' | 'directa';
  semanas_optimas_siembra: number[];
  duracion_semillero: number;
  duracion_crecimiento: number;
  duracion_cosecha: number;
  raw_template: string;
}

export interface Plantacion {
  id: string;
  cultivo_id: string;
  anio: number;
  semana_inicio: number;
  estado: 'activa' | 'finalizada' | 'cancelada';
  cultivo_nombre: string;
  cultivo_familia: string;
  cultivo_modo: string;
}

export interface HitoTarea {
  id: string;
  plantacion_id: string;
  semana_objetivo: number;
  anio_objetivo: number;
  tipo_accion: 'siembra' | 'trasplante' | 'mantenimiento' | 'cosecha';
  descripcion: string;
  completado: boolean;
  cultivo_nombre?: string;
  cultivo_familia?: string;
}
