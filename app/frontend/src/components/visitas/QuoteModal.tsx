import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { crearCotizacion } from '../../api/visitas';

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
  clienteNombre = 'Metalúrgicas S.A.S.',
}) => {
  const [numero, setNumero] = useState(() => `COT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [valor, setValor] = useState('24800000');
  const [producto, setProducto] = useState('Equipos de soldadura industrial y consumibles');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const numVal = parseFloat(valor) || 24800000;
      await crearCotizacion({
        numero,
        valor: numVal,
      });
      onSuccess(numero, numVal);
      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar cotización"
      description={`Cliente destinatario: ${clienteNombre}`}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
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
