import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

@Schema({ timestamps: true })
export class WebhookLog {
  @Prop()
  event: string;

  // Explicitly define payload type
  @Prop({ type: Object })  
  payload: Record<string, any>;

  @Prop()
  status: number;

  @Prop({ default: Date.now })
  receivedAt: Date;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);
