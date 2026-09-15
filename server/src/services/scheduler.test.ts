import { describe, it, expect } from 'vitest';
import { parseCultivoTemplate } from './yamlParser';
import { generateHitosForPlantacion, recalculateCascadingHitos, addWeeks } from './scheduler';

describe('yamlParser', () => {
  it('debe parsear correctamente una plantilla YAML de cultivo', () => {
    const yamlStr = `cultivo:
  nombre: "Lechuga Batavia"
  familia: "Compositae"
  modo_inicio: "directa"
  semanas_optimas_siembra: [12, 13, 14]
  duracion_semanas:
    crecimiento: 6
    cosecha: 3
  mantenimiento_recurrentes:
    - tarea: "Riego frecuente"
      frecuencia_semanas: 1`;

    const result = parseCultivoTemplate(yamlStr);
    expect(result.nombre).toBe('Lechuga Batavia');
    expect(result.modo_inicio).toBe('directa');
    expect(result.semanas_optimas_siembra).toEqual([12, 13, 14]);
    expect(result.duracion_crecimiento).toBe(6);
    expect(result.duracion_cosecha).toBe(3);
    expect(result.mantenimiento_recurrentes).toHaveLength(1);
  });
});

describe('scheduler engine', () => {
  it('debe calcular correctamente addWeeks con salto de año', () => {
    const res = addWeeks(2026, 50, 4);
    expect(res).toEqual({ anio: 2027, semana: 2 });
  });

  it('debe generar hitos para un cultivo en semillero', () => {
    const cultivo = {
      id: 'c1',
      nombre: 'Tomate Raf',
      familia: 'Solanáceas',
      modo_inicio: 'semillero',
      semanas_optimas_siembra: '[8, 9, 10]',
      duracion_semillero: 6,
      duracion_crecimiento: 8,
      duracion_cosecha: 6,
      raw_template: ''
    };

    const hitos = generateHitosForPlantacion('p1', cultivo, 2026, 10);
    const tipos = hitos.map(h => h.tipo_accion);
    expect(tipos).toContain('siembra');
    expect(tipos).toContain('trasplante');
    expect(tipos).toContain('cosecha');

    const siembra = hitos.find(h => h.tipo_accion === 'siembra');
    expect(siembra?.semana_objetivo).toBe(10);

    const trasplante = hitos.find(h => h.tipo_accion === 'trasplante');
    expect(trasplante?.semana_objetivo).toBe(16); // 10 + 6
  });

  it('debe realizar el recálculo dinámico en cascada al mover un hito', () => {
    const hitos: any[] = [
      { id: 'h1', plantacion_id: 'p1', semana_objetivo: 10, anio_objetivo: 2026, tipo_accion: 'siembra' },
      { id: 'h2', plantacion_id: 'p1', semana_objetivo: 16, anio_objetivo: 2026, tipo_accion: 'trasplante' },
      { id: 'h3', plantacion_id: 'p1', semana_objetivo: 24, anio_objetivo: 2026, tipo_accion: 'cosecha' }
    ];

    // Move trasplante from week 16 to week 18 (2 weeks delay)
    const updated = recalculateCascadingHitos(hitos, 'h2', 18, 2026);

    // siembra should stay week 10
    expect(updated.find(h => h.id === 'h1')?.semana_objetivo).toBe(10);
    // trasplante is now week 18
    expect(updated.find(h => h.id === 'h2')?.semana_objetivo).toBe(18);
    // harvest shifted from 24 to 26
    expect(updated.find(h => h.id === 'h3')?.semana_objetivo).toBe(26);
  });
});
