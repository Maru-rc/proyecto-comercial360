import type { DataSource } from 'typeorm';

/** Reference catalogs every environment needs. Idempotent. */
export async function seedCatalogs(source: DataSource): Promise<void> {
  await source.query(`
    INSERT INTO zones (name) VALUES
      ('NORTE'), ('SUR'), ('CENTRO'), ('ORIENTE'), ('OCCIDENTE')
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO customer_types (name) VALUES
      ('Industrial'), ('Distribuidor'), ('Retail'), ('Gobierno'), ('Corporativo')
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO potentials (name, sort_order) VALUES
      ('Alto', 1), ('Medio', 2), ('Bajo', 3)
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO customer_statuses (name) VALUES
      ('Activo'), ('Inactivo'), ('Prospecto'), ('Suspendido')
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO portfolios (name, description) VALUES
      ('Maquinaria Industrial', 'Equipos y maquinaria para manufactura'),
      ('Repuestos y Componentes', 'Piezas de repuesto y componentes'),
      ('Servicios Técnicos', 'Mantenimiento y soporte técnico'),
      ('Soluciones Integrales', 'Proyectos llave en mano'),
      ('Consumibles', 'Materiales de consumo industrial')
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO visit_outcomes (name) VALUES
      ('Interesado'), ('No interesado'), ('Cotización generada'),
      ('Pedido cerrado'), ('No visitado'), ('Requiere seguimiento')
    ON CONFLICT DO NOTHING
  `);
}
