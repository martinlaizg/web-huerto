"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlite = exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const better_sqlite3_2 = require("drizzle-orm/better-sqlite3");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const dataDir = node_path_1.default.resolve(__dirname, '../../data');
if (!node_fs_1.default.existsSync(dataDir)) {
    node_fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const dbPath = node_path_1.default.join(dataDir, 'huerto.db');
const sqlite = new better_sqlite3_1.default(dbPath);
exports.sqlite = sqlite;
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
exports.db = (0, better_sqlite3_2.drizzle)(sqlite);
