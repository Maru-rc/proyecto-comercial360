import type { EmailSender } from '../../application/ports/email-sender.port.js';
import { LogEmailSender } from './log-email-sender.adapter.js';
import { SesEmailSender } from './ses-email-sender.adapter.js';

/**
 * MAIL_FROM enables Amazon SES (region from SES_REGION or AWS_REGION).
 * Without it, the log adapter is used.
 */
export function createEmailSender(
  env: NodeJS.ProcessEnv = process.env,
): EmailSender {
  const from = env.MAIL_FROM?.trim();
  if (from) {
    const region = env.SES_REGION || env.AWS_REGION;
    if (!region) {
      throw new Error('MAIL_FROM requires SES_REGION (or AWS_REGION)');
    }
    return new SesEmailSender(from, region);
  }
  return new LogEmailSender(env.NODE_ENV !== 'production');
}
