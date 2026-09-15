"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCultivoTemplate = parseCultivoTemplate;
const js_yaml_1 = __importDefault(require("js-yaml"));
const node_crypto_1 = require("node:crypto");
function parseCultivoTemplate(rawContent) {
    let parsed;
    try {
        parsed = js_yaml_1.default.load(rawContent);
    }
    catch (err) {
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
        ? data.semanas_optimas_siembra.map(Number).filter((n) => !isNaN(n) && n >= 1 && n <= 52)
        : [];
    const duracion = data.duracion_semanas || {};
    const duracion_semillero = modo_inicio === 'semillero' ? Number(duracion.semillero || 0) : 0;
    const duracion_crecimiento = Number(duracion.crecimiento || 0);
    const duracion_cosecha = Number(duracion.cosecha || 0);
    const mantenimiento_recurrentes = [];
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
        id: (0, node_crypto_1.randomUUID)(),
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
