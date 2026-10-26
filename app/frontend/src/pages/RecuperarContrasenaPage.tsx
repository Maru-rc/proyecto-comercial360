import React, { useState } from 'react';
import { requestPasswordReset } from '../api/auth';
import { AuthCard } from '../components/auth/AuthCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const RecuperarContrasenaPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setEnviado(true);
    } catch {
      setError('No pudimos procesar la solicitud. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="¿Olvidaste tu contraseña?"
      description="Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una nueva."
    >
      {enviado ? (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800"
        >
          Si el correo está registrado, recibirás un enlace en los próximos
          minutos. El enlace vence en 1 hora.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tuusuario@empresa.com"
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
            Enviar enlace
          </Button>
        </form>
      )}
    </AuthCard>
  );
};
