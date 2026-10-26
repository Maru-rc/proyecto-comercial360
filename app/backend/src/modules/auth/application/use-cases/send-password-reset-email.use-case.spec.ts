import { describe, it, expect } from 'vitest';
import { SendPasswordResetEmailUseCase } from './send-password-reset-email.use-case.js';
import type { EmailMessage, EmailSender } from '../ports/email-sender.port.js';

class CapturingSender implements EmailSender {
  sent: EmailMessage[] = [];
  async send(message: EmailMessage): Promise<void> {
    this.sent.push(message);
  }
}

describe('SendPasswordResetEmailUseCase (HU-22)', () => {
  it('sends the link to the account email in both text and html', async () => {
    const sender = new CapturingSender();
    await new SendPasswordResetEmailUseCase(sender).execute({
      email: 'asesor@comercial360.com',
      name: 'Ana',
      url: 'https://app.example.com/api/auth/reset-password/tok123',
    });

    const [message] = sender.sent;
    expect(message.to).toBe('asesor@comercial360.com');
    expect(message.subject).toMatch(/contraseña/);
    expect(message.text).toContain('Hola Ana,');
    expect(message.text).toContain('/reset-password/tok123');
    expect(message.html).toContain(
      'href="https://app.example.com/api/auth/reset-password/tok123"',
    );
  });

  it('escapes the user name in the html body', async () => {
    const sender = new CapturingSender();
    await new SendPasswordResetEmailUseCase(sender).execute({
      email: 'x@y.com',
      name: '<script>alert(1)</script>',
      url: 'https://app.example.com/r?a=1&b=2',
    });
    const html = sender.sent[0].html!;
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('a=1&amp;b=2');
  });

  it('greets without a name when the account has none', async () => {
    const sender = new CapturingSender();
    await new SendPasswordResetEmailUseCase(sender).execute({
      email: 'x@y.com',
      url: 'https://app.example.com/r',
    });
    expect(sender.sent[0].text.startsWith('Hola,')).toBe(true);
  });
});
