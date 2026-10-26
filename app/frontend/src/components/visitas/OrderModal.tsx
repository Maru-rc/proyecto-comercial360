import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { generarNumeroDocumento } from '../../api/document-number';

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
  clienteNombre = 'Cliente sin seleccionar',
}) => {
  const [numero, setNumero] = useState(() => generarNumeroDocumento('PED'));
  const [valor, setValor] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');

  // The order is persisted together with the visit (HU-13, one transaction)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = parseFloat(valor);
    if (!numero.trim() || !(numVal > 0)) return;
    onSuccess(numero.trim(), numVal, fechaEntrega);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear pedido confirmado"
      description={`Cliente: ${clienteNombre}. Se registra al guardar la visita y actualiza los KPIs de pedidos cerrados.`}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
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
