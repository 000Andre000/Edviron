import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookDto } from './dto/webhook.dto';

@Controller()
export class WebhookController {
  private logger = new Logger(WebhookController.name);
  constructor(private webhookService: WebhookService) {}

  // No auth — webhooks typically are public but you can implement verification
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() payload: WebhookDto) {
    this.logger.log('Received webhook: ' + JSON.stringify(payload));
    await this.webhookService.processWebhook(payload);
    return { ok: true };
  }
}
