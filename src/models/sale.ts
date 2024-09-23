import mongoose, { Schema, Model } from 'mongoose'
import { AppService } from '../services/appService'
import { Labels, AppConstant } from '../constant'

interface SaleAttrs {
  name: string;
  productId: string;
  brandId: string;
  shopId: string;
  shopName: string;
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
  discount: number;
  orderAmount: number;
  qty: number,
  qtyPerBox: number;
  image: string;
  date: Date;
  dateNum: number;
}


interface SaleModal extends Model<SaleDoc> {
  build(attrs: SaleAttrs): SaleDoc //build return a user that mines a refrance of SaleDoc so the type is SaleDoc
}


interface SaleDoc extends mongoose.Document {
  name: string;
  productId: string;
  brandId: string;
  shopId: string;
  shopName: string;
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
  discount: number;
  orderAmount: number;
  qty: number,
  qtyPerBox: number;
  image: string;
  status: string;
  date: Date;
  dateNum: number;
  createdAt: Date;
  updatedAt: Date;
}

const saleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      required: false,
      default: ""
    },
    productId: { type: Schema.Types.ObjectId, required: true },
    brandId: { type: Schema.Types.ObjectId, required: true },
    warehouseId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    shopName: {
      type: String,
      required: true
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
    discount: {
      type: Number,
      required: true,
    },
    orderAmount: {   // selling price * qty
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
        Labels.status.deleted
      ],
      default: Labels.status.active,
    },
    date: {
      type: Date,
      required: true
    },
    dateNum: {
      type: Number,
      required: true
    }
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

saleSchema.pre('save', async function (done) {
  if (this.isModified('name')) {
    const name = AppService.capitalizeFirstLetter(this.get('name'));
    this.set('name', name);
  }
  done()
})

saleSchema.statics.build = (attrs: SaleAttrs) => {
  return new Sale(attrs)
}
const Sale = mongoose.model<any, SaleModal>('sale', saleSchema)

export { Sale }
