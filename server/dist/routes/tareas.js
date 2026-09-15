"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const scheduler_1 = require("../services/scheduler");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// GET /api/tareas
router.get('/', (req, res) => {
    try {
        const { semana, anio } = req.query;
        let query = db_1.db.select({
            id: schema_1.hitosTareas.id,
            plantacion_id: schema_1.hitosTareas.plantacion_id,
            semana_objetivo: schema_1.hitosTareas.semana_objetivo,
            anio_objetivo: schema_1.hitosTareas.anio_objetivo,
            tipo_accion: schema_1.hitosTareas.tipo_accion,
            descripcion: schema_1.hitosTareas.descripcion,
            completado: schema_1.hitosTareas.completado,
            cultivo_nombre: schema_1.cultivos.nombre,
            cultivo_familia: schema_1.cultivos.familia
        })
            .from(schema_1.hitosTareas)
            .innerJoin(schema_1.plantaciones, (0, drizzle_orm_1.eq)(schema_1.hitosTareas.plantacion_id, schema_1.plantaciones.id))
            .innerJoin(schema_1.cultivos, (0, drizzle_orm_1.eq)(schema_1.plantaciones.cultivo_id, schema_1.cultivos.id));
        let results;
        if (semana && anio) {
            results = query.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.hitosTareas.semana_objetivo, Number(semana)), (0, drizzle_orm_1.eq)(schema_1.hitosTareas.anio_objetivo, Number(anio)))).all();
        }
        else if (anio) {
            results = query.where((0, drizzle_orm_1.eq)(schema_1.hitosTareas.anio_objetivo, Number(anio))).all();
        }
        else {
            results = query.all();
        }
        res.json(results);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// PATCH /api/tareas/:id
router.patch('/:id', (req, res) => {
    try {
        const id = String(req.params.id);
        const { completado, semana_objetivo, anio_objetivo, cascada } = req.body;
        const targetHito = db_1.db.select().from(schema_1.hitosTareas).where((0, drizzle_orm_1.eq)(schema_1.hitosTareas.id, id)).get();
        if (!targetHito) {
            res.status(404).json({ error: 'Tarea/Hito no encontrado' });
            return;
        }
        // Toggle completion
        if (typeof completado === 'boolean') {
            db_1.db.update(schema_1.hitosTareas)
                .set({ completado })
                .where((0, drizzle_orm_1.eq)(schema_1.hitosTareas.id, id))
                .run();
        }
        // Week move & dynamic cascading
        if (typeof semana_objetivo === 'number' && typeof anio_objetivo === 'number') {
            if (cascada) {
                // Fetch all hitos for this plantation
                const allPlantationHitos = db_1.db.select()
                    .from(schema_1.hitosTareas)
                    .where((0, drizzle_orm_1.eq)(schema_1.hitosTareas.plantacion_id, targetHito.plantacion_id))
                    .all();
                const updatedHitos = (0, scheduler_1.recalculateCascadingHitos)(allPlantationHitos, id, semana_objetivo, anio_objetivo);
                for (const h of updatedHitos) {
                    db_1.db.update(schema_1.hitosTareas)
                        .set({
                        semana_objetivo: h.semana_objetivo,
                        anio_objetivo: h.anio_objetivo
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.hitosTareas.id, h.id))
                        .run();
                }
            }
            else {
                // Update single task only
                db_1.db.update(schema_1.hitosTareas)
                    .set({
                    semana_objetivo,
                    anio_objetivo
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.hitosTareas.id, id))
                    .run();
            }
        }
        const updated = db_1.db.select().from(schema_1.hitosTareas).where((0, drizzle_orm_1.eq)(schema_1.hitosTareas.id, id)).get();
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
