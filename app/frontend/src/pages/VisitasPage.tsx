import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
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
import { useClientes } from '../hooks/useClientes';
import { useAuthStore } from '../store/useAuthStore';
import { ICliente } from '../types/cliente';
import { IS3UploadResponse } from '../api/storage';

const DIAS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

/** ISO-8601 week number of a date. */
const isoWeek = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const findCliente = (
  clientes: ICliente[],
  id: string | null,
  nombre: string,
): ICliente | undefined => {
  if (id) return clientes.find((c) => String(c.id_cliente) === id);
  const q = nombre.trim().toLowerCase();
  if (!q) return undefined;
  const exact = clientes.find((c) => c.nombre_comercial.toLowerCase() === q);
  if (exact) return exact;
  const partial = clientes.filter((c) =>
    c.nombre_comercial.toLowerCase().includes(q),
  );
  return partial.length === 1 ? partial[0] : undefined;
};

const visitaSchema = z.object({
  fecha_visita: z.string().min(1, 'La fecha es obligatoria'),
  hora_inicio: z.string().min(1, 'Hora de inicio requerida'),
  hora_fin: z.string().min(1, 'Hora de fin requerida'),
  id_ruta: z.string().default(''),
  territorio: z.string().default(''),
  semana: z.number().min(1),
  dia: z.string().min(1),
  asesor_nombre: z.string().min(1),

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
  estado_visita: z.enum([
    'VISITADO',
    'PENDIENTE',
    'SIN_VISITAR',
    'PEDIDO_CERRADO',
    'REPROGRAMADO',
    'PROGRAMADA',
  ]),
  resultado_visita: z.enum([
    'Interesado',
    'Pedido',
    'Programada',
    'No visitado',
    'Cotización enviada',
    'No interesado',
  ]),
  interes_productos: z.string().default(''),
  modulo_interes: z.string().default(''),
  competencia_mencionada: z.string().default(''),
  observaciones: z.string().max(500),

  genero_cotizacion: z.boolean().default(false),
  numero_cotizacion: z.string().optional(),
  valor_cotizacion: z.number().optional(),
  moneda: z.string().default('COP'),

  genero_pedido: z.boolean().default(false),
  numero_pedido: z.string().optional(),
  valor_pedido: z.number().optional(),
  fecha_estimada_entrega: z.string().optional(),

  fecha_proxima_visita: z
    .string()
    .min(1, 'Fecha de próximo seguimiento requerida'),
  hora_proxima_visita: z.string().optional(),
  objetivo_proximo_seguimiento: z.string().optional(),
  responsable_seguimiento: z.string().optional(),
});

export const VisitasPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registrarVisita, isSubmitting } = useVisitas();
  const { clientes } = useClientes();
  const user = useAuthStore((state) => state.user);
  const [s3Fotos, setS3Fotos] = useState<string[]>([]);
  const [s3Docs, setS3Docs] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Read query params if arriving from "Iniciar visita"
  const searchParams = new URLSearchParams(location.search);
  const clienteParam = searchParams.get('cliente') || '';
  const clienteIdParam = searchParams.get('clienteId');
  const horaParam = searchParams.get('hora') || '';
  const visitaId = Number(searchParams.get('visita')) || undefined;
  const [hoy] = useState(() => new Date());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<IVisitaRegistroFormData>({
    resolver: zodResolver(visitaSchema) as any,
    defaultValues: {
      fecha_visita: hoy.toISOString().slice(0, 10),
      hora_inicio: horaParam,
      hora_fin: '',
      id_ruta: '',
      territorio: user?.territorio ?? '',
      semana: isoWeek(hoy),
      dia: DIAS[hoy.getDay()],
      asesor_nombre: user?.nombre ?? '',

      id_cliente: '',
      cliente_nombre: clienteParam,
      codigo_cliente: '',
      tipo_cliente: '',
      municipio: '',
      contacto: '',
      telefono: '',
      cargo: '',
      canal_contacto: 'Presencial',

      objetivo_visita: '',
      tipo_visita: '',
      potencial_cliente: '',
      estado_visita: 'VISITADO',
      resultado_visita: 'Interesado',
      interes_productos: '',
      modulo_interes: '',
      competencia_mencionada: '',
      observaciones: '',

      genero_cotizacion: false,
      moneda: 'COP',

      genero_pedido: false,

      fecha_proxima_visita: '',
      responsable_seguimiento: user?.nombre ?? '',
    },
  });

  const clienteNombre = useWatch({ control, name: 'cliente_nombre' });

  const activeCliente = useMemo(
    () => findCliente(clientes, clienteIdParam, clienteNombre ?? ''),
    [clientes, clienteIdParam, clienteNombre],
  );

  useEffect(() => {
    const match = activeCliente;
    setValue('id_cliente', match ? String(match.id_cliente) : '');
    if (!match) return;
    setValue('codigo_cliente', match.codigo);
    setValue('municipio', match.municipio);
    setValue('tipo_cliente', match.tipo_cliente_nombre);
    if (match.contactos && match.contactos[0]) {
      setValue('contacto', match.contactos[0].nombre);
      setValue('cargo', match.contactos[0].cargo);
      setValue('telefono', match.contactos[0].telefono);
    }
  }, [activeCliente, setValue]);

  const onSubmit = async (data: IVisitaRegistroFormData) => {
    setSubmitError('');
    try {
      await registrarVisita({
        data,
        fotos: s3Fotos,
        docs: s3Docs,
        visitId: visitaId,
      });
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        navigate('/');
      }, 1500);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      setSubmitError(
        status === 409
          ? 'El número de cotización o pedido ya existe. Genera uno nuevo.'
          : status === 403
            ? 'No tienes permiso para registrar esta visita.'
            : 'No se pudo registrar la visita. Revisa los datos e intenta de nuevo.',
      );
    }
  };

  const handleUploadSuccess = (upload: IS3UploadResponse) => {
    if (/\.(jpe?g|png|webp)$/i.test(upload.s3_key)) {
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

      {(submitError || errors.id_cliente) && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {submitError || errors.id_cliente?.message}
        </p>
      )}

      {/* Grid: 5 Blocks Form (8 cols) & Side Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main 5 Blocks Column */}
        <div className="lg:col-span-8 space-y-4">
          <VisitGeneralForm register={register} errors={errors} />
          <VisitCustomerForm
            register={register}
            errors={errors}
            setValue={setValue}
          />
          <VisitDetailForm register={register} errors={errors} watch={watch} />
          <VisitCommercialForm
            register={register}
            watch={watch}
            setValue={setValue}
          />
          <VisitFollowupForm register={register} />
        </div>

        {/* Right Column: Customer Summary, Timeline, Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <CustomerSummaryCard cliente={activeCliente} />
          <CustomerInteractionsTimeline clienteId={activeCliente?.id_cliente} />
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
