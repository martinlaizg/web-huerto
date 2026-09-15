"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hitosTareas = exports.plantaciones = exports.cultivos = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.cultivos = (0, sqlite_core_1.sqliteTable)('cultivos', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    nombre: (0, sqlite_core_1.text)('nombre').notNull(),
    familia: (0, sqlite_core_1.text)('familia').notNull(),
    modo_inicio: (0, sqlite_core_1.text)('modo_inicio').notNull(), // 'semillero' | 'directa'
    semanas_optimas_siembra: (0, sqlite_core_1.text)('semanas_optimas_siembra').notNull(), // JSON string e.g. "[8, 9, 10]"
    duracion_semillero: (0, sqlite_core_1.integer)('duracion_semillero').default(0).notNull(),
    duracion_crecimiento: (0, sqlite_core_1.integer)('duracion_crecimiento').default(0).notNull(),
    duracion_cosecha: (0, sqlite_core_1.integer)('duracion_cosecha').default(0).notNull(),
    raw_template: (0, sqlite_core_1.text)('raw_template').notNull()
});
exports.plantaciones = (0, sqlite_core_1.sqliteTable)('plantaciones', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    cultivo_id: (0, sqlite_core_1.text)('cultivo_id').notNull().references(() => exports.cultivos.id, { onDelete: 'cascade' }),
    anio: (0, sqlite_core_1.integer)('anio').notNull(),
    semana_inicio: (0, sqlite_core_1.integer)('semana_inicio').notNull(),
    estado: (0, sqlite_core_1.text)('estado').notNull().default('activa') // 'activa' | 'finalizada' | 'cancelada'
});
exports.hitosTareas = (0, sqlite_core_1.sqliteTable)('hitos_tareas', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    plantacion_id: (0, sqlite_core_1.text)('plantacion_id').notNull().references(() => exports.plantaciones.id, { onDelete: 'cascade' }),
    semana_objetivo: (0, sqlite_core_1.integer)('semana_objetivo').notNull(), // 1-52
    anio_objetivo: (0, sqlite_core_1.integer)('anio_objetivo').notNull(),
    tipo_accion: (0, sqlite_core_1.text)('tipo_accion').notNull(), // 'siembra' | 'trasplante' | 'mantenimiento' | 'cosecha'
    descripcion: (0, sqlite_core_1.text)('descripcion').notNull(),
    completado: (0, sqlite_core_1.integer)('completado', { mode: 'boolean' }).notNull().default(false)
});
