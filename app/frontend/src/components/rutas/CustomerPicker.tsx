import React, { useState, useEffect } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { ICliente } from '../../types/cliente';
import { getClientes } from '../../api/clientes';
import { useRouteDraftStore } from '../../store/useRouteDraftStore';

export const CustomerPicker: React.FC = () => {
  const { agregarCliente, paradas } = useRouteDraftStore();
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [municipio, setMunicipio] = useState('Todos');

  useEffect(() => {
    getClientes({ search, tipo, municipio }).then((data) => {
      setClientes(data);
    });
  }, [search, tipo, municipio]);

  const addedIds = new Set(paradas.map((p) => p.id_cliente));

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3.5">
      <h3 className="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-2">
        Buscar y agregar clientes
      </h3>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente por nombre o código..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
        />
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">
            Tipo de cliente
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-1.5 text-xs text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos</option>
            <option value="Industrial">Industrial</option>
            <option value="Distribuidor">Distribuidor</option>
            <option value="Retail">Retail</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">
            Municipio
          </label>
          <select
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-1.5 text-xs text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos</option>
            <option value="Barranquilla">Barranquilla</option>
            <option value="Soledad">Soledad</option>
            <option value="Malambo">Malambo</option>
            <option value="Galapa">Galapa</option>
          </select>
        </div>
      </div>

      {/* Results list */}
      <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
        {clientes.map((cli) => {
          const isAdded = addedIds.has(cli.id_cliente);
          return (
            <div
              key={cli.id_cliente}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                isAdded
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
              }`}
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {cli.nombre_comercial}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {cli.tipo_cliente_nombre} • {cli.municipio}
                </p>
              </div>

              <button
                type="button"
                disabled={isAdded}
                onClick={() => agregarCliente(cli)}
                className={`p-1.5 rounded-lg border cursor-pointer transition-colors shrink-0 ${
                  isAdded
                    ? 'border-emerald-300 text-emerald-600 bg-white cursor-default'
                    : 'border-slate-300 hover:border-[#EA580C] hover:text-[#EA580C] hover:bg-white text-slate-600'
                }`}
                title={isAdded ? 'Cliente ya agregado' : 'Agregar a la ruta'}
              >
                {isAdded ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
