import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const cultivos = sqliteTable('cultivos', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  familia: text('familia').notNull(),
  modo_inicio: text('modo_inicio').notNull(), // 'semillero' | 'directa'
  semanas_optimas_siembra: text('semanas_optimas_siembra').notNull(), // JSON string e.g. "[8, 9, 10]"
  duracion_semillero: integer('duracion_semillero').default(0).notNull(),
  duracion_crecimiento: integer('duracion_crecimiento').default(0).notNull(),
  duracion_cosecha: integer('duracion_cosecha').default(0).notNull(),
  raw_template: text('raw_template').notNull()
});

export const plantaciones = sqliteTable('plantaciones', {
  id: text('id').primaryKey(),
  cultivo_id: text('cultivo_id').notNull().references(() => cultivos.id, { onDelete: 'cascade' }),
  anio: integer('anio').notNull(),
  semana_inicio: integer('semana_inicio').notNull(),
  estado: text('estado').notNull().default('activa') // 'activa' | 'finalizada' | 'cancelada'
});

export const hitosTareas = sqliteTable('hitos_tareas', {
  id: text('id').primaryKey(),
  plantacion_id: text('plantacion_id').notNull().references(() => plantaciones.id, { onDelete: 'cascade' }),
  semana_objetivo: integer('semana_objetivo').notNull(), // 1-52
  anio_objetivo: integer('anio_objetivo').notNull(),
  tipo_accion: text('tipo_accion').notNull(), // 'siembra' | 'trasplante' | 'mantenimiento' | 'cosecha'
  descripcion: text('descripcion').notNull(),
  completado: integer('completado', { mode: 'boolean' }).notNull().default(false)
});
