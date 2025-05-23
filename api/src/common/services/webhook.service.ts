import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WebhookPayload {
  type: string;
  id: number;
  oldState?: string;
  newState: string;

  [key: string]: any;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private webhookUrl: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('WEBHOOK_URL');
  }

  async sendWebhook(payload: WebhookPayload): Promise<void> {
    this.logger.log(
      `Sending webhook for type: ${payload.type}, ID: ${payload.id}, Old State: ${payload.oldState}, New State: ${payload.newState}`,
    );
    if (this.webhookUrl) {
      try {
        await axios.post(this.webhookUrl, payload);
        this.logger.log(`Webhook sent successfully to ${this.webhookUrl}`);
      } catch (error) {
        this.logger.error(
          `Failed to send webhook to ${this.webhookUrl}: ${error.message}`,
        );
      }
    } else {
      this.logger.warn(
        'WEBHOOK_URL not configured. Skipping actual webhook call.',
      );
    }
  }
}
