"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWeeks = addWeeks;
exports.getWeekAbsoluteIndex = getWeekAbsoluteIndex;
exports.generateHitosForPlantacion = generateHitosForPlantacion;
exports.recalculateCascadingHitos = recalculateCascadingHitos;
const node_crypto_1 = require("node:crypto");
const js_yaml_1 = __importDefault(require("js-yaml"));
function addWeeks(anio, semana, offsetWeeks) {
    const total = (anio * 52) + (semana - 1) + offsetWeeks;
    const newAnio = Math.floor(total / 52);
    const newSemana = (total % 52) + 1;
    return { anio: newAnio, semana: newSemana };
}
function getWeekAbsoluteIndex(anio, semana) {
    return (anio * 52) + (semana - 1);
}
function generateHitosForPlantacion(plantacionId, cultivo, anioInicio, semanaInicio) {
    const hitos = [];
    let rawTemplate = {};
    try {
        rawTemplate = js_yaml_1.default.load(cultivo.raw_template) || {};
    }
    catch (e) {
        // Ignore error if plain string
    }
    const cultivoData = rawTemplate.cultivo || rawTemplate;
    const mantenimientos = cultivoData.mantenimiento_recurrentes || [];
    const isSemillero = cultivo.modo_inicio === 'semillero';
    // 1. Siembra
    const posSiembra = addWeeks(anioInicio, semanaInicio, 0);
    hitos.push({
        id: (0, node_crypto_1.randomUUID)(),
        plantacion_id: plantacionId,
        semana_objetivo: posSiembra.semana,
        anio_objetivo: posSiembra.anio,
        tipo_accion: 'siembra',
        descripcion: isSemillero
            ? `Siembra en semillero: ${cultivo.nombre}`
            : `Siembra directa: ${cultivo.nombre}`,
        completado: false
    });
    let offsetTrasplante = 0;
    if (isSemillero && cultivo.duracion_semillero > 0) {
        offsetTrasplante = cultivo.duracion_semillero;
        const posTrasplante = addWeeks(anioInicio, semanaInicio, offsetTrasplante);
        hitos.push({
            id: (0, node_crypto_1.randomUUID)(),
            plantacion_id: plantacionId,
            semana_objetivo: posTrasplante.semana,
            anio_objetivo: posTrasplante.anio,
            tipo_accion: 'trasplante',
            descripcion: `Trasplante a terreno: ${cultivo.nombre}`,
            completado: false
        });
    }
    // 2. Cosecha
    const offsetInicioCosecha = offsetTrasplante + cultivo.duracion_crecimiento;
    const posInicioCosecha = addWeeks(anioInicio, semanaInicio, offsetInicioCosecha);
    hitos.push({
        id: (0, node_crypto_1.randomUUID)(),
        plantacion_id: plantacionId,
        semana_objetivo: posInicioCosecha.semana,
        anio_objetivo: posInicioCosecha.anio,
        tipo_accion: 'cosecha',
        descripcion: `Inicio de cosecha: ${cultivo.nombre}`,
        completado: false
    });
    if (cultivo.duracion_cosecha > 1) {
        const offsetFinCosecha = offsetInicioCosecha + cultivo.duracion_cosecha - 1;
        const posFinCosecha = addWeeks(anioInicio, semanaInicio, offsetFinCosecha);
        hitos.push({
            id: (0, node_crypto_1.randomUUID)(),
            plantacion_id: plantacionId,
            semana_objetivo: posFinCosecha.semana,
            anio_objetivo: posFinCosecha.anio,
            tipo_accion: 'cosecha',
            descripcion: `Fin de cosecha: ${cultivo.nombre}`,
            completado: false
        });
    }
    // 3. Mantenimiento recurrente (desde trasplante/siembra directa hasta fin de cosecha)
    const offsetFinTotal = offsetInicioCosecha + Math.max(1, cultivo.duracion_cosecha);
    for (const item of mantenimientos) {
        if (item.frecuencia_semanas > 0) {
            for (let w = offsetTrasplante + item.frecuencia_semanas; w <= offsetFinTotal; w += item.frecuencia_semanas) {
                const posMaint = addWeeks(anioInicio, semanaInicio, w);
                hitos.push({
                    id: (0, node_crypto_1.randomUUID)(),
                    plantacion_id: plantacionId,
                    semana_objetivo: posMaint.semana,
                    anio_objetivo: posMaint.anio,
                    tipo_accion: 'mantenimiento',
                    descripcion: `${item.tarea}: ${cultivo.nombre}`,
                    completado: false
                });
            }
        }
    }
    return hitos;
}
function recalculateCascadingHitos(allHitos, targetHitoId, newSemana, newAnio) {
    const targetHito = allHitos.find(h => h.id === targetHitoId);
    if (!targetHito)
        return allHitos;
    const oldIndex = getWeekAbsoluteIndex(targetHito.anio_objetivo, targetHito.semana_objetivo);
    const newIndex = getWeekAbsoluteIndex(newAnio, newSemana);
    const delta = newIndex - oldIndex;
    if (delta === 0)
        return allHitos;
    return allHitos.map(h => {
        const currentIndex = getWeekAbsoluteIndex(h.anio_objetivo, h.semana_objetivo);
        if (h.id === targetHitoId || currentIndex > oldIndex) {
            const updatedIndex = currentIndex + delta;
            const updatedAnio = Math.floor(updatedIndex / 52);
            const updatedSemana = (updatedIndex % 52) + 1;
            return {
                ...h,
                anio_objetivo: updatedAnio,
                semana_objetivo: updatedSemana
            };
        }
        return h;
    });
}
