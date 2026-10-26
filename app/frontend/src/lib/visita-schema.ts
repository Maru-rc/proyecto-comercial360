import * as z from 'zod';

// valueAsNumber turns an empty input into NaN; an empty amount is "not given"
const optionalAmount = z.preprocess(
  (value) =>
    typeof value === 'number' && Number.isNaN(value) ? undefined : value,
  z.number().positive('El valor debe ser mayor que 0').optional(),
);

export const visitaSchema = z
  .object({
    fecha_visita: z.string().min(1, 'La fecha es obligatoria'),
    hora_inicio: z.string().min(1, 'Hora de inicio requerida'),
    hora_fin: z.string().min(1, 'Hora de fin requerida'),
    id_ruta: z.string().default(''),
    territorio: z.string().default(''),
    semana: z.number('Elige una fecha de visita válida').min(1),
    dia: z.string().min(1, 'Elige una fecha de visita válida'),
    asesor_nombre: z.string().min(1, 'Falta el asesor de la visita'),

    id_cliente: z.string().min(1, 'Selecciona un cliente registrado'),
    cliente_nombre: z.string().min(1, 'Cliente requerido'),
    codigo_cliente: z.string().default(''),
    tipo_cliente: z.string().default(''),
    municipio: z.string().default(''),
    contacto: z.string().default(''),
    telefono: z.string().default(''),
    cargo: z.string().default(''),
    canal_contacto: z.string().default('Presencial'),

    objetivo_visita: z.string().default(''),
    tipo_visita: z.string().default(''),
    potencial_cliente: z.string().default(''),
    estado_visita: z.enum(
      [
        'VISITADO',
        'PENDIENTE',
        'SIN_VISITAR',
        'PEDIDO_CERRADO',
        'REPROGRAMADO',
        'PROGRAMADA',
      ],
      'Elige el estado de la visita',
    ),
    resultado_visita: z.enum(
      [
        'Interesado',
        'Pedido',
        'Programada',
        'No visitado',
        'Cotización enviada',
        'No interesado',
      ],
      'Elige el resultado de la visita',
    ),
    interes_productos: z.string().default(''),
    modulo_interes: z.string().default(''),
    competencia_mencionada: z.string().default(''),
    observaciones: z
      .string()
      .max(500, 'Las observaciones no pueden pasar de 500 caracteres'),

    genero_cotizacion: z.boolean().default(false),
    numero_cotizacion: z.string().optional(),
    valor_cotizacion: optionalAmount,
    moneda: z.string().default('COP'),

    genero_pedido: z.boolean().default(false),
    numero_pedido: z.string().optional(),
    valor_pedido: optionalAmount,
    fecha_estimada_entrega: z.string().optional(),

    fecha_proxima_visita: z
      .string()
      .min(1, 'Fecha de próximo seguimiento requerida'),
    hora_proxima_visita: z.string().optional(),
    objetivo_proximo_seguimiento: z.string().optional(),
    responsable_seguimiento: z.string().optional(),
  })
  .superRefine((form, ctx) => {
    // Without number and amount the quotation or order would be silently dropped
    if (form.genero_cotizacion && !form.numero_cotizacion?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['numero_cotizacion'],
        message: 'Escribe el número de la cotización',
      });
    }
    if (form.genero_cotizacion && form.valor_cotizacion === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['valor_cotizacion'],
        message: 'Escribe el valor de la cotización',
      });
    }
    if (form.genero_pedido && !form.numero_pedido?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['numero_pedido'],
        message: 'Escribe el número del pedido',
      });
    }
    if (form.genero_pedido && form.valor_pedido === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['valor_pedido'],
        message: 'Escribe el valor del pedido',
      });
    }
  });
