"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const yamlParser_1 = require("../services/yamlParser");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// GET /api/cultivos
router.get('/', (req, res) => {
    try {
        const list = db_1.db.select().from(schema_1.cultivos).all();
        const formatted = list.map(c => ({
            ...c,
            semanas_optimas_siembra: JSON.parse(c.semanas_optimas_siembra || '[]')
        }));
        res.json(formatted);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/cultivos/import
router.post('/import', (req, res) => {
    try {
        const { template } = req.body;
        if (!template || typeof template !== 'string') {
            res.status(400).json({ error: 'Se requiere el contenido de la plantilla en el campo "template"' });
            return;
        }
        const parsed = (0, yamlParser_1.parseCultivoTemplate)(template);
        db_1.db.insert(schema_1.cultivos).values({
            id: parsed.id,
            nombre: parsed.nombre,
            familia: parsed.familia,
            modo_inicio: parsed.modo_inicio,
            semanas_optimas_siembra: JSON.stringify(parsed.semanas_optimas_siembra),
            duracion_semillero: parsed.duracion_semillero,
            duracion_crecimiento: parsed.duracion_crecimiento,
            duracion_cosecha: parsed.duracion_cosecha,
            raw_template: parsed.raw_template
        }).run();
        res.status(201).json({
            message: 'Cultivo importado con éxito',
            cultivo: {
                ...parsed,
                semanas_optimas_siembra: parsed.semanas_optimas_siembra
            }
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// DELETE /api/cultivos/:id
router.delete('/:id', (req, res) => {
    try {
        const id = String(req.params.id);
        db_1.db.delete(schema_1.cultivos).where((0, drizzle_orm_1.eq)(schema_1.cultivos.id, id)).run();
        res.json({ message: 'Cultivo eliminado' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
