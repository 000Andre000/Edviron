import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class CreatePaymentDto {

  @IsNotEmpty()  // or @IsNotEmpty() if required
  school_id?: string;

  @IsNotEmpty()
  amount: string;

  @IsNotEmpty()
  callback_url?: string;

  

  // @IsOptional()
  // student_info?: any;

  // @IsOptional()
  // custom_order_id?: string;
}