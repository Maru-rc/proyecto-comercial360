import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { generarNumeroDocumento } from '../../api/document-number';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (numCotizacion: string, valor: number) => void;
  clienteNombre?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clienteNombre = 'Cliente sin seleccionar',
}) => {
  const [numero, setNumero] = useState(() => generarNumeroDocumento('COT'));
  const [valor, setValor] = useState('');
  const [producto, setProducto] = useState('');

  // The quotation is persisted together with the visit (HU-13, one transaction)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = parseFloat(valor);
    if (!numero.trim() || !(numVal > 0)) return;
    onSuccess(numero.trim(), numVal);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar cotización"
      description={`Cliente destinatario: ${clienteNombre}. Se emite al guardar la visita.`}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Confirmar y emitir
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label="Número de cotización"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          required
        />
        <Input
          label="Valor estimado (COP)"
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Descripción de productos / servicios
          </label>
          <textarea
            rows={2}
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:border-[#EA580C] focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
};
