"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const scheduler_1 = require("../services/scheduler");
const drizzle_orm_1 = require("drizzle-orm");
const node_crypto_1 = require("node:crypto");
const router = (0, express_1.Router)();
// GET /api/plantaciones
router.get('/', (req, res) => {
    try {
        const list = db_1.db.select({
            id: schema_1.plantaciones.id,
            cultivo_id: schema_1.plantaciones.cultivo_id,
            anio: schema_1.plantaciones.anio,
            semana_inicio: schema_1.plantaciones.semana_inicio,
            estado: schema_1.plantaciones.estado,
            cultivo_nombre: schema_1.cultivos.nombre,
            cultivo_familia: schema_1.cultivos.familia,
            cultivo_modo: schema_1.cultivos.modo_inicio
        })
            .from(schema_1.plantaciones)
            .innerJoin(schema_1.cultivos, (0, drizzle_orm_1.eq)(schema_1.plantaciones.cultivo_id, schema_1.cultivos.id))
            .all();
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/plantaciones
router.post('/', (req, res) => {
    try {
        const { cultivo_id, anio, semana_inicio } = req.body;
        if (!cultivo_id || !anio || !semana_inicio) {
            res.status(400).json({ error: 'cultivo_id, anio y semana_inicio son obligatorios' });
            return;
        }
        const cultivoObj = db_1.db.select().from(schema_1.cultivos).where((0, drizzle_orm_1.eq)(schema_1.cultivos.id, cultivo_id)).get();
        if (!cultivoObj) {
            res.status(404).json({ error: 'Cultivo no encontrado' });
            return;
        }
        const plantacionId = (0, node_crypto_1.randomUUID)();
        const newAnio = Number(anio);
        const newSemana = Number(semana_inicio);
        db_1.db.insert(schema_1.plantaciones).values({
            id: plantacionId,
            cultivo_id,
            anio: newAnio,
            semana_inicio: newSemana,
            estado: 'activa'
        }).run();
        const hitos = (0, scheduler_1.generateHitosForPlantacion)(plantacionId, cultivoObj, newAnio, newSemana);
        for (const hito of hitos) {
            db_1.db.insert(schema_1.hitosTareas).values({
                id: hito.id,
                plantacion_id: hito.plantacion_id,
                semana_objetivo: hito.semana_objetivo,
                anio_objetivo: hito.anio_objetivo,
                tipo_accion: hito.tipo_accion,
                descripcion: hito.descripcion,
                completado: hito.completado
            }).run();
        }
        res.status(201).json({
            message: 'Plantación creada y tareas generadas',
            plantacion_id: plantacionId,
            hitos_generados: hitos.length
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// DELETE /api/plantaciones/:id
router.delete('/:id', (req, res) => {
    try {
        const id = String(req.params.id);
        db_1.db.delete(schema_1.plantaciones).where((0, drizzle_orm_1.eq)(schema_1.plantaciones.id, id)).run();
        res.json({ message: 'Plantación eliminada' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
