import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Eye,
  Pencil,
  Play,
  Check,
  Upload,
  Download,
  AlertCircle,
} from 'lucide-react';
import { ICliente } from '../types/cliente';
import {
  getClientes,
  crearCliente,
  actualizarCliente,
  getCatalogosClientes,
  importarClientes,
  descargarPlantilla,
  type ImportSummary,
} from '../api/clientes';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import { useAuthStore } from '../store/useAuthStore';

interface ClienteForm {
  razon_social: string;
  nombre_comercial: string;
  nit: string;
  direccion: string;
  departamento: string;
  municipio: string;
  zona: string;
  tipo: string;
  potencial: string;
  telefono: string;
  email: string;
  contacto: string;
  cargo: string;
}

const EMPTY_FORM: ClienteForm = {
  razon_social: '',
  nombre_comercial: '',
  nit: '',
  direccion: '',
  departamento: '',
  municipio: '',
  zona: '',
  tipo: '',
  potencial: '',
  telefono: '',
  email: '',
  contacto: '',
  cargo: '',
};

const toForm = (c: ICliente): ClienteForm => ({
  razon_social: c.razon_social ?? '',
  nombre_comercial: c.nombre_comercial ?? '',
  nit: c.nit ?? '',
  direccion: c.direccion ?? '',
  departamento: c.departamento ?? '',
  municipio: c.municipio ?? '',
  zona: c.zona_nombre ?? '',
  tipo: c.tipo_cliente_nombre ?? '',
  potencial: c.potencial_nombre ?? '',
  telefono: c.telefono ?? '',
  email: c.email ?? '',
  contacto: c.contactos?.[0]?.nombre ?? '',
  cargo: c.contactos?.[0]?.cargo ?? '',
});

export const ClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [selectedCliente, setSelectedCliente] = useState<ICliente | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New Client form state
  const [form, setForm] = useState<ClienteForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [zona, setZona] = useState('Todas');
  const [municipio, setMunicipio] = useState('');
  const isDirector = useAuthStore((state) => state.user?.rol) !== 'ASESOR';
  const { data: catalogos } = useQuery({
    queryKey: ['clientes', 'catalogos'],
    queryFn: getCatalogosClientes,
  });
  const setField = (field: keyof ClienteForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);

  const fetchClientes = useCallback(() => {
    getClientes({ search, tipo, zona, municipio })
      .then((data) => setClientes(data))
      .catch(() => setClientes([]));
  }, [search, tipo, zona, municipio]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await descargarPlantilla();
      triggerBlobDownload(blob, 'plantilla_clientes.csv');
    } catch {
      setToastMessage('No se pudo descargar la plantilla.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setIsImporting(true);
    try {
      const res = await importarClientes(importFile);
      setImportResult(res);
      setToastMessage(
        `Importación completada: ${res.creados} creados, ${res.actualizados} actualizados.`,
      );
      setTimeout(() => setToastMessage(''), 4000);
      fetchClientes();
    } catch (err: any) {
      setToastMessage(
        'Error al importar: ' + (err.response?.data?.message || err.message),
      );
      setTimeout(() => setToastMessage(''), 4000);
    } finally {
      setIsImporting(false);
    }
  };

  const openNewClient = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setIsNewModalOpen(true);
  };

  const openEditClient = (cliente: ICliente) => {
    setEditingId(String(cliente.id_cliente));
    setForm(toForm(cliente));
    setFormError('');
    setIsNewModalOpen(true);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const required: Array<keyof ClienteForm> = [
      'razon_social',
      'nit',
      'direccion',
      'departamento',
      'municipio',
      'zona',
      'tipo',
      'potencial',
      'contacto',
    ];
    if (required.some((field) => !form[field].trim())) {
      setFormError('Completa los campos obligatorios (*).');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    const datos: Partial<ICliente> = {
      razon_social: form.razon_social.trim(),
      nombre_comercial:
        form.nombre_comercial.trim() || form.razon_social.trim(),
      nit: form.nit.trim(),
      direccion: form.direccion.trim(),
      departamento: form.departamento.trim(),
      municipio: form.municipio.trim(),
      zona_nombre: form.zona,
      tipo_cliente_nombre: form.tipo,
      potencial_nombre: form.potencial as ICliente['potencial_nombre'],
      telefono: form.telefono.trim() || undefined,
      email: form.email.trim() || undefined,
      contactos: [
        {
          id_contacto: '',
          nombre: form.contacto.trim(),
          cargo: form.cargo.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim(),
          principal: true,
        },
      ],
    };
    try {
      const saved = editingId
        ? await actualizarCliente(editingId, datos)
        : await crearCliente(datos);
      setIsNewModalOpen(false);
      setToastMessage(
        `Cliente ${saved.nombre_comercial} ${editingId ? 'actualizado' : 'registrado'} con éxito.`,
      );
      setTimeout(() => setToastMessage(''), 3000);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchClientes();
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response
        ?.status;
      setFormError(
        status === 409
          ? 'Ya existe otro cliente con ese NIT.'
          : status === 403
            ? 'Solo un director puede crear o editar clientes.'
            : 'No se pudo guardar el cliente. Revisa los datos.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">
            Directorio de Clientes
          </h1>
          <p className="text-xs text-slate-500">
            Administración centralizada de cuentas comerciales, contactos y
            georreferenciación.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold cursor-pointer shadow-xs transition-colors"
          >
            <Upload className="h-4 w-4 text-[#EA580C]" />
            Importar archivo
          </button>
          <button
            type="button"
            onClick={openNewClient}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por NIT, razón social, código o municipio..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los tipos</option>
            {catalogos?.tipos.map((t) => (
              <option key={t.id} value={t.nombre}>
                {t.nombre}
              </option>
            ))}
          </select>
          <select
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todas">Todas las zonas</option>
            {catalogos?.zonas.map((z) => (
              <option key={z.id} value={z.nombre}>
                {z.nombre}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            placeholder="Municipio"
            className="w-32 rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Cliente / Razón Social</th>
                <th className="py-2.5 px-3">NIT</th>
                <th className="py-2.5 px-3">Municipio</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Potencial</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3">Contacto Principal</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clientes
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((c) => (
                  <tr
                    key={c.id_cliente}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {c.codigo}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {c.nombre_comercial}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {c.nit}
                    </td>
                    <td className="py-2.5 px-3">{c.municipio}</td>
                    <td className="py-2.5 px-3">{c.tipo_cliente_nombre}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={c.potencial_nombre}>
                        {c.potencial_nombre}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={c.estado_cliente_nombre}>
                        {c.estado_cliente_nombre}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      {c.contactos && c.contactos[0] ? (
                        <div>
                          <p className="font-semibold text-slate-800">
                            {c.contactos[0].nombre}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {c.contactos[0].cargo}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Sin contacto</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCliente(c)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                          title="Ver ficha cliente"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {isDirector && (
                          <button
                            type="button"
                            onClick={() => openEditClient(c)}
                            className="p-1.5 text-slate-400 hover:text-[#EA580C] hover:bg-orange-50 rounded-md cursor-pointer transition-colors"
                            title="Editar cliente"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/visitas/registrar?cliente=${encodeURIComponent(
                                c.nombre_comercial,
                              )}&clienteId=${c.id_cliente}`,
                            )
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 hover:bg-[#EA580C] text-[#EA580C] hover:text-white rounded-md text-[11px] font-bold cursor-pointer transition-colors"
                          title="Iniciar visita"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          Visita
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={clientes.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Client Detail Modal */}
      {selectedCliente && (
        <Modal
          isOpen={!!selectedCliente}
          onClose={() => setSelectedCliente(null)}
          title={selectedCliente.nombre_comercial}
          description={`Código: ${selectedCliente.codigo} | NIT: ${selectedCliente.nit}`}
          maxWidth="md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCliente(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const name = selectedCliente.nombre_comercial;
                  setSelectedCliente(null);
                  navigate(
                    `/visitas/registrar?cliente=${encodeURIComponent(name)}`,
                  );
                }}
              >
                Iniciar Visita a este cliente
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="h-10 w-10 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  {selectedCliente.razon_social}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={selectedCliente.tipo_cliente_nombre}>
                    {selectedCliente.tipo_cliente_nombre}
                  </Badge>
                  <Badge variant={selectedCliente.potencial_nombre}>
                    Potencial {selectedCliente.potencial_nombre}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-[#EA580C]" />
                <span>
                  {selectedCliente.direccion}, {selectedCliente.municipio},{' '}
                  {selectedCliente.departamento}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-[#EA580C]" />
                <span>{selectedCliente.telefono}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-[#EA580C]" />
                <span>{selectedCliente.email}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* New Client Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title={
            editingId
              ? 'Editar cliente comercial'
              : 'Crear nuevo cliente comercial'
          }
          description={
            editingId
              ? 'Los cambios quedan registrados en el historial del cliente.'
              : 'Registre la cuenta para asignarle rutas, visitas y cotizaciones.'
          }
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateClient}
                isLoading={isSubmitting}
              >
                {editingId ? 'Guardar cambios' : 'Guardar cliente'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
            {formError && (
              <p className="rounded-lg bg-red-50 p-2 text-red-700">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Razón social *"
                placeholder="Ej. Distribuciones del Mar S.A.S"
                value={form.razon_social}
                onChange={(e) => setField('razon_social', e.target.value)}
                required
              />
              <Input
                label="Nombre comercial"
                placeholder="Si se omite, se usa la razón social"
                value={form.nombre_comercial}
                onChange={(e) => setField('nombre_comercial', e.target.value)}
              />
              <Input
                label="NIT o Cédula *"
                placeholder="Ej. 901.445.678-9"
                value={form.nit}
                onChange={(e) => setField('nit', e.target.value)}
                required
              />
              <Input
                label="Dirección física *"
                placeholder="Ej. Calle 72 # 54-20"
                value={form.direccion}
                onChange={(e) => setField('direccion', e.target.value)}
                required
              />
              <Input
                label="Departamento *"
                placeholder="Ej. Atlántico"
                value={form.departamento}
                onChange={(e) => setField('departamento', e.target.value)}
                required
              />
              <Input
                label="Municipio *"
                placeholder="Ej. Barranquilla"
                value={form.municipio}
                onChange={(e) => setField('municipio', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Zona *
                </label>
                <select
                  value={form.zona}
                  onChange={(e) => setField('zona', e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none"
                >
                  <option value="">Selecciona</option>
                  {catalogos?.zonas.map((item) => (
                    <option key={item.id} value={item.nombre}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Tipo de cliente *
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setField('tipo', e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none"
                >
                  <option value="">Selecciona</option>
                  {catalogos?.tipos.map((item) => (
                    <option key={item.id} value={item.nombre}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Potencial *
                </label>
                <select
                  value={form.potencial}
                  onChange={(e) => setField('potencial', e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none"
                >
                  <option value="">Selecciona</option>
                  {catalogos?.potenciales.map((item) => (
                    <option key={item.id} value={item.nombre}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="font-bold text-slate-800 mb-2">
                Contacto Principal
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Nombre del contacto *"
                  placeholder="Ej. Andrés Morales"
                  value={form.contacto}
                  onChange={(e) => setField('contacto', e.target.value)}
                  required
                />
                <Input
                  label="Cargo"
                  placeholder="Ej. Gerente de Operaciones"
                  value={form.cargo}
                  onChange={(e) => setField('cargo', e.target.value)}
                />
                <Input
                  label="Teléfono / Celular"
                  placeholder="Ej. 301 234 5678"
                  value={form.telefono}
                  onChange={(e) => setField('telefono', e.target.value)}
                />
                <Input
                  label="Correo Electrónico"
                  placeholder="Ej. contacto@empresa.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Import Modal (HU-06) */}
      {isImportModalOpen && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Importar Clientes desde Archivo (CSV / Excel)"
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">
                  Plantilla recomendada
                </p>
                <p className="text-slate-500 text-[11px]">
                  Descarga la estructura con las columnas esperadas y catálogos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar plantilla (.csv)
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Seleccionar archivo (.csv o .xlsx)
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#EA580C] hover:file:bg-orange-100 cursor-pointer border border-slate-300 rounded-lg p-1.5"
                />
              </div>

              {importResult && (
                <div className="space-y-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex gap-4 font-bold text-[11px]">
                    <span className="text-emerald-700">
                      ✓ Creados: {importResult.creados}
                    </span>
                    <span className="text-blue-700">
                      ↻ Actualizados: {importResult.actualizados}
                    </span>
                    <span className="text-red-700">
                      ✗ Errores: {importResult.errores.length}
                    </span>
                  </div>

                  {importResult.errores.length > 0 && (
                    <div className="max-h-36 overflow-y-auto space-y-1 pt-1 border-t border-slate-200">
                      <p className="font-bold text-slate-700 text-[11px]">
                        Detalle de errores por fila:
                      </p>
                      {importResult.errores.map((err, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 text-red-600 text-[11px]"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>
                            Fila {err.fila}: {err.motivo}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!importFile || isImporting}
                >
                  {isImporting
                    ? 'Procesando archivo...'
                    : 'Comenzar importación'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <Check className="h-5 w-5" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
