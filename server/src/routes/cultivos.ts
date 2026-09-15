import { Router, Request, Response } from 'express';
import { db } from '../db';
import { cultivos } from '../db/schema';
import { parseCultivoTemplate } from '../services/yamlParser';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/cultivos
router.get('/', (req: Request, res: Response) => {
  try {
    const list = db.select().from(cultivos).all();
    const formatted = list.map(c => ({
      ...c,
      semanas_optimas_siembra: JSON.parse(c.semanas_optimas_siembra || '[]')
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cultivos/import
router.post('/import', (req: Request, res: Response) => {
  try {
    const { template } = req.body;
    if (!template || typeof template !== 'string') {
      res.status(400).json({ error: 'Se requiere el contenido de la plantilla en el campo "template"' });
      return;
    }

    const parsed = parseCultivoTemplate(template);

    db.insert(cultivos).values({
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
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cultivos/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    db.delete(cultivos).where(eq(cultivos.id, id)).run();
    res.json({ message: 'Cultivo eliminado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
