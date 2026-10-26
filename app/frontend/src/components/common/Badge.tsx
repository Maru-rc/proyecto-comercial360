import React from 'react';

export type BadgeVariant =
  | 'visitado'
  | 'pendiente'
  | 'reprogramado'
  | 'sin_visitar'
  | 'pedido_cerrado'
  | 'activo'
  | 'inactivo'
  | 'alto'
  | 'medio'
  | 'bajo'
  | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant | string;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  icon,
}) => {
  const normalized = (variant || '').toLowerCase().replace(/\s+/g, '_');

  let variantStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  // "sin_visitar"/"not_visited" also contain "visit": checked first so they
  // are gray, not green
  if (
    normalized.includes('sin_visitar') ||
    normalized.includes('not_visited')
  ) {
    variantStyles = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (
    normalized.includes('visit') ||
    normalized === 'activo' ||
    normalized === 'active'
  ) {
    variantStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (
    normalized.includes('pend') ||
    normalized === 'scheduled' ||
    normalized === 'programada'
  ) {
    variantStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (
    normalized.includes('reprogramado') ||
    normalized.includes('rescheduled')
  ) {
    variantStyles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (
    normalized.includes('sin_visitar') ||
    normalized.includes('not_visited') ||
    normalized.includes('cancelled') ||
    normalized.includes('cancelada')
  ) {
    variantStyles = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (
    normalized.includes('pedido') ||
    normalized.includes('order') ||
    normalized.includes('cerrado') ||
    normalized.includes('closed')
  ) {
    variantStyles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (normalized === 'alto' || normalized === 'high') {
    variantStyles = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (normalized === 'medio' || normalized === 'medium') {
    variantStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'bajo' || normalized === 'low') {
    variantStyles = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles} ${className}`}
    >
      {icon && <span className="inline-block">{icon}</span>}
      {children}
    </span>
  );
};
