import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Headphones,
  MapPin,
  Users,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginMicrosoft, isLoading } = useAuthStore();
  const [email, setEmail] = useState('juan.perez@comercial360.com');
  const [password, setPassword] = useState('••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ email, password, rememberMe });
    if (success) {
      navigate('/');
    }
  };

  const handleMicrosoftLogin = async () => {
    const success = await loginMicrosoft();
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F8FAFC]">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side: Brand & Visual Showcase */}
        <div className="lg:w-1/2 bg-[#0B1527] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-end gap-1 h-8">
                <span className="w-2 h-4 bg-[#EA580C] rounded-sm"></span>
                <span className="w-2 h-7 bg-[#EA580C] rounded-sm"></span>
                <span className="w-2 h-3 bg-white rounded-sm"></span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Comercial <span className="text-[#EA580C]">360</span>
              </span>
            </div>

            <div className="w-12 h-1 bg-[#EA580C] mt-6 mb-4 rounded-full"></div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-md">
              Plataforma de Gestión Comercial
            </h1>
            <p className="mt-3 text-sm text-slate-300 max-w-md leading-relaxed">
              Administra tus rutas, visitas y clientes de manera eficiente y en tiempo real.
            </p>
          </div>

          {/* Center Visual Mockup of Van and Phone Route */}
          <div className="relative my-8 flex items-center justify-center">
            {/* Phone Route Mockup Card */}
            <div className="relative z-10 w-72 rounded-3xl bg-[#0F172A] p-3 shadow-2xl border-4 border-slate-700/60">
              <div className="flex items-center justify-between text-white text-[11px] px-3 py-1 border-b border-slate-700/60">
                <span className="font-semibold">≡ Ruta del día</span>
                <span className="text-slate-400">✧</span>
              </div>

              {/* Map simulation on phone */}
              <div className="relative h-44 rounded-xl bg-slate-800/80 my-2 overflow-hidden border border-slate-700 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px]" />

                {/* SVG Route lines and numbered dots */}
                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d="M 60 70 L 130 35 L 180 65 L 170 120 L 70 110 Z"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                  />
                </svg>

                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  1
                </div>
                <div className="absolute top-12 left-10 w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  2
                </div>
                <div className="absolute top-12 right-10 w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  3
                </div>
                <div className="absolute bottom-6 left-12 w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  4
                </div>
                <div className="absolute bottom-6 right-16 w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  5
                </div>
              </div>

              {/* Next visit floating box */}
              <div className="bg-white rounded-xl p-2.5 text-slate-900 shadow-md">
                <span className="text-[9px] font-bold uppercase text-[#EA580C]">
                  Próxima visita
                </span>
                <p className="text-xs font-extrabold text-slate-900">
                  Metalúrgicas S.A.S
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>📍 Cra 45 # 30 - 15</span>
                  <span>⏱ 10:30 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 4 Feature Circles */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-center">
            <div className="flex flex-col items-center space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-[#EA580C]">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white">Rutas</span>
              <span className="text-[10px] text-slate-400">Optimizadas</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-[#EA580C]">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white">Clientes</span>
              <span className="text-[10px] text-slate-400">Gestionados</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-[#EA580C]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white">Resultados</span>
              <span className="text-[10px] text-slate-400">en tiempo real</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-[#EA580C]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white">Información</span>
              <span className="text-[10px] text-slate-400">segura</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
            {/* Top orange padlock badge */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-[#EA580C] mb-3">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Iniciar sesión
              </h2>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Ingresa con tu correo corporativo para acceder a la plataforma
              </p>
            </div>

            {/* Microsoft 365 OAuth Button */}
            <div className="space-y-3">
              <p className="text-center text-[11px] text-slate-400 font-medium">
                o continúa con
              </p>
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border-2 border-[#EA580C]/80 hover:border-[#EA580C] hover:bg-orange-50/20 text-slate-800 transition-colors cursor-pointer group shadow-xs"
              >
                {/* Official 4-squares Microsoft logo */}
                <div className="grid grid-cols-2 gap-0.5 shrink-0">
                  <div className="w-2 h-2 bg-[#F25022]"></div>
                  <div className="w-2 h-2 bg-[#7FBA00]"></div>
                  <div className="w-2 h-2 bg-[#00A4EF]"></div>
                  <div className="w-2 h-2 bg-[#FFB900]"></div>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#EA580C] leading-tight">
                    Iniciar sesión con Microsoft
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Usa tu cuenta corporativa de Microsoft 365
                  </p>
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200"></div>
              <span className="absolute bg-white px-3 text-[11px] text-slate-400 font-medium">
                o inicia sesión con tu cuenta
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tussuario@empresa.com"
                    required
                    className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                    className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-9 text-xs text-slate-900 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#EA580C] focus:ring-[#EA580C] accent-[#EA580C]"
                  />
                  <span className="text-slate-700 font-medium">Recordarme</span>
                </label>
                <a
                  href="#olvide"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Por favor contacte a su administrador de TI.');
                  }}
                  className="font-semibold text-[#EA580C] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-[#EA580C] hover:bg-[#D9480F] py-2.5 px-4 text-sm font-bold text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            {/* Support footer */}
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 text-slate-400" />
                ¿Necesitas ayuda?{' '}
                <a href="#contacto" className="font-bold text-[#EA580C] hover:underline">
                  Contáctanos
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Page Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2024 Comercial 360. Todos los derechos reservados. |{' '}
        <a href="#privacidad" className="hover:underline">
          Política de privacidad
        </a>{' '}
        |{' '}
        <a href="#terminos" className="hover:underline">
          Términos y condiciones
        </a>
      </footer>
    </div>
  );
};
