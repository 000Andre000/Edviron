import { IsObject, IsOptional, IsString } from 'class-validator';

export class WebhookDto {
  @IsOptional()
  status: number;

  @IsObject()
  order_info: {
    order_id: string; // collect_id or transaction id
    order_amount?: number;
    transaction_amount?: number;
    gateway?: string;
    bank_reference?: string;
    status?: string;
    payment_mode?: string;
    payemnt_details?: string;
    Payment_message?: string;
    payment_time?: string;
    error_message?: string;
    custom_order_id?: string;
  };
}
