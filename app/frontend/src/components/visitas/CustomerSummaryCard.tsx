import React from 'react';
import { Building2 } from 'lucide-react';
import { ICliente } from '../../types/cliente';

interface CustomerSummaryCardProps {
  cliente?: ICliente;
}

export const CustomerSummaryCard: React.FC<CustomerSummaryCardProps> = ({ cliente }) => {
  const nombre = cliente?.nombre_comercial || 'Metalúrgicas S.A.S.';
  const codigo = cliente?.codigo || 'CJI-001245';
  const municipio = cliente?.municipio || 'Barranquilla';
  const departamento = cliente?.departamento || 'Atlántico';
  const tipo = cliente?.tipo_cliente_nombre || 'Industrial';
  const potencial = cliente?.potencial_nombre || 'Alto';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
        <span>Resumen del cliente</span>
      </div>

      <div className="flex items-start gap-3.5 pt-1">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-xs">
          <Building2 className="h-6 w-6 text-slate-200" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-[#0F172A] truncate">{nombre}</h4>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Cliente activo
          </span>

          <div className="mt-2 space-y-0.5 text-xs text-slate-600">
            <p>
              <span className="font-semibold text-slate-700">Código:</span> {codigo}
            </p>
            <p>{municipio}, {departamento}</p>
            <p className="text-[11px] text-slate-500">
              Tipo: <span className="font-semibold text-slate-700">{tipo}</span> | Potencial:{' '}
              <span className="font-bold text-[#EA580C]">{potencial}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
