import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { AuthCard } from '../components/auth/AuthCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

const MIN_PASSWORD_LENGTH = 8;

export const RestablecerContrasenaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Better Auth redirects here with ?token=… or ?error=INVALID_TOKEN
  const token = searchParams.get('token');
  const linkError = searchParams.get('error');

  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await resetPassword(token!, password);
      setListo(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch {
      setError('El enlace no es válido o ya venció. Solicita uno nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || linkError) {
    return (
      <AuthCard
        title="Enlace no válido"
        description="El enlace de recuperación venció o ya fue usado."
      >
        <Button
          variant="primary"
          className="w-full"
          onClick={() => navigate('/recuperar-contrasena')}
        >
          Solicitar un nuevo enlace
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nueva contraseña"
      description="Elige una contraseña nueva. Se cerrarán las sesiones abiertas de tu cuenta."
    >
      {listo ? (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800"
        >
          Contraseña actualizada. Te llevamos a iniciar sesión...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            required
          />
          {error && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            Guardar contraseña
          </Button>
        </form>
      )}
    </AuthCard>
  );
};
