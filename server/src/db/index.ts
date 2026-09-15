import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'huerto.db');
const sqlite = new Database(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS cultivos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    familia TEXT NOT NULL,
    modo_inicio TEXT NOT NULL,
    semanas_optimas_siembra TEXT NOT NULL,
    duracion_semillero INTEGER NOT NULL DEFAULT 0,
    duracion_crecimiento INTEGER NOT NULL DEFAULT 0,
    duracion_cosecha INTEGER NOT NULL DEFAULT 0,
    raw_template TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS plantaciones (
    id TEXT PRIMARY KEY,
    cultivo_id TEXT NOT NULL REFERENCES cultivos(id) ON DELETE CASCADE,
    anio INTEGER NOT NULL,
    semana_inicio INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'activa'
  );

  CREATE TABLE IF NOT EXISTS hitos_tareas (
    id TEXT PRIMARY KEY,
    plantacion_id TEXT NOT NULL REFERENCES plantaciones(id) ON DELETE CASCADE,
    semana_objetivo INTEGER NOT NULL,
    anio_objetivo INTEGER NOT NULL,
    tipo_accion TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    completado INTEGER NOT NULL DEFAULT 0
  );
`);

export const db = drizzle(sqlite);
export { sqlite };
