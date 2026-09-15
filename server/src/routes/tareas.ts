import { Router, Request, Response } from 'express';
import { db } from '../db';
import { hitosTareas, plantaciones, cultivos } from '../db/schema';
import { recalculateCascadingHitos, HitoTareaRecord } from '../services/scheduler';
import { eq, and } from 'drizzle-orm';

const router = Router();

// GET /api/tareas
router.get('/', (req: Request, res: Response) => {
  try {
    const { semana, anio } = req.query;

    let query = db.select({
      id: hitosTareas.id,
      plantacion_id: hitosTareas.plantacion_id,
      semana_objetivo: hitosTareas.semana_objetivo,
      anio_objetivo: hitosTareas.anio_objetivo,
      tipo_accion: hitosTareas.tipo_accion,
      descripcion: hitosTareas.descripcion,
      completado: hitosTareas.completado,
      cultivo_nombre: cultivos.nombre,
      cultivo_familia: cultivos.familia
    })
    .from(hitosTareas)
    .innerJoin(plantaciones, eq(hitosTareas.plantacion_id, plantaciones.id))
    .innerJoin(cultivos, eq(plantaciones.cultivo_id, cultivos.id));

    let results;
    if (semana && anio) {
      results = query.where(
        and(
          eq(hitosTareas.semana_objetivo, Number(semana)),
          eq(hitosTareas.anio_objetivo, Number(anio))
        )
      ).all();
    } else if (anio) {
      results = query.where(eq(hitosTareas.anio_objetivo, Number(anio))).all();
    } else {
      results = query.all();
    }

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tareas/:id
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { completado, semana_objetivo, anio_objetivo, cascada } = req.body;

    const targetHito = db.select().from(hitosTareas).where(eq(hitosTareas.id, id)).get();
    if (!targetHito) {
      res.status(404).json({ error: 'Tarea/Hito no encontrado' });
      return;
    }

    // Toggle completion
    if (typeof completado === 'boolean') {
      db.update(hitosTareas)
        .set({ completado })
        .where(eq(hitosTareas.id, id))
        .run();
    }

    // Week move & dynamic cascading
    if (typeof semana_objetivo === 'number' && typeof anio_objetivo === 'number') {
      if (cascada) {
        // Fetch all hitos for this plantation
        const allPlantationHitos = db.select()
          .from(hitosTareas)
          .where(eq(hitosTareas.plantacion_id, targetHito.plantacion_id))
          .all() as HitoTareaRecord[];

        const updatedHitos = recalculateCascadingHitos(
          allPlantationHitos,
          id,
          semana_objetivo,
          anio_objetivo
        );

        for (const h of updatedHitos) {
          db.update(hitosTareas)
            .set({
              semana_objetivo: h.semana_objetivo,
              anio_objetivo: h.anio_objetivo
            })
            .where(eq(hitosTareas.id, h.id))
            .run();
        }
      } else {
        // Update single task only
        db.update(hitosTareas)
          .set({
            semana_objetivo,
            anio_objetivo
          })
          .where(eq(hitosTareas.id, id))
          .run();
      }
    }

    const updated = db.select().from(hitosTareas).where(eq(hitosTareas.id, id)).get();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
