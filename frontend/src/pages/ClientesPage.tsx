import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Building2, Phone, Mail, MapPin, Eye, Play } from 'lucide-react';
import { ICliente } from '../types/cliente';
import { getClientes } from '../api/clientes';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

export const ClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [selectedCliente, setSelectedCliente] = useState<ICliente | null>(null);

  useEffect(() => {
    getClientes({ search, tipo }).then((data) => setClientes(data));
  }, [search, tipo]);

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">Directorio de Clientes</h1>
          <p className="text-xs text-slate-500">
            Administración centralizada de cuentas comerciales, contactos y georreferenciación.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Formulario de nuevo cliente habilitado')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </button>
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
            <option value="Industrial">Industrial</option>
            <option value="Distribuidor">Distribuidor</option>
            <option value="Retail">Retail</option>
          </select>
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
              {clientes.map((c) => (
                <tr key={c.id_cliente} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    {c.codigo}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {c.nombre_comercial}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{c.nit}</td>
                  <td className="py-2.5 px-3">{c.municipio}</td>
                  <td className="py-2.5 px-3">{c.tipo_cliente_nombre}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={c.potencial_nombre}>{c.potencial_nombre}</Badge>
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
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/visitas/registrar?cliente=${encodeURIComponent(
                              c.nombre_comercial
                            )}`
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
                  navigate(`/visitas/registrar?cliente=${encodeURIComponent(name)}`);
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
    </div>
  );
};
