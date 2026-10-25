import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_SENDER } from '../ports/email-sender.port.js';
import type { EmailSender } from '../ports/email-sender.port.js';

export interface PasswordResetRequest {
  readonly email: string;
  readonly name?: string | null;
  /** One-time link built by Better Auth; expires with the token. */
  readonly url: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** HU-22: sends the password recovery link to the account owner. */
@Injectable()
export class SendPasswordResetEmailUseCase {
  constructor(@Inject(EMAIL_SENDER) private readonly sender: EmailSender) {}

  async execute(request: PasswordResetRequest): Promise<void> {
    const greeting = request.name ? `Hola ${request.name},` : 'Hola,';
    await this.sender.send({
      to: request.email,
      subject: 'Comercial 360 · Restablece tu contraseña',
      text: [
        greeting,
        '',
        'Recibimos una solicitud para restablecer tu contraseña.',
        `Abre este enlace para elegir una nueva (vence en 1 hora): ${request.url}`,
        '',
        'Si no fuiste tú, ignora este correo: tu contraseña sigue igual.',
      ].join('\n'),
      html: `<p>${escapeHtml(greeting)}</p>
<p>Recibimos una solicitud para restablecer tu contraseña.</p>
<p><a href="${escapeHtml(request.url)}">Elegir una nueva contraseña</a> (el enlace vence en 1 hora).</p>
<p>Si no fuiste tú, ignora este correo: tu contraseña sigue igual.</p>`,
    });
  }
}
