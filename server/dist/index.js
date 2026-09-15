"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const cultivos_1 = __importDefault(require("./routes/cultivos"));
const plantaciones_1 = __importDefault(require("./routes/plantaciones"));
const tareas_1 = __importDefault(require("./routes/tareas"));
const db_1 = require("./db");
const schema_1 = require("./db/schema");
const yamlParser_1 = require("./services/yamlParser");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use('/api/cultivos', cultivos_1.default);
app.use('/api/plantaciones', plantaciones_1.default);
app.use('/api/tareas', tareas_1.default);
// Serve static frontend files in production
const publicDir = node_path_1.default.join(__dirname, '../public');
if (node_fs_1.default.existsSync(publicDir)) {
    app.use(express_1.default.static(publicDir));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(node_path_1.default.join(publicDir, 'index.html'));
        }
    });
}
// Seed initial default crop template if table empty
try {
    const existing = db_1.db.select().from(schema_1.cultivos).all();
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
        const parsed = (0, yamlParser_1.parseCultivoTemplate)(defaultYaml);
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
        console.log('Sembrado cultivo por defecto: Tomate Raf');
    }
}
catch (e) {
    console.error('Error seeding initial data:', e);
}
app.listen(PORT, () => {
    console.log(`Servidor de Huerto escuchando en puerto ${PORT}`);
});
