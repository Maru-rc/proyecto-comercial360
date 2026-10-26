import { describe, it, expect, vi } from 'vitest';
import { Logger } from '@nestjs/common';
import { createEmailSender } from './create-email-sender.js';
import { LogEmailSender } from './log-email-sender.adapter.js';
import { SesEmailSender } from './ses-email-sender.adapter.js';

const message = { to: 'a@b.com', subject: 'Asunto', text: 'enlace-secreto' };

describe('createEmailSender', () => {
  it('falls back to the log adapter when no provider is configured', () => {
    expect(createEmailSender({})).toBeInstanceOf(LogEmailSender);
  });

  it('MAIL_FROM builds the SES adapter', () => {
    expect(
      createEmailSender({
        MAIL_FROM: 'no-reply@comercial360.com',
        AWS_REGION: 'us-east-1',
      }),
    ).toBeInstanceOf(SesEmailSender);
  });

  it('MAIL_FROM without a region fails at startup', () => {
    expect(() =>
      createEmailSender({ MAIL_FROM: 'no-reply@comercial360.com' }),
    ).toThrow(/SES_REGION/);
  });
});

describe('LogEmailSender', () => {
  it('outside production logs the message so the flow works locally', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    await new LogEmailSender(true).send(message);
    expect(log.mock.calls[0][0]).toContain('enlace-secreto');
    log.mockRestore();
  });

  it('in production never writes the content (the link is a credential)', async () => {
    const warn = vi
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
    await new LogEmailSender(false).send(message);
    expect(warn.mock.calls[0][0]).not.toContain('enlace-secreto');
    warn.mockRestore();
  });
});

describe('SesEmailSender', () => {
  it('sends through SES v2 with the configured sender, region and bodies', async () => {
    const sent: unknown[] = [];
    const regions: string[] = [];
    const sdk = {
      SESv2Client: class {
        constructor(config: { region: string }) {
          regions.push(config.region);
        }
        async send(command: unknown) {
          sent.push(command);
        }
      },
      SendEmailCommand: class {
        constructor(readonly input: unknown) {}
      },
    };
    const sender = new SesEmailSender('no-reply@c360.com', 'us-east-1', () =>
      Promise.resolve(sdk),
    );

    await sender.send({ ...message, html: '<p>hola</p>' });
    await sender.send(message);

    expect(regions).toEqual(['us-east-1']); // the client is reused
    expect(sent).toHaveLength(2);
    expect((sent[0] as { input: unknown }).input).toMatchObject({
      FromEmailAddress: 'no-reply@c360.com',
      Destination: { ToAddresses: ['a@b.com'] },
      Content: {
        Simple: {
          Subject: { Data: 'Asunto' },
          Body: {
            Text: { Data: 'enlace-secreto' },
            Html: { Data: '<p>hola</p>' },
          },
        },
      },
    });
  });
});
