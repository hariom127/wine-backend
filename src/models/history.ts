import mongoose, { Schema, Model, Types } from 'mongoose'
import { AppService } from '../services/appService'
import { Labels, AppConstant } from '../constant'

interface HistoryAttrs {
  name: string;
  shopProductId?: Types.ObjectId;
  saleId?: Types.ObjectId;
  productId: Types.ObjectId;
  brandId: string;
  shopId: string;
  warehouseId: string;
  userId: string | undefined;
  category: {
    _id: string;
    name: string;
  };
  packing: string;
  MRP: number;
  purchasePrice: number;
  sellingPrice: number;
  qty: number,
  qtyPerBox: number;
  image?: string;
  from: string;
  to: string;
}


interface HistoryModal extends Model<HistoryDoc> {
  build(attrs: HistoryAttrs): HistoryDoc //build return a user that mines a refrance of HistoryDoc so the type is HistoryDoc
}


interface HistoryDoc extends mongoose.Document {
  name: string;
  saleId: Types.ObjectId;
  productId: Types.ObjectId;
  brandId: Types.ObjectId;
  shopId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  userId: Types.ObjectId;
  packing: string;
  MRP: number;
  purchasePrice: number;
  sellingPrice: number;
  qty: number;
  image: string;
  category: {
    _id: string;
    name: string;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const historySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    id: { type: String, required: false },
    saleId: { type: Schema.Types.ObjectId, required: false },
    productId: { type: Schema.Types.ObjectId, required: true },
    brandId: { type: Schema.Types.ObjectId, required: true },
    warehouseId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
    },
    category: {
      _id: { type: Schema.Types.ObjectId },
      name: { type: String }
    },
    packing: {
      type: String,
      trim: true,
    },
    MRP: {
      type: Number,
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    qtyPerBox: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      trim: true,
      default: AppConstant.BRAND_CONSTANT
    },
    status: {
      type: String,
      enum: [
        Labels.status.active,
        Labels.status.inactive
      ],
      default: Labels.status.active,
    },
    from: {
      type: String,
      enum: [
        Labels.transferStage.fromX,
        Labels.transferStage.depo,
        Labels.transferStage.warehouse,
        Labels.transferStage.shop
      ]
    },
    to: {
      type: String,
      enum: [
        Labels.transferStage.fromX,
        Labels.transferStage.depo,
        Labels.transferStage.warehouse,
        Labels.transferStage.shop,
        Labels.transferStage.customer,
      ]
    },
    dateNum: { type: Number, default: Date.now }
  },
  {
    timestamps: true,
    // filter response
    toJSON: {
      transform(doc, ret) {
        (ret.id = ret._id), delete ret._id
      }
    },
  },
)

historySchema.pre('save', async function (done) {
  if (this.isModified('name')) {
    const name = AppService.capitalizeFirstLetter(this.get('name'));
    this.set('name', name);
  }
  done()
})

historySchema.statics.build = (attrs: HistoryAttrs) => {
  return new History(attrs)
}
const History = mongoose.model<any, HistoryModal>('history', historySchema)

export { History }
