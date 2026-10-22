import React, { useState } from 'react';
import {
  FileText,
  ShoppingCart,
  Calendar,
  Camera,
  Paperclip,
} from 'lucide-react';
import { PhotoUploadModal } from './PhotoUploadModal';
import { QuoteModal } from './QuoteModal';
import { OrderModal } from './OrderModal';
import { IS3UploadResponse } from '../../api/storage';

interface QuickActionsProps {
  onQuoteCreated?: (numero: string, valor: number) => void;
  onOrderCreated?: (numero: string, valor: number, fechaEntrega: string) => void;
  onPhotoUploaded?: (upload: IS3UploadResponse) => void;
  clienteNombre?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onQuoteCreated,
  onOrderCreated,
  onPhotoUploaded,
  clienteNombre = 'Metalúrgicas S.A.S.',
}) => {
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
      <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-slate-100 pb-2">
        Acciones rápidas
      </h4>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setQuoteModalOpen(true)}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-200/90 hover:border-[#EA580C] hover:bg-orange-50/20 text-slate-700 hover:text-[#EA580C] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
        >
          <FileText className="h-4 w-4 text-slate-500" />
          <span>Generar cotización</span>
        </button>

        <button
          type="button"
          onClick={() => setOrderModalOpen(true)}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-200/90 hover:border-[#EA580C] hover:bg-orange-50/20 text-slate-700 hover:text-[#EA580C] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
        >
          <ShoppingCart className="h-4 w-4 text-slate-500" />
          <span>Crear pedido</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('fecha_proxima_visita');
            el?.focus();
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-200/90 hover:border-[#EA580C] hover:bg-orange-50/20 text-slate-700 hover:text-[#EA580C] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
        >
          <Calendar className="h-4 w-4 text-slate-500" />
          <span>Programar próxima visita</span>
        </button>

        <button
          type="button"
          onClick={() => setPhotoModalOpen(true)}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-200/90 hover:border-[#EA580C] hover:bg-orange-50/20 text-slate-700 hover:text-[#EA580C] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
        >
          <Camera className="h-4 w-4 text-slate-500" />
          <span>Tomar foto</span>
        </button>

        <button
          type="button"
          onClick={() => setDocModalOpen(true)}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-200/90 hover:border-[#EA580C] hover:bg-orange-50/20 text-slate-700 hover:text-[#EA580C] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
        >
          <Paperclip className="h-4 w-4 text-slate-500" />
          <span>Adjuntar documento</span>
        </button>
      </div>

      {/* Modals */}
      <PhotoUploadModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        onUploadSuccess={(upload) => {
          onPhotoUploaded?.(upload);
        }}
        mode="photo"
      />

      <PhotoUploadModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        onUploadSuccess={(upload) => {
          onPhotoUploaded?.(upload);
        }}
        mode="document"
      />

      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        onSuccess={(num, val) => {
          onQuoteCreated?.(num, val);
        }}
        clienteNombre={clienteNombre}
      />

      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onSuccess={(num, val, entrega) => {
          onOrderCreated?.(num, val, entrega);
        }}
        clienteNombre={clienteNombre}
      />
    </div>
  );
};
