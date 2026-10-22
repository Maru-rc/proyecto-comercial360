import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { crearPedido } from '../../api/visitas';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (numPedido: string, valor: number, fechaEntrega: string) => void;
  clienteNombre?: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clienteNombre = 'Metalúrgicas S.A.S.',
}) => {
  const [numero, setNumero] = useState(() => `PED-${Math.floor(100 + Math.random() * 900)}`);
  const [valor, setValor] = useState('18500000');
  const [fechaEntrega, setFechaEntrega] = useState('2024-05-30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const numVal = parseFloat(valor) || 18500000;
      await crearPedido({
        numero,
        valor: numVal,
        fecha_entrega: fechaEntrega,
      });
      onSuccess(numero, numVal, fechaEntrega);
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
      title="Crear pedido confirmado"
      description={`Cliente: ${clienteNombre}. Esta acción actualiza los KPIs de pedidos cerrados.`}
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
            Confirmar pedido
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label="Número de pedido"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          required
        />
        <Input
          label="Valor del pedido (COP)"
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
        <Input
          label="Fecha estimada de entrega"
          type="date"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
};
