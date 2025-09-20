import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { OrderStatus } from '../schemas/order-status.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatus>
  ) {}

  // GET /transactions
  async fetchAll() {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'orderstatuses', // collection name (pluralized)
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info',
        },
      },
      { $unwind: { path: '$status_info', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: '$student_info.id',
        },
      },
      { $sort: { 'status_info.payment_time': -1 } },
    ];

    return this.orderModel.aggregate(pipeline).exec();
  }

  // GET /transactions/school/:schoolId
  async fetchBySchool(schoolId: string) {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'orders',
          localField: 'collect_id',
          foreignField: '_id',
          as: 'order',
        },
      },
      { $unwind: '$order' },
      { $match: { 'order.school_id': schoolId } },
      {
        $project: {
          collect_id: '$collect_id',
          school_id: '$order.school_id',
          gateway: '$gateway',
          order_amount: '$order_amount',
          transaction_amount: '$transaction_amount',
          status: '$status',
          custom_order_id: '$custom_order_id', // or map from student_info.id if needed
          payment_time: '$payment_time',
        },
      },
    ];
    return this.orderStatusModel.aggregate(pipeline).exec();
  }

  // GET /transaction-status/:custom_order_id
  async checkStatusByCustomOrderId(customOrderId: string) {
    // If custom_order_id is derived from student_info.id, adjust this query
    return this.orderStatusModel.findOne({ custom_order_id: customOrderId }).lean();
  }
}
