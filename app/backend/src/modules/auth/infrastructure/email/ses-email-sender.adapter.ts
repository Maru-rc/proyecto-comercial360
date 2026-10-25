import type {
  EmailMessage,
  EmailSender,
} from '../../application/ports/email-sender.port.js';

/** Minimal surface of @aws-sdk/client-sesv2 used by this adapter. */
interface SesV2Module {
  SESv2Client: new (config: { region: string }) => {
    send(command: unknown): Promise<unknown>;
  };
  SendEmailCommand: new (input: unknown) => unknown;
}

// Resolved at runtime so the SDK is only required when SES is enabled
const SES_SDK = '@aws-sdk/client-sesv2';

/**
 * Amazon SES v2 adapter. Credentials come from the default AWS chain
 * (instance role, env vars), as with S3.
 */
export class SesEmailSender implements EmailSender {
  private client?: InstanceType<SesV2Module['SESv2Client']>;
  private sdk?: SesV2Module;

  constructor(
    private readonly from: string,
    private readonly region: string,
    private readonly loadSdk: () => Promise<SesV2Module> = () =>
      import(SES_SDK) as Promise<SesV2Module>,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    if (!this.sdk || !this.client) {
      this.sdk = await this.loadSdk();
      this.client = new this.sdk.SESv2Client({ region: this.region });
    }
    await this.client.send(
      new this.sdk.SendEmailCommand({
        FromEmailAddress: this.from,
        Destination: { ToAddresses: [message.to] },
        Content: {
          Simple: {
            Subject: { Data: message.subject, Charset: 'UTF-8' },
            Body: {
              Text: { Data: message.text, Charset: 'UTF-8' },
              ...(message.html
                ? { Html: { Data: message.html, Charset: 'UTF-8' } }
                : {}),
            },
          },
        },
      }),
    );
  }
}
