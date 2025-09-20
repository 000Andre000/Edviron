import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    private config: ConfigService
  ) {}

  async createCollectRequest(body: CreatePaymentDto) {
    const { school_id, amount, callback_url } = body;
    console.log(body);
    if (!school_id || !amount || !callback_url) {
      throw new BadRequestException('school_id, amount, callback_url required');
       
    }

    const pgKey = this.config.get('PG_KEY'); // edvtest01
    const apiKey = this.config.get('PAYMENT_API_KEY'); // given JWT
    const base = this.config.get('PAYMENT_BASE'); // https://dev-vanilla.edviron.com/erp
    console.log(pgKey);
    if (!pgKey || !apiKey || !base) throw new BadRequestException('Payment credentials missing');

    // ✅ sign payload exactly as per docs
    const signPayload = { school_id, amount, callback_url };
    const sign = jwt.sign(signPayload, pgKey);

    // ✅ call Edviron API
    const url = `${base}/create-collect-request`;
    const resp = await axios.post(
      url,
      { school_id, amount, callback_url, sign },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const data = resp.data;

    // ✅ Save locally
    const order = new this.orderModel({
      school_id,
      gateway_name: 'EdvironGateway',
    });
    await order.save();

    const orderStatus = new this.orderStatusModel({
      collect_id: order._id,
      order_amount: Number(amount),
      transaction_amount: 0,
      status: 'INITIATED',
      gateway: 'EdvironGateway',
    });
    await orderStatus.save();

    return {
      collect_request_id: data.collect_request_id,
      payment_url: data.Collect_request_url,
      sign: data.sign,
    };
  }

  async checkPaymentStatus(collect_request_id: string, school_id: string) {
    const pgKey = this.config.get('PAYMENT_PG_KEY');
    const apiKey = this.config.get('PAYMENT_API_KEY');
    const base = this.config.get('PAYMENT_BASE');

    const signPayload = { school_id, collect_request_id };
    const sign = jwt.sign(signPayload, pgKey);

    const url = `${base}/collect-request/${collect_request_id}?school_id=${school_id}&sign=${sign}`;
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    return resp.data;
  }
}

// import { Injectable, BadRequestException, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as jwt from 'jsonwebtoken';
// import axios from 'axios';
// import { ConfigService } from '@nestjs/config';
// import { Order, OrderDocument } from '../schemas/order.schema';
// import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
// import { CreatePaymentDto } from './dto/create-payment.dto';

// @Injectable()
// export class PaymentsService {
//   private logger = new Logger(PaymentsService.name);

//   constructor(
//     @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
//     @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
//     private config: ConfigService
//   ) {}

//   async createCollectRequest(body: CreatePaymentDto) {
//     const { school_id, amount, callback_url } = body;
//     this.logger.log('Create payment request:', body);
    
//     if (!school_id || !amount || !callback_url) {
//       throw new BadRequestException('school_id, amount, callback_url required');
//     }

//     // Use consistent environment variable names
//     const pgKey = this.config.get('PG_KEY'); 
//     const apiKey = this.config.get('PAYMENT_API_KEY'); 
//     const base = this.config.get('PAYMENT_BASE'); 
    
//     this.logger.log('Environment variables check:', { 
//       pgKey: !!pgKey, 
//       apiKey: !!apiKey, 
//       base: !!base 
//     });
    
//     if (!pgKey || !apiKey || !base) {
//       throw new BadRequestException('Payment credentials missing');
//     }

//     try {
//       // Save locally FIRST to get the internal order ID
//       const order = new this.orderModel({
//         school_id,
//         gateway_name: 'EdvironGateway',
//         amount: Number(amount),
//         callback_url,
//         status: 'CREATING',
//       });
//       await order.save();
//       this.logger.log('Order created with ID:', order._id.toString());

//       // Sign payload exactly as per docs
//       const signPayload = { school_id, amount, callback_url };
//       const sign = jwt.sign(signPayload, pgKey);

//       // Call Edviron API
//       const url = `${base}/create-collect-request`;
//       this.logger.log('Making request to:', url);
      
//       const resp = await axios.post(
//         url,
//         { school_id, amount, callback_url, sign },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${apiKey}`,
//           },
//         },
//       );

//       const data = resp.data;
//       this.logger.log('API response:', data);

//       // Update order with collect_request_id
//       order.collect_request_id = data.collect_request_id;
//       order.status = 'INITIATED';
//       await order.save();

//       const orderStatus = new this.orderStatusModel({
//         collect_id: order._id,
//         collect_request_id: data.collect_request_id,
//         order_amount: Number(amount),
//         transaction_amount: 0,
//         status: 'INITIATED',
//         gateway: 'EdvironGateway',
//         school_id,
//         payment_url: data.Collect_request_url,
//       });
//       await orderStatus.save();

//       return {
//         collect_request_id: data.collect_request_id,
//         payment_url: data.Collect_request_url,
//         sign: data.sign,
//         order_id: order._id.toString(), // Convert ObjectId to string
//         internal_order_id: order._id.toString(), // Also provide as internal_order_id
//       };
//     } catch (error) {
//       this.logger.error('Error creating payment:', error.response?.data || error.message);
      
//       // If it's an axios error, provide more details
//       if (error.response) {
//         throw new BadRequestException(
//           `Payment API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
//         );
//       } else if (error.code) {
//         // MongoDB error
//         throw new BadRequestException(
//           `Database Error: ${error.message}`
//         );
//       } else {
//         throw new BadRequestException(
//           `Payment creation failed: ${error.message}`
//         );
//       }
//     }
//   }

//   async checkPaymentStatus(collect_request_id: string, school_id: string) {
//     try {
//       // Use same environment variable name as create
//       const pgKey = this.config.get('PG_KEY');
//       const apiKey = this.config.get('PAYMENT_API_KEY');
//       const base = this.config.get('PAYMENT_BASE');

//       if (!pgKey || !apiKey || !base) {
//         throw new BadRequestException('Payment credentials missing');
//       }

//       this.logger.log('Checking payment status:', { collect_request_id, school_id });

//       // Create JWT sign payload as per API docs
//       const signPayload = { school_id, collect_request_id };
//       const sign = jwt.sign(signPayload, pgKey);

//       // Make API call to Edviron
//       const url = `${base}/collect-request/${collect_request_id}?school_id=${school_id}&sign=${sign}`;
//       this.logger.log('Status check URL:', url);

//       const resp = await axios.get(url, {
//         headers: { 
//           'Authorization': `Bearer ${apiKey}`,
//           'Content-Type': 'application/json'
//         },
//       });

//       this.logger.log('Gateway status response:', resp.data);

//       // Update local status if we have a record
//       const orderStatus = await this.orderStatusModel.findOne({ 
//         collect_request_id 
//       });
      
//       if (orderStatus && resp.data.status) {
//         const oldStatus = orderStatus.status;
//         orderStatus.status = resp.data.status;
        
//         if (resp.data.amount) {
//           orderStatus.transaction_amount = resp.data.amount;
//         }
        
//         orderStatus.gateway_response = resp.data;
//         await orderStatus.save();
        
//         this.logger.log(`Updated local status from ${oldStatus} to ${orderStatus.status}`);
//       }

//       return {
//         collect_request_id,
//         school_id,
//         status: resp.data.status,
//         amount: resp.data.amount,
//         details: resp.data.details,
//         jwt: resp.data.jwt,
//         gateway_response: resp.data,
//         last_checked: new Date().toISOString()
//       };
//     } catch (error) {
//       this.logger.error('Error checking payment status:', {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         collect_request_id,
//         school_id
//       });
      
//       if (error.response) {
//         throw new BadRequestException(
//           `Gateway API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
//         );
//       } else {
//         throw new BadRequestException(
//           `Status check failed: ${error.message}`
//         );
//       }
//     }
//   }

//   // Updated method to check status by our internal order ID
//   async checkStatusByOrderId(orderId: string) {
//     try {
//       this.logger.log('Checking status for internal order ID:', orderId);
      
//       // Validate ObjectId format
//       if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
//         throw new BadRequestException('Invalid order ID format');
//       }

//       // Find the order and its status
//       const order = await this.orderModel.findById(orderId);
//       const orderStatus = await this.orderStatusModel.findOne({ 
//         collect_id: orderId 
//       });
      
//       if (!order) {
//         throw new BadRequestException('Order not found');
//       }

//       if (!orderStatus) {
//         throw new BadRequestException('Order status record not found');
//       }

//       this.logger.log('Found local records:', { 
//         order: order.toObject(), 
//         orderStatus: orderStatus.toObject() 
//       });

//       // Get fresh status from payment gateway using the stored collect_request_id and school_id
//       let gatewayStatus = null;
//       if (orderStatus.collect_request_id && orderStatus.school_id) {
//         try {
//           this.logger.log('Fetching fresh status from gateway...');
//           gatewayStatus = await this.checkPaymentStatus(
//             orderStatus.collect_request_id, 
//             orderStatus.school_id
//           );
//         } catch (gatewayError) {
//           this.logger.warn('Failed to get fresh gateway status:', gatewayError.message);
//           // Don't throw error, still return local data with error info
//           gatewayStatus = {
//             error: gatewayError.message,
//             last_attempted: new Date().toISOString()
//           };
//         }
//       } else {
//         this.logger.warn('Missing collect_request_id or school_id for gateway status check');
//         gatewayStatus = {
//           error: 'Missing collect_request_id or school_id for gateway status check',
//           collect_request_id: orderStatus.collect_request_id,
//           school_id: orderStatus.school_id
//         };
//       }

//       return {
//         internal_order_id: orderId,
//         order_details: {
//           id: order._id.toString(),
//           school_id: order.school_id,
//           gateway_name: order.gateway_name,
//           collect_request_id: order.collect_request_id,
//           amount: order.amount,
//           callback_url: order.callback_url,
//           created_at: order.createdAt,
//           updated_at: order.updatedAt
//         },
//         local_status: {
//           id: orderStatus._id.toString(),
//           order_amount: orderStatus.order_amount,
//           transaction_amount: orderStatus.transaction_amount,
//           status: orderStatus.status,
//           gateway: orderStatus.gateway,
//           collect_request_id: orderStatus.collect_request_id,
//           school_id: orderStatus.school_id,
//           payment_url: orderStatus.payment_url,
//           created_at: orderStatus.createdAt,
//           updated_at: orderStatus.updatedAt
//         },
//         gateway_status: gatewayStatus,
//         last_checked: new Date().toISOString()
//       };
//     } catch (error) {
//       this.logger.error('Error checking status by order ID:', error.message);
//       throw new BadRequestException(
//         `Status check failed: ${error.message}`
//       );
//     }
//   }
// }