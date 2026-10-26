import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { VisitGeneralForm } from '../components/visitas/VisitGeneralForm';
import { VisitCustomerForm } from '../components/visitas/VisitCustomerForm';
import { VisitDetailForm } from '../components/visitas/VisitDetailForm';
import { VisitCommercialForm } from '../components/visitas/VisitCommercialForm';
import { VisitFollowupForm } from '../components/visitas/VisitFollowupForm';
import { CustomerSummaryCard } from '../components/visitas/CustomerSummaryCard';
import { CustomerInteractionsTimeline } from '../components/visitas/CustomerInteractionsTimeline';
import { QuickActions } from '../components/visitas/QuickActions';
import { IVisitaRegistroFormData } from '../types/visita';
import { useQuery } from '@tanstack/react-query';
import { useVisitas } from '../hooks/useVisitas';
import { getVisita } from '../api/visitas';
import { useClientes } from '../hooks/useClientes';
import { useAuthStore } from '../store/useAuthStore';
import { ICliente } from '../types/cliente';
import { DIAS_SEMANA as DIAS, isoWeek } from '../lib/semana';
import { IS3UploadResponse } from '../api/storage';
import { visitaSchema } from '../lib/visita-schema';
import { notifyError, notifyFormErrors, notifySuccess } from '../lib/alerts';
import { toLocalIsoDate, toLocalTime } from '../lib/fecha';

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

export const VisitasPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registrarVisita, isSubmitting } = useVisitas();
  const { clientes } = useClientes();
  const user = useAuthStore((state) => state.user);
  const [s3Fotos, setS3Fotos] = useState<string[]>([]);
  const [s3Docs, setS3Docs] = useState<string[]>([]);

  // Read query params if arriving from "Iniciar visita"
  const searchParams = new URLSearchParams(location.search);
  const clienteParam = searchParams.get('cliente') || '';
  const clienteIdParam = searchParams.get('clienteId');
  const horaParam = searchParams.get('hora') || '';
  const visitaId = Number(searchParams.get('visita')) || undefined;
  const soloLectura = searchParams.get('modo') === 'ver';
  const visitaQuery = useQuery({
    queryKey: ['visits', 'detail', visitaId],
    queryFn: () => getVisita(visitaId!),
    enabled: Boolean(visitaId),
  });
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
      fecha_visita: toLocalIsoDate(hoy),
      // Starting a visit with no scheduled time: it starts now
      hora_inicio: horaParam || (soloLectura ? '' : toLocalTime(hoy)),
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

  const clienteIdVisita = visitaQuery.data
    ? String(visitaQuery.data.clientId)
    : null;
  const activeCliente = useMemo(
    () =>
      findCliente(
        clientes,
        clienteIdVisita ?? clienteIdParam,
        clienteNombre ?? '',
      ),
    [clientes, clienteIdVisita, clienteIdParam, clienteNombre],
  );

  // Week and weekday follow the visit date
  const fechaVisita = useWatch({ control, name: 'fecha_visita' });
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaVisita ?? '')) return;
    const fecha = new Date(`${fechaVisita}T12:00:00`);
    setValue('semana', isoWeek(fecha));
    setValue('dia', DIAS[fecha.getDay()]);
  }, [fechaVisita, setValue]);

  // HU-24: an existing visit opens with its stored data
  useEffect(() => {
    const visita = visitaQuery.data;
    if (!visita) return;
    setValue('fecha_visita', String(visita.scheduledDate).slice(0, 10));
    if (visita.startTime) setValue('hora_inicio', visita.startTime.slice(0, 5));
    if (visita.endTime)
      setValue('hora_fin', String(visita.endTime).slice(11, 16));
    if (visita.objective) setValue('objetivo_visita', visita.objective);
    if (visita.observation) setValue('observaciones', visita.observation);
    if (visita.visitStatus === 'RESCHEDULED')
      setValue('estado_visita', 'REPROGRAMADO');
    if (visita.visitStatus === 'CANCELLED')
      setValue('estado_visita', 'SIN_VISITAR');
  }, [visitaQuery.data, setValue]);

  useEffect(() => {
    const match = activeCliente;
    setValue('id_cliente', match ? String(match.id_cliente) : '');
    if (!match) return;
    if (!clienteNombre) setValue('cliente_nombre', match.nombre_comercial);
    setValue('codigo_cliente', match.codigo ?? '');
    setValue('municipio', match.municipio ?? '');
    setValue('tipo_cliente', match.tipo_cliente_nombre ?? '');
    if (match.contactos && match.contactos[0]) {
      setValue('contacto', match.contactos[0].nombre ?? '');
      setValue('cargo', match.contactos[0].cargo ?? '');
      setValue('telefono', match.contactos[0].telefono ?? '');
    }
  }, [activeCliente, clienteNombre, setValue]);

  const titulo = soloLectura
    ? 'Detalle de visita'
    : visitaId
      ? 'Registrar resultado de visita'
      : 'Registrar visita';

  // Lists every missing field in one alert instead of a red banner
  const onInvalid = (formErrors: FieldErrors<IVisitaRegistroFormData>) => {
    const messages = Object.values(formErrors)
      .map((fieldError) => fieldError?.message)
      .filter((message): message is string => Boolean(message));
    notifyFormErrors(
      messages.length ? messages : ['Revisa los campos marcados con *'],
    );
  };

  const onSubmit = async (data: IVisitaRegistroFormData) => {
    if (soloLectura) return;
    try {
      await registrarVisita({
        data,
        fotos: s3Fotos,
        docs: s3Docs,
        visitId: visitaId,
      });
      notifySuccess('Visita registrada', 'Volviendo al inicio…');
      navigate('/');
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      notifyError(
        'No se pudo guardar la visita',
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
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-5 pb-16"
    >
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
            <span className="font-bold text-slate-800">{titulo}</span>
          </div>
          <h1 className="text-lg font-extrabold text-[#0F172A] leading-tight">
            {titulo}
          </h1>
          <p className="text-xs text-slate-500">
            {soloLectura
              ? 'Consulta de la visita registrada'
              : 'Complete la información de la visita realizada'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
          >
            {soloLectura ? 'Volver' : 'Cancelar'}
          </button>
          {soloLectura ? (
            <button
              type="button"
              onClick={() =>
                navigate(`/visitas/registrar?visita=${visitaId}`, {
                  replace: true,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-5 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
            >
              Editar visita
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-5 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar visita'}
            </button>
          )}
        </div>
      </div>

      {visitaQuery.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          No se pudo cargar la visita: no existe o pertenece a otro asesor.
        </p>
      )}

      {/* Grid: 5 Blocks Form (8 cols) & Side Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main 5 Blocks Column */}
        <fieldset
          disabled={soloLectura}
          className="lg:col-span-8 space-y-4 min-w-0"
        >
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
        </fieldset>

        {/* Right Column: Customer Summary, Timeline, Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <CustomerSummaryCard cliente={activeCliente} />
          <CustomerInteractionsTimeline clienteId={activeCliente?.id_cliente} />
          {!soloLectura && (
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
          )}
        </div>
      </div>
    </form>
  );
};
