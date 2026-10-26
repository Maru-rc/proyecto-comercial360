import { Logger } from '@nestjs/common';
import type {
  EmailMessage,
  EmailSender,
} from '../../application/ports/email-sender.port.js';

/**
 * Fallback when no email provider is configured. Outside production the
 * message is written to the log so the flow can be used locally; in
 * production only a warning is logged, never the link.
 */
export class LogEmailSender implements EmailSender {
  private readonly logger = new Logger('EmailSender');

  constructor(private readonly exposeContent: boolean) {}

  async send(message: EmailMessage): Promise<void> {
    if (this.exposeContent) {
      this.logger.log(
        `Email to ${message.to} | ${message.subject}\n${message.text}`,
      );
      return;
    }
    this.logger.warn(
      `Email to ${message.to} not sent: set MAIL_FROM to deliver "${message.subject}"`,
    );
  }
}
