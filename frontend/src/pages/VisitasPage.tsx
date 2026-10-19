import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, ClipboardCheck } from 'lucide-react';
import { VisitGeneralForm } from '../components/visitas/VisitGeneralForm';
import { VisitCustomerForm } from '../components/visitas/VisitCustomerForm';
import { VisitDetailForm } from '../components/visitas/VisitDetailForm';
import { VisitCommercialForm } from '../components/visitas/VisitCommercialForm';
import { VisitFollowupForm } from '../components/visitas/VisitFollowupForm';
import { CustomerSummaryCard } from '../components/visitas/CustomerSummaryCard';
import { CustomerInteractionsTimeline } from '../components/visitas/CustomerInteractionsTimeline';
import { QuickActions } from '../components/visitas/QuickActions';
import { IVisitaRegistroFormData } from '../types/visita';
import { useVisitas } from '../hooks/useVisitas';
import { getClientes } from '../api/clientes';
import { ICliente } from '../types/cliente';
import { IS3UploadResponse } from '../api/storage';

const visitaSchema = z.object({
  fecha_visita: z.string().min(1, 'La fecha es obligatoria'),
  hora_inicio: z.string().min(1, 'Hora de inicio requerida'),
  hora_fin: z.string().min(1, 'Hora de fin requerida'),
  id_ruta: z.string().min(1, 'Ruta requerida'),
  territorio: z.string().min(1, 'Territorio requerido'),
  semana: z.number().min(1),
  dia: z.string().min(1),
  asesor_nombre: z.string().min(1),

  id_cliente: z.string().default('cli-001'),
  cliente_nombre: z.string().min(1, 'Cliente requerido'),
  codigo_cliente: z.string().default('CJI-001245'),
  tipo_cliente: z.string().default('Industrial'),
  municipio: z.string().min(1, 'Municipio requerido'),
  contacto: z.string().default('Carlos Julio Mendoza'),
  telefono: z.string().default('300 123 4567'),
  cargo: z.string().default('Jefe de Compras'),
  canal_contacto: z.string().default('Presencial'),

  objetivo_visita: z.string().default('Presentación de nueva línea'),
  tipo_visita: z.string().default('Desarrollo de cliente'),
  potencial_cliente: z.string().default('Alto'),
  estado_visita: z.enum(['VISITADO', 'PENDIENTE', 'SIN_VISITAR', 'PEDIDO_CERRADO', 'REPROGRAMADO', 'PROGRAMADA']),
  resultado_visita: z.enum(['Interesado', 'Pedido', 'Programada', 'No visitado', 'Cotización enviada', 'No interesado']),
  interes_productos: z.string().default('Alto'),
  modulo_interes: z.string().default('Calidad y precio'),
  competencia_mencionada: z.string().default('Inducacor'),
  observaciones: z.string().max(500),

  genero_cotizacion: z.boolean().default(true),
  numero_cotizacion: z.string().optional(),
  valor_cotizacion: z.number().optional(),
  moneda: z.string().default('COP'),

  genero_pedido: z.boolean().default(true),
  numero_pedido: z.string().optional(),
  valor_pedido: z.number().optional(),
  fecha_estimada_entrega: z.string().optional(),

  fecha_proxima_visita: z.string().min(1, 'Fecha de próximo seguimiento requerida'),
  hora_proxima_visita: z.string().optional(),
  objetivo_proximo_seguimiento: z.string().optional(),
  responsable_seguimiento: z.string().optional(),
});

export const VisitasPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registrarVisita, isSubmitting } = useVisitas();
  const [activeCliente, setActiveCliente] = useState<ICliente | undefined>();
  const [s3Fotos, setS3Fotos] = useState<string[]>([]);
  const [s3Docs, setS3Docs] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState(false);

  // Read query params if arriving from "Iniciar visita"
  const searchParams = new URLSearchParams(location.search);
  const clienteParam = searchParams.get('cliente') || 'Metalúrgicas S.A.S.';
  const horaParam = searchParams.get('hora') || '10:15 AM';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IVisitaRegistroFormData>({
    resolver: zodResolver(visitaSchema) as any,
    defaultValues: {
      fecha_visita: '2024-05-21',
      hora_inicio: horaParam,
      hora_fin: '11:30 AM',
      id_ruta: 'RUT-002',
      territorio: 'NORTE',
      semana: 21,
      dia: 'Martes',
      asesor_nombre: 'Juan Pérez',

      id_cliente: 'cli-001',
      cliente_nombre: clienteParam,
      codigo_cliente: 'CJI-001245',
      tipo_cliente: 'Industrial',
      municipio: 'Barranquilla',
      contacto: 'Carlos Julio Mendoza',
      telefono: '300 123 4567',
      cargo: 'Jefe de Compras',
      canal_contacto: 'Presencial',

      objetivo_visita: 'Presentación de nueva línea',
      tipo_visita: 'Desarrollo de cliente',
      potencial_cliente: 'Alto',
      estado_visita: 'VISITADO',
      resultado_visita: 'Interesado',
      interes_productos: 'Alto',
      modulo_interes: 'Calidad y precio',
      competencia_mencionada: 'Inducacor',
      observaciones:
        'Cliente interesado en la nueva línea de equipos de soldadura. Solicita cotización formal y muestras de productos.',

      genero_cotizacion: true,
      numero_cotizacion: 'COT-1242',
      valor_cotizacion: 24800000,
      moneda: 'COP',

      genero_pedido: true,
      numero_pedido: 'PED-568',
      valor_pedido: 18500000,
      fecha_estimada_entrega: '2024-05-30',

      fecha_proxima_visita: '2024-05-28',
      hora_proxima_visita: '09:00 AM',
      objetivo_proximo_seguimiento:
        'Presentar propuesta técnica y cierre comercial',
      responsable_seguimiento: 'Juan Pérez',
    },
  });

  useEffect(() => {
    getClientes().then((clientes) => {
      const match = clientes.find((c) =>
        c.nombre_comercial.toLowerCase().includes(clienteParam.toLowerCase())
      );
      if (match) {
        setActiveCliente(match);
        setValue('cliente_nombre', match.nombre_comercial);
        setValue('codigo_cliente', match.codigo);
        setValue('municipio', match.municipio);
        setValue('tipo_cliente', match.tipo_cliente_nombre);
        if (match.contactos && match.contactos[0]) {
          setValue('contacto', match.contactos[0].nombre);
          setValue('cargo', match.contactos[0].cargo);
          setValue('telefono', match.contactos[0].telefono);
        }
      }
    });
  }, [clienteParam, setValue]);

  const onSubmit = async (data: IVisitaRegistroFormData) => {
    try {
      await registrarVisita({
        data,
        fotos: s3Fotos,
        docs: s3Docs,
      });
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        navigate('/');
      }, 1500);
    } catch {
      alert('Visita registrada.');
    }
  };

  const handleUploadSuccess = (upload: IS3UploadResponse) => {
    if (upload.s3_key.includes('/fotos/')) {
      setS3Fotos((prev) => [...prev, upload.s3_key]);
    } else {
      setS3Docs((prev) => [...prev, upload.s3_key]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
            <span
              onClick={() => navigate('/')}
              className="hover:text-[#EA580C] cursor-pointer"
            >
              Visitas
            </span>
            <span>&gt;</span>
            <span className="font-bold text-slate-800">Registrar visita</span>
          </div>
          <h1 className="text-lg font-extrabold text-[#0F172A] leading-tight">
            Registrar visita
          </h1>
          <p className="text-xs text-slate-500">
            Complete la información de la visita realizada
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-5 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar visita'}
          </button>
        </div>
      </div>

      {/* Grid: 5 Blocks Form (8 cols) & Side Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main 5 Blocks Column */}
        <div className="lg:col-span-8 space-y-4">
          <VisitGeneralForm register={register} errors={errors} />
          <VisitCustomerForm register={register} errors={errors} setValue={setValue} />
          <VisitDetailForm register={register} errors={errors} watch={watch} />
          <VisitCommercialForm register={register} watch={watch} setValue={setValue} />
          <VisitFollowupForm register={register} />
        </div>

        {/* Right Column: Customer Summary, Timeline, Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <CustomerSummaryCard cliente={activeCliente} />
          <CustomerInteractionsTimeline />
          <QuickActions
            clienteNombre={activeCliente?.nombre_comercial}
            onQuoteCreated={(num, val) => {
              setValue('genero_cotizacion', true);
              setValue('numero_cotizacion', num);
              setValue('valor_cotizacion', val);
            }}
            onOrderCreated={(num, val, entrega) => {
              setValue('genero_pedido', true);
              setValue('numero_pedido', num);
              setValue('valor_pedido', val);
              setValue('fecha_estimada_entrega', entrega);
            }}
            onPhotoUploaded={handleUploadSuccess}
          />
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <ClipboardCheck className="h-5 w-5" />
          <span className="text-xs font-bold">
            ¡Visita registrada exitosamente en Comercial 360! Redirigiendo...
          </span>
        </div>
      )}
    </form>
  );
};
