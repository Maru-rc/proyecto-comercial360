import React from 'react';
import { Link } from 'react-router-dom';

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/** Centered card shared by the public password-recovery screens. */
export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  description,
  children,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-bold text-[#EA580C] uppercase tracking-wider">
          Comercial 360
        </p>
        <h1 className="text-lg font-extrabold text-[#0F172A]">{title}</h1>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      {children}
      <Link
        to="/login"
        className="block text-center text-xs font-semibold text-[#EA580C] hover:underline"
      >
        Volver a iniciar sesión
      </Link>
    </div>
  </div>
);
