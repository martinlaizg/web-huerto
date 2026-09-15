import { Router, Request, Response } from 'express';
import { db } from '../db';
import { plantaciones, cultivos, hitosTareas } from '../db/schema';
import { generateHitosForPlantacion, CultivoRecord } from '../services/scheduler';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

const router = Router();

// GET /api/plantaciones
router.get('/', (req: Request, res: Response) => {
  try {
    const list = db.select({
      id: plantaciones.id,
      cultivo_id: plantaciones.cultivo_id,
      anio: plantaciones.anio,
      semana_inicio: plantaciones.semana_inicio,
      estado: plantaciones.estado,
      cultivo_nombre: cultivos.nombre,
      cultivo_familia: cultivos.familia,
      cultivo_modo: cultivos.modo_inicio
    })
    .from(plantaciones)
    .innerJoin(cultivos, eq(plantaciones.cultivo_id, cultivos.id))
    .all();

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/plantaciones
router.post('/', (req: Request, res: Response) => {
  try {
    const { cultivo_id, anio, semana_inicio } = req.body;

    if (!cultivo_id || !anio || !semana_inicio) {
      res.status(400).json({ error: 'cultivo_id, anio y semana_inicio son obligatorios' });
      return;
    }

    const cultivoObj = db.select().from(cultivos).where(eq(cultivos.id, cultivo_id)).get();
    if (!cultivoObj) {
      res.status(404).json({ error: 'Cultivo no encontrado' });
      return;
    }

    const plantacionId = randomUUID();
    const newAnio = Number(anio);
    const newSemana = Number(semana_inicio);

    db.insert(plantaciones).values({
      id: plantacionId,
      cultivo_id,
      anio: newAnio,
      semana_inicio: newSemana,
      estado: 'activa'
    }).run();

    const hitos = generateHitosForPlantacion(plantacionId, cultivoObj as CultivoRecord, newAnio, newSemana);

    for (const hito of hitos) {
      db.insert(hitosTareas).values({
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/plantaciones/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    db.delete(plantaciones).where(eq(plantaciones.id, id)).run();
    res.json({ message: 'Plantación eliminada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
