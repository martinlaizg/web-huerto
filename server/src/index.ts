import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';

import cultivosRouter from './routes/cultivos';
import plantacionesRouter from './routes/plantaciones';
import tareasRouter from './routes/tareas';
import { db } from './db';
import { cultivos } from './db/schema';
import { parseCultivoTemplate } from './services/yamlParser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/cultivos', cultivosRouter);
app.use('/api/plantaciones', plantacionesRouter);
app.use('/api/tareas', tareasRouter);

// Serve static frontend files in production
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(publicDir, 'index.html'));
    }
  });
}

// Seed initial default crop template if table empty
try {
  const existing = db.select().from(cultivos).all();
  if (existing.length === 0) {
    const defaultYaml = `cultivo:
  nombre: "Tomate Raf"
  familia: "Solanáceas"
  modo_inicio: "semillero"
  semanas_optimas_siembra: [8, 9, 10, 11, 12]
  duracion_semanas:
    semillero: 6
    crecimiento: 8
    cosecha: 6
  mantenimiento_recurrentes:
    - tarea: "Pinzado de chupones"
      frecuencia_semanas: 1
    - tarea: "Abonado de cobertura"
      frecuencia_semanas: 2`;

    const parsed = parseCultivoTemplate(defaultYaml);
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
    console.log('Sembrado cultivo por defecto: Tomate Raf');
  }
} catch (e) {
  console.error('Error seeding initial data:', e);
}

app.listen(PORT, () => {
  console.log(`Servidor de Huerto escuchando en puerto ${PORT}`);
});
