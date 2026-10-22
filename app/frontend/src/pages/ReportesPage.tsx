import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import { MOCK_SEGUIMIENTO_VISITAS, downloadCsvReport } from '../api/kpis';
import { MOCK_COTIZACIONES } from '../api/cotizaciones';
import { MOCK_PEDIDOS } from '../api/pedidos';
import { MOCK_CLIENTES } from '../api/clientes';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';

export const ReportesPage: React.FC = () => {
  const [tipoReporte, setTipoReporte] = useState<'visitas' | 'cotizaciones' | 'pedidos' | 'clientes'>('visitas');
  const [fechaDesde, setFechaDesde] = useState('2024-05-01');
  const [fechaHasta, setFechaHasta] = useState('2024-05-31');
  const [territorio, setTerritorio] = useState('Todos');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalRows =
    tipoReporte === 'visitas'
      ? MOCK_SEGUIMIENTO_VISITAS.length
      : tipoReporte === 'cotizaciones'
      ? MOCK_COTIZACIONES.length
      : tipoReporte === 'pedidos'
      ? MOCK_PEDIDOS.length
      : MOCK_CLIENTES.length;

  const handleDownloadReport = (format: 'csv' | 'excel') => {
    if (tipoReporte === 'visitas') {
      downloadCsvReport(territorio, '21');
    } else if (tipoReporte === 'cotizaciones') {
      const headers = ['Numero', 'Cliente', 'Fecha', 'Validez', 'Asesor', 'Valor', 'Estado'];
      const rows = MOCK_COTIZACIONES.map((c) => [
        c.numero,
        c.cliente_nombre,
        c.fecha,
        c.validez,
        c.asesor_nombre,
        c.valor,
        c.estado,
      ]);
      const csvContent =
        '\uFEFF' +
        [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Cotizaciones_Comercial360.${format === 'excel' ? 'csv' : 'csv'}`;
      link.click();
    } else if (tipoReporte === 'pedidos') {
      const headers = ['Numero', 'Cliente', 'Fecha', 'Fecha_Entrega', 'Asesor', 'Valor', 'Estado'];
      const rows = MOCK_PEDIDOS.map((p) => [
        p.numero,
        p.cliente_nombre,
        p.fecha,
        p.fecha_entrega,
        p.asesor_nombre,
        p.valor,
        p.estado,
      ]);
      const csvContent =
        '\uFEFF' +
        [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Pedidos_Comercial360.${format === 'excel' ? 'csv' : 'csv'}`;
      link.click();
    } else {
      const headers = ['Codigo', 'Cliente', 'NIT', 'Municipio', 'Direccion', 'Tipo', 'Potencial'];
      const rows = MOCK_CLIENTES.map((c) => [
        c.codigo,
        c.nombre_comercial,
        c.nit,
        c.municipio,
        c.direccion,
        c.tipo_cliente_nombre,
        c.potencial_nombre,
      ]);
      const csvContent =
        '\uFEFF' +
        [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Directorio_Clientes_Comercial360.${format === 'excel' ? 'csv' : 'csv'}`;
      link.click();
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-[#0F172A]">Centro de Reportes y Exportación</h1>
          <p className="text-xs text-slate-500">
            Descargue bitácoras de campo, consolidados de ventas y carteras en formato CSV y Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownloadReport('csv')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
          >
            <Download className="h-4 w-4" />
            Descargar CSV
          </button>
          <button
            type="button"
            onClick={() => handleDownloadReport('excel')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D9480F] text-white px-4 py-2 text-xs font-bold cursor-pointer shadow-sm transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setTipoReporte('visitas');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            tipoReporte === 'visitas'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          1. Visitas y Seguimiento de Campo
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoReporte('cotizaciones');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            tipoReporte === 'cotizaciones'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          2. Cotizaciones Emitidas
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoReporte('pedidos');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            tipoReporte === 'pedidos'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          3. Pedidos Comerciales
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoReporte('clientes');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            tipoReporte === 'clientes'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          4. Directorio de Clientes
        </button>
      </div>

      {/* Date & Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-semibold">Desde:</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1 px-2 text-slate-800"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-semibold">Hasta:</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1 px-2 text-slate-800"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-semibold">Territorio:</span>
          <select
            value={territorio}
            onChange={(e) => setTerritorio(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1 px-2 text-slate-800"
          >
            <option value="Todos">Todos</option>
            <option value="NORTE">Atlántico Norte</option>
            <option value="SUR">Atlántico Sur</option>
            <option value="CENTRO">Atlántico Centro</option>
          </select>
        </div>
      </div>

      {/* Live Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs">
            Vista previa de los datos a exportar
          </span>
          <span className="text-[11px] text-slate-500">
            Formato UTF-8 compatible con Microsoft Excel
          </span>
        </div>

        <div className="overflow-x-auto">
          {tipoReporte === 'visitas' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Asesor</th>
                  <th className="py-2.5 px-3">Territorio</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3">Cotización</th>
                  <th className="py-2.5 px-3">Pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {MOCK_SEGUIMIENTO_VISITAS.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono">{f.fecha}</td>
                    <td className="py-2 px-3 font-bold">{f.cliente}</td>
                    <td className="py-2 px-3">{f.asesor}</td>
                    <td className="py-2 px-3">{f.territorio}</td>
                    <td className="py-2 px-3">
                      <Badge variant={f.estado_visita}>{f.estado_visita}</Badge>
                    </td>
                    <td className="py-2 px-3 font-mono">{f.cotizacion}</td>
                    <td className="py-2 px-3 font-mono">{f.pedido}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tipoReporte === 'cotizaciones' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Número</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Vigencia</th>
                  <th className="py-2.5 px-3">Valor (COP)</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {MOCK_COTIZACIONES.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((c) => (
                  <tr key={c.numero} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-[#EA580C]">{c.numero}</td>
                    <td className="py-2 px-3 font-bold">{c.cliente_nombre}</td>
                    <td className="py-2 px-3 font-mono">{c.fecha}</td>
                    <td className="py-2 px-3 font-mono">{c.validez}</td>
                    <td className="py-2 px-3 font-mono font-bold">$ {c.valor.toLocaleString('es-CO')}</td>
                    <td className="py-2 px-3">
                      <span className="font-bold text-[10px]">{c.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tipoReporte === 'pedidos' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Número</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Entrega Prometida</th>
                  <th className="py-2.5 px-3">Valor (COP)</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {MOCK_PEDIDOS.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((p) => (
                  <tr key={p.numero} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-600">{p.numero}</td>
                    <td className="py-2 px-3 font-bold">{p.cliente_nombre}</td>
                    <td className="py-2 px-3 font-mono">{p.fecha}</td>
                    <td className="py-2 px-3 font-mono">{p.fecha_entrega}</td>
                    <td className="py-2 px-3 font-mono font-bold">$ {p.valor.toLocaleString('es-CO')}</td>
                    <td className="py-2 px-3">
                      <span className="font-bold text-[10px]">{p.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tipoReporte === 'clientes' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">NIT</th>
                  <th className="py-2.5 px-3">Municipio</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Potencial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {MOCK_CLIENTES.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((cl) => (
                  <tr key={cl.codigo} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold">{cl.codigo}</td>
                    <td className="py-2 px-3 font-bold">{cl.nombre_comercial}</td>
                    <td className="py-2 px-3 font-mono">{cl.nit}</td>
                    <td className="py-2 px-3">{cl.municipio}</td>
                    <td className="py-2 px-3">{cl.tipo_cliente_nombre}</td>
                    <td className="py-2 px-3">
                      <Badge variant={cl.potencial_nombre}>{cl.potencial_nombre}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalRows}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="h-5 w-5" />
          <span className="text-xs font-bold">¡Reporte generado y descargado exitosamente!</span>
        </div>
      )}
    </div>
  );
};
