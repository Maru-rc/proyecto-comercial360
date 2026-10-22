import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit3 } from 'lucide-react';
import { IParadaRuta } from '../../types/ruta';
import { useRouteDraftStore } from '../../store/useRouteDraftStore';

interface SortableRowProps {
  parada: IParadaRuta;
  onDelete: (id: string) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({ parada, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: parada.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const getBadgeColor = (orden: number) => {
    const colors = [
      'bg-[#16A34A]', // 1 Green
      'bg-[#16A34A]', // 2 Green
      'bg-[#2563EB]', // 3 Blue
      'bg-[#16A34A]', // 4 Green
      'bg-[#EA580C]', // 5 Orange
      'bg-[#2563EB]', // 6 Blue
      'bg-[#7C3AED]', // 7 Purple
    ];
    return colors[(orden - 1) % colors.length] || 'bg-slate-700';
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
        isDragging ? 'bg-orange-50/60 shadow-md' : 'bg-white'
      }`}
    >
      {/* Drag handle */}
      <td className="py-2.5 px-2 text-center w-8">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>

      {/* Orden Badge */}
      <td className="py-2.5 px-2 text-center w-10">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${getBadgeColor(
            parada.orden
          )}`}
        >
          {parada.orden}
        </span>
      </td>

      {/* Cliente */}
      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
        {parada.cliente.nombre_comercial}
      </td>

      {/* Tipo cliente */}
      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
        {parada.cliente.tipo_cliente_nombre}
      </td>

      {/* Dirección */}
      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-[11px]">
        {parada.cliente.direccion}
      </td>

      {/* Municipio */}
      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap font-medium">
        {parada.cliente.municipio}
      </td>

      {/* Hora sugerida */}
      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap font-semibold">
        {parada.hora_sugerida}
      </td>

      {/* Acciones */}
      <td className="py-2.5 px-3 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
            title="Editar parada"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(parada.id)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
            title="Eliminar de la ruta"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const SortableStopTable: React.FC = () => {
  const { paradas, reordenarParadas, eliminarParada } = useRouteDraftStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = paradas.findIndex((p) => p.id === active.id);
      const newIndex = paradas.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(paradas, oldIndex, newIndex);
      reordenarParadas(reordered);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-2 text-center w-8"></th>
              <th className="py-2.5 px-2 text-center w-10">Orden</th>
              <th className="py-2.5 px-3">Cliente</th>
              <th className="py-2.5 px-3">Tipo cliente</th>
              <th className="py-2.5 px-3">Dirección</th>
              <th className="py-2.5 px-3">Municipio</th>
              <th className="py-2.5 px-3">Hora sugerida</th>
              <th className="py-2.5 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={paradas.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {paradas.map((parada) => (
                  <SortableRow
                    key={parada.id}
                    parada={parada}
                    onDelete={eliminarParada}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {paradas.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No hay paradas en esta ruta. Usa el buscador lateral para agregar clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
